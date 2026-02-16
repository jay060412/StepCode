
import React from 'react';
import { motion } from 'framer-motion';
import { Lesson, Track } from '../types';
import { CheckCircle2, Play, Lock, ChevronRight, RefreshCw, Terminal, Brain, Code2 } from 'lucide-react';

interface CurriculumProps {
  onSelectLesson: (lesson: Lesson) => void;
  selectedTrack: Track;
  onChangeTrack: () => void;
}

export const Curriculum: React.FC<CurriculumProps> = ({ onSelectLesson, selectedTrack, onChangeTrack }) => {
  const lessons = selectedTrack.lessons || [];

  return (
    <div className="p-6 lg:p-12 space-y-8 lg:space-y-12 max-w-7xl mx-auto pb-24 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-3 tracking-tight">{selectedTrack.title} 로드맵</h2>
          <p className="text-sm lg:text-base text-gray-500 font-light">이 트랙의 단계를 따라가며 전문성을 쌓으세요.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-blue border-[#007AFF]/30 p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] flex items-center gap-4 lg:gap-6 min-w-full lg:min-w-[320px]"
        >
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-[#007AFF] flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/20 shrink-0">
            {selectedTrack.iconType === 'python' ? <Code2 size={24} /> : selectedTrack.iconType === 'c' ? <Terminal size={24} /> : <Brain size={24} />}
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[8px] lg:text-[10px] text-[#007AFF] font-bold uppercase tracking-widest block mb-0.5 lg:mb-1">Active Track</span>
            <h4 className="text-lg lg:text-xl font-bold text-white truncate">{selectedTrack.title}</h4>
          </div>
          <button 
            onClick={onChangeTrack}
            className="p-2.5 lg:p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all border border-white/10"
            title="홈으로 돌아가기"
          >
            <RefreshCw size={18} />
          </button>
        </motion.div>
      </div>

      {/* Mobile Card List - lg 이상에서는 완전히 숨김 */}
      <div className="lg:hidden space-y-4">
        {lessons.length === 0 ? (
          <div className="p-10 text-center text-gray-500 italic text-sm">준비 중인 학습 과정입니다.</div>
        ) : (
          lessons.map((lesson, idx) => (
            <motion.div
              key={lesson.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectLesson(lesson)}
              className={`p-5 glass rounded-[24px] border-white/5 flex items-center gap-4 transition-all ${lesson.status === 'locked' ? 'opacity-40' : 'active:bg-white/5'}`}
            >
              <div className="text-xs font-mono text-gray-600 shrink-0 w-6">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-lg mb-1 truncate">{lesson.title}</h4>
                <div className="flex items-center gap-2">
                  {lesson.status === 'completed' && <span className="text-[10px] text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> 완료</span>}
                  {lesson.status === 'current' && <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 animate-pulse"><Play size={10} /> 학습 중</span>}
                  {lesson.status === 'locked' && <span className="text-[10px] text-gray-600 font-bold flex items-center gap-1"><Lock size={10} /> 잠김</span>}
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop Table - lg 미만에서는 완전히 숨김 */}
      <div className="hidden lg:block glass rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
        {lessons.length === 0 ? (
          <div className="p-20 text-center text-gray-500 italic">준비 중인 학습 과정입니다.</div>
        ) : (
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
              {lessons.map((lesson, idx) => (
                <tr 
                  key={lesson.id} 
                  className={`group hover:bg-white/[0.02] cursor-pointer transition-all ${lesson.status === 'locked' ? 'opacity-40' : ''}`} 
                  onClick={() => onSelectLesson(lesson)}
                >
                  <td className="px-10 py-10 font-mono text-sm text-gray-600">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-10 py-10">
                    <h4 className="font-bold text-2xl mb-2 group-hover:text-[#007AFF] transition-all tracking-tight">{lesson.title}</h4>
                    <p className="text-base text-gray-500 font-light">{lesson.description}</p>
                  </td>
                  <td className="px-10 py-10">
                    {lesson.status === 'completed' && <div className="text-green-400 flex items-center gap-2 font-bold bg-green-400/10 px-4 py-2 rounded-full w-fit border border-green-500/20"><CheckCircle2 size={18} /> 완료</div>}
                    {lesson.status === 'current' && <div className="text-cyan-400 flex items-center gap-2 font-bold animate-pulse bg-cyan-400/10 px-4 py-2 rounded-full w-fit border border-cyan-400/20"><Play size={18} /> 학습 중</div>}
                    {lesson.status === 'locked' && <div className="text-gray-600 flex items-center gap-2 font-bold bg-white/5 px-4 py-2 rounded-full w-fit border border-white/5"><Lock size={18} /> 잠김</div>}
                  </td>
                  <td className="px-10 py-10">
                    <button className="w-14 h-14 flex items-center justify-center glass rounded-full group-hover:bg-[#007AFF] group-hover:text-white transition-all shadow-xl group-hover:scale-110">
                      <ChevronRight size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
