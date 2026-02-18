
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson, Track } from '../types';
import { CheckCircle2, Play, Lock, ChevronRight, RefreshCw, Brain, AlertTriangle, X } from 'lucide-react';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface CurriculumProps {
  onSelectLesson: (lesson: Lesson) => void;
  selectedTrack: Track;
  onChangeTrack: () => void;
  completed_lesson_ids: string[];
}

export const Curriculum: React.FC<CurriculumProps> = ({ onSelectLesson, selectedTrack, onChangeTrack, completed_lesson_ids }) => {
  const [showSkipModal, setShowSkipModal] = useState<{ show: boolean; lesson: Lesson | null }>({ show: false, lesson: null });
  const lessons = selectedTrack.lessons || [];

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (completed_lesson_ids.includes(lesson.id)) return 'completed';
    if (index === 0) return 'current';
    const prevLesson = lessons[index - 1];
    if (completed_lesson_ids.includes(prevLesson.id)) return 'current';
    return 'locked';
  };

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (status === 'locked') {
      // 순서를 건너뛰는 경우 팝업 노출
      setShowSkipModal({ show: true, lesson });
    } else {
      onSelectLesson(lesson);
    }
  };

  const confirmSkip = () => {
    if (showSkipModal.lesson) {
      onSelectLesson(showSkipModal.lesson);
      setShowSkipModal({ show: false, lesson: null });
    }
  };

  const renderActiveLangIcon = (type: string) => {
    if (type === 'python') {
      return (
        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#3776AB] to-[#FFD43B]/20 flex items-center justify-center font-black text-white shadow-lg shrink-0">
          <span className="text-lg lg:text-xl">Py</span>
        </div>
      );
    }
    if (type === 'c') {
      return (
        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#5C5C5C] to-[#004482] flex items-center justify-center font-black text-white shadow-lg shrink-0">
          <span className="text-xl lg:text-2xl">C</span>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white shadow-lg shrink-0">
        <Brain size={24} />
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-12 space-y-8 lg:space-y-12 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl lg:text-5xl font-bold mb-3 tracking-tight text-white">{selectedTrack.title} 로드맵</h2>
          <p className="text-sm lg:text-base text-gray-500 font-light">이 트랙의 단계를 따라가며 전문성을 쌓으세요.</p>
        </div>
        
        <MotionDiv 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-blue border-[#007AFF]/30 p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] flex items-center gap-4 min-w-full lg:min-w-[340px] relative z-20"
        >
          {renderActiveLangIcon(selectedTrack.iconType)}
          <div className="flex-1 overflow-hidden">
            <span className="text-[8px] lg:text-[10px] text-[#007AFF] font-bold uppercase tracking-widest block mb-1">Active Track</span>
            <h4 className="text-lg lg:text-xl font-bold text-white truncate leading-none">{selectedTrack.title}</h4>
          </div>
          <MotionButton 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onChangeTrack}
            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white transition-all border border-white/10 cursor-pointer shadow-lg"
          >
            <RefreshCw size={20} />
          </MotionButton>
        </MotionDiv>
      </div>

      <div className="glass rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
            <tr>
              <th className="px-10 py-6 font-medium">Stage</th>
              <th className="px-10 py-6 font-medium">Topic</th>
              <th className="px-10 py-6 font-medium">Status</th>
              <th className="px-10 py-6 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lessons.map((lesson, idx) => {
              const status = getLessonStatus(lesson, idx);
              const isLocked = status === 'locked';
              return (
                <tr 
                  key={lesson.id} 
                  className={`group hover:bg-white/[0.04] transition-all cursor-pointer ${isLocked ? 'opacity-70' : 'opacity-100'}`} 
                  onClick={() => handleLessonClick(lesson, status)}
                >
                  <td className="px-10 py-10 font-mono text-sm text-gray-600 group-hover:text-[#007AFF] transition-colors">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-10 py-10">
                    <h4 className="font-bold text-2xl mb-2 transition-all tracking-tight group-hover:text-white">{lesson.title}</h4>
                    <p className="text-base text-gray-500 font-light">{lesson.description}</p>
                  </td>
                  <td className="px-10 py-10">
                    {status === 'completed' && <div className="text-green-400 flex items-center gap-2 font-bold bg-green-400/10 px-4 py-2 rounded-full w-fit border border-green-500/20"><CheckCircle2 size={18} /> 완료</div>}
                    {status === 'current' && <div className="text-cyan-400 flex items-center gap-2 font-bold animate-pulse bg-cyan-400/10 px-4 py-2 rounded-full w-fit border border-cyan-400/20"><Play size={18} /> 학습 중</div>}
                    {status === 'locked' && <div className="text-gray-500 flex items-center gap-2 font-bold bg-white/5 px-4 py-2 rounded-full w-fit border border-white/10"><Lock size={18} /> 순서 대기</div>}
                  </td>
                  <td className="px-10 py-10">
                    <button className={`w-14 h-14 flex items-center justify-center glass rounded-full transition-all shadow-xl group-hover:scale-110 ${isLocked ? 'group-hover:bg-gray-700' : 'group-hover:bg-[#007AFF] group-hover:text-white'}`}>
                      <ChevronRight size={24} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 건너뛰기 경고 모달 */}
      <AnimatePresence>
        {showSkipModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass p-10 rounded-[48px] bg-card border-white/10 shadow-3xl text-center"
            >
              <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">학습 순서 안내</h3>
              <p className="text-gray-400 font-light leading-relaxed mb-10 text-lg">
                아직 이전 단계를 완료하지 않았습니다.<br/>
                <span className="text-white font-bold">"{showSkipModal.lesson?.title}"</span> 단계를<br/>
                순서와 관계없이 먼저 학습하시겠습니까?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowSkipModal({ show: false, lesson: null })}
                  className="py-4 glass rounded-2xl font-bold text-gray-400 hover:text-white transition-all"
                >
                  돌아가기
                </button>
                <button 
                  onClick={confirmSkip}
                  className="py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl shadow-[#007AFF]/20 hover:scale-105 active:scale-95 transition-all"
                >
                  계속하기
                </button>
              </div>
              <button 
                onClick={() => setShowSkipModal({ show: false, lesson: null })}
                className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
