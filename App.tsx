
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
import { AppRoute, UserProfile, Lesson, Track } from './types';
import { ALL_TRACKS } from './contentData';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, Code2, Terminal, ChevronRight, BookOpen } from 'lucide-react';
import { supabase } from './lib/supabase';

const ADMIN_EMAIL = 'jay447233@gmail.com';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAiMinimized, setIsAiMinimized] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const syncTrackProgress = useCallback((tracks: Track[], completedIds: string[]): Track[] => {
    if (!tracks) return [];
    return tracks.map(track => {
      const newLessons = (track.lessons || []).map((lesson, idx) => {
        const isCompleted = completedIds.includes(lesson.id);
        let status: Lesson['status'] = 'locked';
        if (isCompleted) {
          status = 'completed';
        } else {
          const prevLessons = track.lessons.slice(0, idx);
          const allPrevCompleted = prevLessons.every(pl => completedIds.includes(pl.id));
          if (idx === 0 || allPrevCompleted) {
            status = 'current';
          }
        }
        return { ...lesson, status };
      });
      return { ...track, lessons: newLessons };
    });
  }, []);

  const loadUserProgressFromDB = useCallback(async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const metadataName = authUser.user_metadata?.full_name;
      const dbName = profileData?.name;
      
      let finalName = metadataName || dbName || '학습자';
      
      if (metadataName && dbName !== metadataName) {
        finalName = metadataName;
        await supabase
          .from('profiles')
          .update({ name: metadataName })
          .eq('id', userId);
      }

      setUser({
        id: authUser.id,
        name: finalName,
        email: authUser.email || '',
        level: profileData?.level || 1,
        progress: profileData?.progress || 0,
        missedConcepts: profileData?.missed_concepts || [],
        selectedTrackId: null,
        completedLessonIds: profileData?.completed_lesson_ids || []
      });
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Progress Load Error:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProgressFromDB(session.user.id);
      } else {
        setIsInitialLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProgressFromDB(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setIsInitialLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProgressFromDB]);

  const handleSelectTrack = (track: Track) => {
    const completedIds = user?.completedLessonIds || [];
    const syncedTrack = syncTrackProgress([track], completedIds)[0];
    setSelectedTrack(syncedTrack);
    setActiveRoute(AppRoute.CURRICULUM);
  };

  const tutorialTracks = useMemo(() => (ALL_TRACKS || []).filter(t => t.category === 'tutorial'), []);
  const languageTracks = useMemo(() => (ALL_TRACKS || []).filter(t => t.category === 'language'), []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-[#007AFF] rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
          <span className="text-white font-black text-3xl">S</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-1/2 h-full bg-[#007AFF]" />
          </div>
          <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">StepCode Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <Auth 
        onLoginSuccess={(newUser) => {
          setUser(newUser);
          setIsLoggedIn(true);
          loadUserProgressFromDB(newUser.id);
        }} 
      />
    );
  }

  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <Layout 
      activeRoute={activeRoute} 
      setActiveRoute={setActiveRoute} 
      user={user} 
      onLogout={async () => { 
        await supabase.auth.signOut(); 
        setIsLoggedIn(false); 
        setUser(null);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div key={activeRoute} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
          {activeRoute === AppRoute.HOME && (
            <div className="p-6 lg:p-12 space-y-24 max-w-7xl mx-auto pb-32 overflow-y-auto custom-scrollbar h-full">
              <header className="mb-12">
                <h2 className="text-3xl lg:text-5xl font-black mb-4 tracking-tighter text-white">반가워요, {user.name}님!</h2>
                <p className="text-gray-500 text-lg font-light">오늘은 어떤 성장을 이루어볼까요?</p>
              </header>

              {tutorialTracks.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400"><BrainCircuit size={24} /></div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">사고력 튜토리얼</h3>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tutorialTracks.map(track => (
                      <motion.div key={track.id} whileHover={{ y: -8 }} onClick={() => handleSelectTrack(track)} className="glass p-10 rounded-[40px] cursor-pointer border-white/5 flex flex-col h-full bg-gradient-to-br from-purple-500/5 to-transparent shadow-xl transition-all">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 bg-purple-500/10 text-purple-400">
                          {track.iconType === 'algorithm' ? <Sparkles size={28} /> : <BrainCircuit size={28} />}
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-white">{track.title}</h4>
                        <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-3">{track.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {languageTracks.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[#007AFF]/20 rounded-xl text-[#007AFF]"><Code2 size={24} /></div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">프로그래밍 언어 트랙</h3>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {languageTracks.map(track => (
                      <motion.div key={track.id} whileHover={{ y: -8 }} onClick={() => handleSelectTrack(track)} className="glass p-10 rounded-[40px] cursor-pointer border-white/5 flex flex-col h-full bg-gradient-to-br from-[#007AFF]/5 to-transparent shadow-xl transition-all">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 bg-[#007AFF]/10 text-[#007AFF]">
                          {track.iconType === 'python' ? 'Py' : track.iconType === 'c' ? 'C' : <Terminal size={28} />}
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-white">{track.title}</h4>
                        <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-3">{track.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeRoute === AppRoute.LEARN && selectedLesson && (
            <div className="flex h-full overflow-hidden relative">
              <div className="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar pb-24">
                <CodeViewer lesson={selectedLesson} onFinishConcept={() => setActiveRoute(AppRoute.CURRICULUM)} />
              </div>
              <motion.div animate={{ width: isAiMinimized ? 80 : 400 }} className="hidden lg:block border-l border-white/5 bg-black/20 shrink-0 relative overflow-hidden">
                <AIChat currentLesson={selectedLesson} isMinimized={isAiMinimized} onToggleMinimize={() => setIsAiMinimized(!isAiMinimized)} />
              </motion.div>
            </div>
          )}

          {activeRoute === AppRoute.CURRICULUM && (
            selectedTrack ? (
              <Curriculum 
                onSelectLesson={(l) => { setSelectedLesson(l); setActiveRoute(AppRoute.LEARN); }} 
                selectedTrack={selectedTrack} 
                onChangeTrack={() => setActiveRoute(AppRoute.HOME)} 
              />
            ) : (
              <div className="p-6 lg:p-12 max-w-7xl mx-auto h-full flex flex-col items-center justify-center text-center space-y-12 pb-32">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-gray-500 border border-white/5">
                    <BookOpen size={40} />
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">학습 트랙을 선택해 주세요</h2>
                  <p className="text-gray-500 text-lg lg:text-xl font-light max-w-2xl mx-auto">
                    커리큘럼을 확인하려면 먼저 학습하고 싶은 분야를 선택해야 합니다.<br/>아래 트랙 중 하나를 골라 시작해 보세요.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {ALL_TRACKS.map(track => (
                    <motion.div 
                      key={track.id} 
                      whileHover={{ y: -10, borderColor: 'rgba(0,122,255,0.4)' }}
                      onClick={() => handleSelectTrack(track)}
                      className="glass p-8 rounded-[40px] border-white/5 cursor-pointer flex flex-col items-center text-center gap-6 bg-gradient-to-br from-white/[0.02] to-transparent shadow-2xl transition-all"
                    >
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl ${
                        track.category === 'tutorial' ? 'bg-purple-500/10 text-purple-400' : 'bg-[#007AFF]/10 text-[#007AFF]'
                      }`}>
                        {track.iconType === 'python' ? 'Py' : track.iconType === 'c' ? 'C' : <Sparkles size={28} />}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{track.title}</h4>
                        <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">{track.description}</p>
                      </div>
                      <div className="mt-auto w-full py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest group-hover:bg-[#007AFF] transition-colors flex items-center justify-center gap-2">
                        커리큘럼 보기 <ChevronRight size={14} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          )}
          {activeRoute === AppRoute.QUESTION && <QuestionPage user={user} />}
          {activeRoute === AppRoute.PLAYGROUND && <Playground />}
          {activeRoute === AppRoute.GAP_FILLER && <GapFiller missedProblems={user.missedConcepts || []} onStartReview={() => {}} />}
          {activeRoute === AppRoute.STUDY_GUIDE && <StudyGuide onStartPython={() => setActiveRoute(AppRoute.HOME)} onViewCurriculum={() => setActiveRoute(AppRoute.CURRICULUM)} onStartAlgorithm={() => setActiveRoute(AppRoute.HOME)} />}
          {activeRoute === AppRoute.ADMIN && isAdmin && <Admin />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
