
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Bot, HelpCircle, BrainCircuit, Terminal, ChevronRight } from 'lucide-react';
import { Problem } from '../types';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;

interface GapFillerProps {
  missed_concepts: Problem[];
  onStartReview: (problem: Problem) => void;
}

export const GapFiller: React.FC<GapFillerProps> = ({ missed_concepts, onStartReview }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'concept' | 'coding'>('all');

  const filtered = missed_concepts.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.type === selectedCategory;
  });

  if (missed_concepts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 rounded-[40px] bg-green-500/10 text-green-400 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/5">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight">완벽한 학습 상태입니다!</h2>
        <p className="text-gray-500 text-lg lg:text-xl font-light max-w-lg leading-relaxed">
          현재 틀린 문제가 하나도 없습니다. 새로운 트랙에 도전하여 지평을 넓혀보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32">
      <header className="mb-12 flex flex-col lg:flex-row justify-between lg:items-end gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
            <BrainCircuit size={12} /> Intelligence Recovery
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">빈틈 매우기</h2>
          <p className="text-gray-500 text-lg lg:text-xl font-light">
            잊고 있었던 <span className="text-white font-medium">{missed_concepts.length}개의 약점</span>을 강점으로 바꾸세요.
          </p>
        </div>

        <div className="flex gap-2 p-1.5 glass rounded-2xl border-white/5 bg-white/5">
          {(['all', 'concept', 'coding'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat === 'all' ? '전체' : cat === 'concept' ? '개념' : '코딩'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((prob) => (
            <MotionDiv
              key={prob.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -5 }}
              className="glass p-8 lg:p-10 rounded-[40px] border-white/5 bg-white/[0.02] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-[#007AFF]/10 transition-colors pointer-events-none">
                {prob.type === 'concept' ? <HelpCircle size={100} /> : <Terminal size={100} />}
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    prob.type === 'concept' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {prob.type}
                  </span>
                  <span className="text-xs text-gray-700 font-mono">#{prob.id}</span>
                </div>

                <h4 className="text-xl lg:text-2xl font-bold mb-6 leading-snug line-clamp-3">{prob.question}</h4>

                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase mb-3">
                    <Bot size={12} className="text-[#007AFF]" /> Tutor Hint
                  </div>
                  <p className="text-sm text-gray-400 font-light leading-relaxed italic line-clamp-2">"{prob.hint}"</p>
                </div>
              </div>

              <button
                onClick={() => onStartReview(prob)}
                className="w-full py-5 bg-white/5 group-hover:bg-[#007AFF] text-gray-400 group-hover:text-white rounded-[24px] font-black transition-all flex items-center justify-center gap-3 border border-white/5 group-hover:border-[#007AFF]"
              >
                다시 풀어보기 <ChevronRight size={18} />
              </button>
            </MotionDiv>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
