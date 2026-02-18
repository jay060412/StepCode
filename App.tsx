
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CodeViewer } from './components/CodeViewer';
import { AIChat } from './components/AIChat';
import { Curriculum } from './components/Curriculum';
import { Playground } from './components/Playground';
import { StudyGuide } from './components/StudyGuide';
import { GapFiller } from './components/GapFiller';
import { Admin } from './components/Admin';
import { Auth } from './components/Auth';
import { QuestionPage } from './components/QuestionPage';
import { ProblemSolving } from './components/ProblemSolving';
import { AppRoute, UserProfile, Lesson, Track, Problem } from './types';
import { ALL_TRACKS } from './contentData';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, HelpCircle, Target, Loader2, Brain, Terminal, ChevronRight, Rocket, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import { supabase } from './lib/supabase';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;

type LearningStage = 'concept' | 'quiz' | 'coding';

const ADMIN_EMAIL = 'jay447233@gmail.com';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [learningStage, setLearningStage] = useState<LearningStage>('concept');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAiMinimized, setIsAiMinimized] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const availableStages = useMemo(() => {
    if (!selectedLesson) return [];
    const stages: { stage: LearningStage; label: string; icon: React.ReactNode }[] = [];
    if (selectedLesson.pages && selectedLesson.pages.length > 0) {
      stages.push({ stage: 'concept', label: '관찰 (개념학습)', icon: <PlayCircle size={14} /> });
    }
    if (selectedLesson.conceptProblems && selectedLesson.conceptProblems.length > 0) {
      stages.push({ stage: 'quiz', label: '검증 (개념퀴즈)', icon: <HelpCircle size={14} /> });
    }
    if (selectedLesson.codingProblems && selectedLesson.codingProblems.length > 0) {
      stages.push({ stage: 'coding', label: '구현 (코딩도전)', icon: <Target size={14} /> });
    }
    return stages;
  }, [selectedLesson]);

  const syncProfileToDB = useCallback(async (updates: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id,
          ...updates, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'id' });
      
      if (error) console.error("DB Sync Error:", error.message);
    } catch (err: any) {
      console.error("DB Sync Critical Error:", err.message);
    }
  }, []);

  const handleSelectTrack = useCallback((track: Track | null) => {
    setSelectedTrack(track);
    if (track) {
      setActiveRoute(AppRoute.CURRICULUM);
      syncProfileToDB({ last_track_id: track.id });
    } else {
      setActiveRoute(AppRoute.HOME);
      syncProfileToDB({ last_track_id: null });
    }
  }, [syncProfileToDB]);

  const handleFinishLesson = useCallback(async (missedFromProblemSolving: Problem[] = []) => {
    if (!selectedLesson || !user) return;

    const currentCompleted = user.completed_lesson_ids || [];
    const newCompletedIds = Array.from(new Set([...currentCompleted, selectedLesson.id]));
    
    const totalLessons = ALL_TRACKS.reduce((acc, track) => acc + (track.lessons?.length || 0), 0);
    const newProgress = Math.min(100, Math.round((newCompletedIds.length / totalLessons) * 100));

    const existingMissed = user.missed_concepts || [];
    const newMissedConcepts = [...existingMissed];
    missedFromProblemSolving.forEach(mp => {
      if (!newMissedConcepts.find(ex => ex.id === mp.id)) {
        newMissedConcepts.push(mp);
      }
    });

    const updates = { 
      completed_lesson_ids: newCompletedIds, 
      progress: newProgress,
      missed_concepts: newMissedConcepts 
    };

    setUser(prev => prev ? { ...prev, ...updates } : null);
    setActiveRoute(AppRoute.CURRICULUM);
    setSelectedLesson(null);

    await syncProfileToDB({
      ...updates,
      last_track_id: selectedTrack?.id || user.last_track_id
    });
  }, [selectedLesson, user, syncProfileToDB, selectedTrack]);

  const moveToNextStage = useCallback((missed: Problem[] = []) => {
    const currentIndex = availableStages.findIndex(s => s.stage === learningStage);
    if (currentIndex < availableStages.length - 1) {
      setLearningStage(availableStages[currentIndex + 1].stage);
    } else {
      handleFinishLesson(missed);
    }
  }, [availableStages, learningStage, handleFinishLesson]);

  const loadUserProgressFromDB = useCallback(async (userId: string, email: string, name: string) => {
    setIsProfileLoading(true);
    setDbError(null);

    try {
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      const userData: UserProfile = {
        id: userId,
        name: profileData?.name || name || '학습자',
        email: profileData?.email || email,
        level: profileData?.level || 1,
        progress: profileData?.progress || 0,
        missed_concepts: profileData?.missed_concepts || [],
        last_track_id: profileData?.last_track_id || null,
        completed_lesson_ids: profileData?.completed_lesson_ids || [],
        role: (email === ADMIN_EMAIL ? 'admin' : (profileData?.role || 'user')) as any,
        is_banned: profileData?.is_banned || false,
        updated_at: new Date().toISOString()
      };

      if (!profileData) {
        await supabase.from('profiles').upsert(userData);
      }

      setUser(userData);
      setIsLoggedIn(true);

      if (userData.last_track_id) {
        const track = ALL_TRACKS.find(t => t.id === userData.last_track_id);
        if (track) setSelectedTrack(track);
      }
    } catch (err: any) {
      console.error("loadUserProgressFromDB Error:", err);
      setDbError(err.message || "데이터 로드 실패");
    } finally {
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // 1. 모든 학습 상태 즉시 초기화 (UI 에러 방지)
      setIsLoggedIn(false);
      setUser(null);
      setSelectedTrack(null);
      setSelectedLesson(null);
      setActiveRoute(AppRoute.HOME);

      // 2. 세션 종료
      await supabase.auth.signOut();
      
      // 3. 새로고침 없이 루트로 이동 (SPA 방식)
      // 상태 초기화만으로도 <Auth /> 컴포넌트가 렌더링되므로 충분합니다.
    } catch (err) {
      console.error("Logout Error:", err);
      // 에러 발생 시에도 최소한 화면은 돌려놓음
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProgressFromDB(
          session.user.id, 
          session.user.email || '', 
          session.user.user_metadata?.full_name || '학습자'
        );
      } else {
        setIsInitialLoading(false);
      }
    };
    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        loadUserProgressFromDB(
          session.user.id, 
          session.user.email || '', 
          session.user.user_metadata?.full_name || '학습자'
        );
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setIsInitialLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProgressFromDB]);

  if (isInitialLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#007AFF]" size={64} />
        <p className="text-white font-black text-xl tracking-tight">StepCode 환경 준비 중...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center gap-6">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold text-white">데이터 동기화 오류</h2>
        <p className="text-gray-500">{dbError}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#007AFF] text-white rounded-xl font-bold">다시 시도</button>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <Auth onLoginSuccess={(u) => { setIsLoggedIn(true); setUser(u); }} />;
  }

  return (
    <Layout 
      activeRoute={activeRoute} 
      setActiveRoute={setActiveRoute} 
      user={user} 
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <MotionDiv key={activeRoute} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
          {activeRoute === AppRoute.HOME && (
            <div className="p-8 lg:p-12 max-w-7xl mx-auto pb-32">
              <header className="mb-16">
                <h2 className="text-4xl lg:text-7xl font-black mb-4 tracking-tighter text-white">반가워요, {user.name}님!</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
                  <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center"><Target size={20} /></div>
                    <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Progress</p><p className="text-sm font-bold text-white">{user.progress}%</p></div>
                  </div>
                  <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center"><Rocket size={20} /></div>
                    <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current Level</p><p className="text-sm font-bold text-white">Level {user.level}</p></div>
                  </div>
                </div>
              </header>
              <section className="mb-20">
                <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-6 uppercase tracking-widest">
                  <Brain className="text-purple-400" size={24} /> 사고력 트랙
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ALL_TRACKS.filter(t => t.category === 'tutorial').map(track => (
                    <MotionDiv key={track.id} whileHover={{ y: -5, scale: 1.02 }} onClick={() => handleSelectTrack(track)} className="glass p-8 rounded-[40px] border-white/5 cursor-pointer hover:bg-white/[0.05] shadow-2xl relative overflow-hidden group">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white shadow-xl mb-6"><Brain size={28} /></div>
                      <h4 className="text-2xl font-bold mb-3 group-hover:text-white">{track.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 h-12 line-clamp-2">{track.description}</p>
                      <div className="flex items-center gap-2 text-[#007AFF] text-xs font-bold uppercase tracking-widest">시작하기 <ChevronRight size={14} /></div>
                    </MotionDiv>
                  ))}
                </div>
              </section>
              <section className="mb-20">
                <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-8 border-l-4 border-[#007AFF] pl-6 uppercase tracking-widest">
                  <Terminal className="text-[#007AFF]" size={24} /> 언어 트랙
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ALL_TRACKS.filter(t => t.category === 'language').map(track => (
                    <MotionDiv key={track.id} whileHover={{ y: -5, scale: 1.02 }} onClick={() => handleSelectTrack(track)} className="glass p-8 rounded-[40px] border-white/5 cursor-pointer hover:bg-white/[0.05] shadow-2xl relative overflow-hidden group">
                      <div className="mb-6">{track.iconType === 'python' ? <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3776AB] to-[#FFD43B]/20 flex items-center justify-center font-black text-white shadow-xl text-xl">Py</div> : track.iconType === 'c' ? <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5C5C5C] to-[#004482] flex items-center justify-center font-black text-white shadow-xl text-2xl">C</div> : <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white shadow-xl"><Brain size={24} /></div>}</div>
                      <h4 className="text-2xl font-bold mb-3 group-hover:text-white">{track.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 h-12 line-clamp-2">{track.description}</p>
                      <div className="flex items-center gap-2 text-[#007AFF] text-xs font-bold uppercase tracking-widest">시작하기 <ChevronRight size={14} /></div>
                    </MotionDiv>
                  ))}
                </div>
              </section>
            </div>
          )}
          {activeRoute === AppRoute.LEARN && selectedLesson && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-black/40 border-b border-white/5 py-4 px-8 flex items-center justify-center gap-12 text-sm font-bold shrink-0">
                {availableStages.map(s => (
                  <button key={s.stage} onClick={() => setLearningStage(s.stage)} className={`flex items-center gap-3 ${learningStage === s.stage ? 'text-[#007AFF]' : 'text-gray-600'}`}>{s.icon} <span className="text-xs uppercase tracking-widest">{s.label}</span></button>
                ))}
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div id="learn-scroll-container" className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  {learningStage === 'concept' && <CodeViewer lesson={selectedLesson} onFinishConcept={() => moveToNextStage([])} />}
                  {learningStage === 'quiz' && <ProblemSolving problems={selectedLesson.conceptProblems} type="concept" onFinish={missed => moveToNextStage(missed)} />}
                  {learningStage === 'coding' && <ProblemSolving problems={selectedLesson.codingProblems} type="coding" onFinish={missed => handleFinishLesson(missed)} />}
                </div>
                <MotionDiv animate={{ width: isAiMinimized ? 72 : 320 }} className="hidden lg:block border-l border-white/5 bg-black/20 shrink-0 overflow-hidden">
                  <AIChat currentLesson={selectedLesson} currentStage={learningStage} isMinimized={isAiMinimized} onToggleMinimize={() => setIsAiMinimized(!isAiMinimized)} />
                </MotionDiv>
              </div>
            </div>
          )}
          {activeRoute === AppRoute.CURRICULUM && (
            selectedTrack ? (
              <Curriculum 
                onSelectLesson={l => { setSelectedLesson(l); setLearningStage(l.pages?.length > 0 ? 'concept' : 'quiz'); setActiveRoute(AppRoute.LEARN); }} 
                selectedTrack={selectedTrack} 
                onChangeTrack={() => handleSelectTrack(null)} 
                completed_lesson_ids={user.completed_lesson_ids} 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <BookOpen size={48} className="text-gray-600 mb-8" />
                <h2 className="text-3xl font-black text-white mb-4">선택된 트랙이 없습니다</h2>
                <button onClick={() => setActiveRoute(AppRoute.HOME)} className="px-10 py-5 bg-[#007AFF] text-white rounded-2xl font-black">홈으로 이동</button>
              </div>
            )
          )}
          {activeRoute === AppRoute.QUESTION && <QuestionPage user={user} />}
          {activeRoute === AppRoute.PLAYGROUND && <Playground />}
          {activeRoute === AppRoute.STUDY_GUIDE && <StudyGuide onStartPython={() => handleSelectTrack(ALL_TRACKS.find(t=>t.id==='py_basic')!)} onViewCurriculum={() => setActiveRoute(AppRoute.CURRICULUM)} onStartAlgorithm={() => handleSelectTrack(ALL_TRACKS.find(t=>t.id==='algo_tutorial')!)} />}
          {activeRoute === AppRoute.GAP_FILLER && <GapFiller missed_concepts={user.missed_concepts} onStartReview={() => {}} />}
          {activeRoute === AppRoute.ADMIN && user.role === 'admin' && <Admin />}
        </MotionDiv>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
