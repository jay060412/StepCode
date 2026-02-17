
import React from 'react';
import { motion } from 'framer-motion';
import { Lesson, Track } from '../types';
import { CheckCircle2, Play, Lock, ChevronRight, RefreshCw, Brain } from 'lucide-react';

interface CurriculumProps {
  onSelectLesson: (lesson: Lesson) => void;
  selectedTrack: Track;
  onChangeTrack: () => void;
  completed_lesson_ids: string[];
}

export const Curriculum: React.FC<CurriculumProps> = ({ onSelectLesson, selectedTrack, onChangeTrack, completed_lesson_ids }) => {
  const lessons = selectedTrack.lessons || [];

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (completed_lesson_ids.includes(lesson.id)) return 'completed';
    if (index === 0) return 'current';
    const prevLesson = lessons[index - 1];
    if (completed_lesson_ids.includes(prevLesson.id)) return 'current';
    return 'locked';
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
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-blue border-[#007AFF]/30 p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] flex items-center gap-4 min-w-full lg:min-w-[340px] relative z-20"
        >
          {renderActiveLangIcon(selectedTrack.iconType)}
          <div className="flex-1 overflow-hidden">
            <span className="text-[8px] lg:text-[10px] text-[#007AFF] font-bold uppercase tracking-widest block mb-1">Active Track</span>
            <h4 className="text-lg lg:text-xl font-bold text-white truncate leading-none">{selectedTrack.title}</h4>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onChangeTrack}
            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white transition-all border border-white/10 cursor-pointer shadow-lg"
          >
            <RefreshCw size={20} />
          </motion.button>
        </motion.div>
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
                  className={`group hover:bg-white/[0.02] transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`} 
                  onClick={() => !isLocked && onSelectLesson(lesson)}
                >
                  <td className="px-10 py-10 font-mono text-sm text-gray-600">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-10 py-10">
                    <h4 className="font-bold text-2xl mb-2 transition-all tracking-tight group-hover:text-[#007AFF]">{lesson.title}</h4>
                    <p className="text-base text-gray-500 font-light">{lesson.description}</p>
                  </td>
                  <td className="px-10 py-10">
                    {status === 'completed' && <div className="text-green-400 flex items-center gap-2 font-bold bg-green-400/10 px-4 py-2 rounded-full w-fit border border-green-500/20"><CheckCircle2 size={18} /> 완료</div>}
                    {status === 'current' && <div className="text-cyan-400 flex items-center gap-2 font-bold animate-pulse bg-cyan-400/10 px-4 py-2 rounded-full w-fit border border-cyan-400/20"><Play size={18} /> 학습 중</div>}
                    {status === 'locked' && <div className="text-gray-600 flex items-center gap-2 font-bold bg-white/5 px-4 py-2 rounded-full w-fit border border-white/5"><Lock size={18} /> 잠김</div>}
                  </td>
                  <td className="px-10 py-10">
                    {!isLocked && (
                      <button className="w-14 h-14 flex items-center justify-center glass rounded-full group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-xl group-hover:scale-110">
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
