
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Layout } from './components/Layout';
import { CodeViewer } from './components/CodeViewer';
import { Curriculum } from './components/Curriculum';
import { Playground } from './components/Playground';
import { StudyGuide } from './components/StudyGuide';
import { GapFiller } from './components/GapFiller';
import { Admin } from './components/Admin';
import { Auth } from './components/Auth';
import { QuestionPage } from './components/QuestionPage';
import { ProblemSolving } from './components/ProblemSolving';
import { Settings } from './components/Settings';
import { NoticePage } from './components/NoticePage';
import { AppRoute, UserProfile, Lesson, Track, Problem } from './types';
import { ALL_TRACKS } from './contentData';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, HelpCircle, Target, Loader2, Brain, Terminal, ChevronRight, Rocket, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import { supabase } from './lib/supabase';

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const loadingInProgress = useRef(false);

  // 테마 적용 효과
  useEffect(() => {
    if (user?.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [user?.theme]);

  const [sessionResults, setSessionResults] = useState<Record<string, { 
    results: Record<number, any>; 
    answers: Record<number, string>;
  }>>({
    quiz: { results: {}, answers: {} },
    coding: { results: {}, answers: {} }
  });

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
      if (!session?.user) return { error: 'No session' };
      
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
        
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("DB Sync Error:", err);
      return { error: err.message };
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
    if (selectedLesson.id === 'temp-review-lesson') {
      const allReviewProblems = [...selectedLesson.conceptProblems, ...selectedLesson.codingProblems];
      const newlySolvedIds = allReviewProblems.filter(p => !missedFromProblemSolving.find(m => m.id === p.id)).map(p => p.id);
      if (newlySolvedIds.length > 0) {
        const updatedMissed = (user.missed_concepts || []).map(prob => newlySolvedIds.includes(prob.id) ? { ...prob, mastered: true } : prob);
        setUser(prev => prev ? { ...prev, missed_concepts: updatedMissed } : null);
        await syncProfileToDB({ missed_concepts: updatedMissed });
      }
      setActiveRoute(AppRoute.GAP_FILLER);
      setSelectedLesson(null);
      return;
    }
    const currentCompleted = user.completed_lesson_ids || [];
    const newCompletedIds = Array.from(new Set([...currentCompleted, selectedLesson.id]));
    const totalLessons = ALL_TRACKS.reduce((acc, track) => acc + (track.lessons?.length || 0), 0);
    const newProgress = Math.min(100, Math.round((newCompletedIds.length / totalLessons) * 100));
    const existingMissed = user.missed_concepts || [];
    const newMissedConcepts = [...existingMissed];
    missedFromProblemSolving.forEach(mp => {
      const idx = newMissedConcepts.findIndex(ex => ex.id === mp.id);
      if (idx === -1) newMissedConcepts.push({ ...mp, mastered: false });
      else newMissedConcepts[idx] = { ...newMissedConcepts[idx], mastered: false };
    });
    const updates = { completed_lesson_ids: newCompletedIds, progress: newProgress, missed_concepts: newMissedConcepts };
    setUser(prev => prev ? { ...prev, ...updates } : null);
    setActiveRoute(AppRoute.CURRICULUM);
    setSelectedLesson(null);
    setSessionResults({ quiz: { results: {}, answers: {} }, coding: { results: {}, answers: {} } });
    await syncProfileToDB({ ...updates, last_track_id: selectedTrack?.id || user.last_track_id });
  }, [selectedLesson, user, syncProfileToDB, selectedTrack]);

  const moveToNextStage = useCallback((missed: Problem[] = []) => {
    if (missed.length > 0 && user) {
      const existingMissed = user.missed_concepts || [];
      const newMissedConcepts = [...existingMissed];
      missed.forEach(mp => {
        const foundIdx = newMissedConcepts.findIndex(ex => ex.id === mp.id);
        if (foundIdx === -1) newMissedConcepts.push({ ...mp, mastered: false });
        else newMissedConcepts[foundIdx] = { ...newMissedConcepts[foundIdx], mastered: false };
      });
      setUser(prev => prev ? { ...prev, missed_concepts: newMissedConcepts } : null);
      syncProfileToDB({ missed_concepts: newMissedConcepts });
    }
    const currentIndex = availableStages.findIndex(s => s.stage === learningStage);
    if (currentIndex < availableStages.length - 1) setLearningStage(availableStages[currentIndex + 1].stage);
    else handleFinishLesson(missed);
  }, [availableStages, learningStage, handleFinishLesson, user, syncProfileToDB]);

  const handleStartReview = useCallback((problem: Problem) => {
    const tempLesson: Lesson = {
      id: 'temp-review-lesson', title: '약점 복습 모드', description: '틀렸던 문제를 다시 풀어보며 개념을 완벽히 이해합니다.',
      category: 'language', status: 'current', pages: [], 
      conceptProblems: problem.type === 'concept' ? [problem] : [],
      codingProblems: problem.type === 'coding' ? [problem] : []
    };
    setSelectedLesson(tempLesson);
    setLearningStage(problem.type === 'concept' ? 'quiz' : 'coding');
    setActiveRoute(AppRoute.LEARN);
    setSessionResults({ quiz: { results: {}, answers: {} }, coding: { results: {}, answers: {} } });
  }, []);

  const loadUserProgressFromDB = useCallback(async (userId: string, email: string, name: string) => {
    if (loadingInProgress.current) return;
    loadingInProgress.current = true;
    setIsLoading(true);
    setDbError(null);

    try {
      // 1. 프로필 데이터 조회
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      // 2. 기본 사용자 구조 준비
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
        updated_at: new Date().toISOString(),
        theme: profileData?.theme || 'dark'
      };

      // 3. 프로필이 없으면 '즉시' 생성 시도 (업서트 로직 강화)
      if (!profileData) {
        console.log("프로필 누락 감지: 신규 생성 중...");
        const { error: insertError } = await supabase.from('profiles').insert(userData);
        // 이미 트리거에 의해 생성되었을 수도 있으므로 에러가 나도 진행 (Conflict 방지)
        if (insertError && !insertError.message.includes('duplicate key')) {
          throw insertError;
        }
      } else if (email === ADMIN_EMAIL && profileData.role !== 'admin') {
        // 관리자 권한 강제 동기화
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        userData.role = 'admin';
      }

      setUser(userData);
      setIsLoggedIn(true);

      if (userData.last_track_id) {
        const track = ALL_TRACKS.find(t => t.id === userData.last_track_id);
        if (track) setSelectedTrack(track);
      }
    } catch (err: any) {
      console.error("프로필 동기화 오류:", err);
      setDbError(err.message || "데이터 로드 실패");
    } finally {
      setIsLoading(false);
      loadingInProgress.current = false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoggedIn(false);
    setUser(null);
    setSelectedTrack(null);
    setSelectedLesson(null);
    setActiveRoute(AppRoute.HOME);
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        await loadUserProgressFromDB(session.user.id, session.user.email || '', session.user.user_metadata?.full_name || '학습자');
      } else if (mounted) {
        setIsLoading(false);
      }
    };
    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user && mounted) {
        loadUserProgressFromDB(session.user.id, session.user.email || '', session.user.user_metadata?.full_name || '학습자');
      } else if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loadUserProgressFromDB]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#007AFF]" size={64} />
        <p className="text-white font-black text-xl tracking-tight">StepCode 환경 준비 중...</p>
        <p className="text-gray-500 text-xs animate-pulse mt-4">데이터 동기화 및 보안 정책 확인 중</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center gap-6">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold text-white">동기화 오류 발생</h2>
        <p className="text-gray-400 text-sm max-w-md">{dbError}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#007AFF] text-white rounded-xl font-bold cursor-pointer">다시 시도</button>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <Auth onLoginSuccess={(u) => { setIsLoggedIn(true); setUser(u); }} />;
  }

  return (
    <Layout activeRoute={activeRoute} setActiveRoute={setActiveRoute} user={user} onLogout={handleLogout}>
      <AnimatePresence mode="wait">
        <MotionDiv key={activeRoute} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
          {activeRoute === AppRoute.HOME && (
            <div className="p-8 lg:p-12 max-w-7xl mx-auto pb-32">
              <header className="mb-16">
                <h2 className="text-4xl lg:text-7xl font-black mb-4 tracking-tighter text-main">반가워요, {user.name}님!</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
                  <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center"><Target size={20} /></div>
                    <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Progress</p><p className="text-sm font-bold">{user.progress || 0}%</p></div>
                  </div>
                  <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center"><Rocket size={20} /></div>
                    <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current Level</p><p className="text-sm font-bold">Level {user.level || 1}</p></div>
                  </div>
                </div>
              </header>
              <section className="mb-20">
                <h3 className="flex items-center gap-3 text-xl font-bold mb-8 border-l-4 border-purple-500 pl-6 uppercase tracking-widest text-main"><Brain className="text-purple-400" size={24} /> 사고력 트랙</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ALL_TRACKS.filter(t => t.category === 'tutorial').map(track => (
                    <MotionDiv key={track.id} whileHover={{ y: -5, scale: 1.02 }} onClick={() => handleSelectTrack(track)} className="glass p-8 rounded-[40px] border-white/5 cursor-pointer hover:bg-white/[0.05] shadow-2xl relative overflow-hidden group">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white shadow-xl mb-6"><Brain size={28} /></div>
                      <h4 className="text-2xl font-bold mb-3 group-hover:text-white text-main">{track.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 h-12 line-clamp-2">{track.description}</p>
                      <div className="flex items-center gap-2 text-[#007AFF] text-xs font-bold uppercase tracking-widest">시작하기 <ChevronRight size={14} /></div>
                    </MotionDiv>
                  ))}
                </div>
              </section>
              <section className="mb-20">
                <h3 className="flex items-center gap-3 text-xl font-bold mb-8 border-l-4 border-[#007AFF] pl-6 uppercase tracking-widest text-main"><Terminal className="text-[#007AFF]" size={24} /> 언어 트랙</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ALL_TRACKS.filter(t => t.category === 'language').map(track => (
                    <MotionDiv key={track.id} whileHover={{ y: -5, scale: 1.02 }} onClick={() => handleSelectTrack(track)} className="glass p-8 rounded-[40px] border-white/5 cursor-pointer hover:bg-white/[0.05] shadow-2xl relative overflow-hidden group">
                      <div className="mb-6">{track.iconType === 'python' ? <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3776AB] to-[#FFD43B]/20 flex items-center justify-center font-black text-white shadow-xl text-xl">Py</div> : track.iconType === 'c' ? <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5C5C5C] to-[#004482] flex items-center justify-center font-black text-white shadow-xl text-2xl">C</div> : <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white shadow-xl"><Brain size={24} /></div>}</div>
                      <h4 className="text-2xl font-bold mb-3 group-hover:text-white text-main">{track.title}</h4>
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
                  <button key={s.stage} onClick={() => setLearningStage(s.stage)} className={`flex items-center gap-3 cursor-pointer ${learningStage === s.stage ? 'text-[#007AFF]' : 'text-gray-600'}`}>{s.icon} <span className="text-xs uppercase tracking-widest">{s.label}</span></button>
                ))}
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div id="learn-scroll-container" className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  {learningStage === 'concept' && <CodeViewer lesson={selectedLesson} onFinishConcept={() => moveToNextStage([])} />}
                  {learningStage === 'quiz' && (
                    <ProblemSolving 
                      problems={selectedLesson.conceptProblems} type="concept" 
                      savedResults={sessionResults.quiz.results} savedAnswers={sessionResults.quiz.answers}
                      onSaveProgress={(res, ans) => setSessionResults(prev => ({ ...prev, quiz: { results: res, answers: ans } }))}
                      onBackToConcept={() => setLearningStage('concept')} onFinish={missed => moveToNextStage(missed)} 
                    />
                  )}
                  {learningStage === 'coding' && (
                    <ProblemSolving 
                      problems={selectedLesson.codingProblems} type="coding" 
                      savedResults={sessionResults.coding.results} savedAnswers={sessionResults.coding.answers}
                      onSaveProgress={(res, ans) => setSessionResults(prev => ({ ...prev, coding: { results: res, answers: ans } }))}
                      onBackToConcept={() => setLearningStage('concept')} onFinish={missed => handleFinishLesson(missed)} 
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {activeRoute === AppRoute.CURRICULUM && (
            selectedTrack ? (
              <Curriculum onSelectLesson={l => { setSelectedLesson(l); setLearningStage(l.pages?.length > 0 ? 'concept' : 'quiz'); setActiveRoute(AppRoute.LEARN); }} selectedTrack={selectedTrack} onChangeTrack={() => handleSelectTrack(null)} completed_lesson_ids={user.completed_lesson_ids} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <BookOpen size={48} className="text-gray-600 mb-8" />
                <h2 className="text-3xl font-black mb-4 text-main">선택된 트랙이 없습니다</h2>
                <button onClick={() => setActiveRoute(AppRoute.HOME)} className="px-10 py-5 bg-[#007AFF] text-white rounded-2xl font-black cursor-pointer">홈으로 이동</button>
              </div>
            )
          )}
          {activeRoute === AppRoute.QUESTION && <QuestionPage user={user} />}
          {activeRoute === AppRoute.PLAYGROUND && <Playground />}
          {activeRoute === AppRoute.STUDY_GUIDE && <StudyGuide onStartPython={() => handleSelectTrack(ALL_TRACKS.find(t=>t.id==='py_basic')!)} onViewCurriculum={() => setActiveRoute(AppRoute.CURRICULUM)} onStartAlgorithm={() => handleSelectTrack(ALL_TRACKS.find(t=>t.id==='algo_tutorial')!)} />}
          {activeRoute === AppRoute.GAP_FILLER && (
            <GapFiller 
              missed_concepts={user.missed_concepts || []} 
              onStartReview={handleStartReview} 
              onUpdateUser={async (updates) => {
                const res = await syncProfileToDB(updates);
                if (res?.success) {
                  setUser(prev => prev ? { ...prev, ...updates } : null);
                }
                return res;
              }} 
            />
          )}
          {activeRoute === AppRoute.SETTINGS && <Settings user={user} onLogout={handleLogout} onUpdateUser={(updates) => {
            setUser(prev => prev ? { ...prev, ...updates } : null);
            syncProfileToDB(updates);
          }} />}
          {activeRoute === AppRoute.ADMIN && user.role === 'admin' && <Admin />}
          {activeRoute === AppRoute.NOTICE && <NoticePage user={user} />}
        </MotionDiv>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
