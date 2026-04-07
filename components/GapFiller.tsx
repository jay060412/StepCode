
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Bot, HelpCircle, BrainCircuit, Terminal, ChevronRight, Trash2, Award, Zap } from 'lucide-react';
import { Problem } from '../types';

const MotionDiv = motion.div as any;

interface GapFillerProps {
  missed_concepts: Problem[];
  onStartReview: (problem: Problem) => void;
  onUpdateUser: (updates: any) => Promise<{ success?: boolean; error?: string }>;
}

export const GapFiller: React.FC<GapFillerProps> = ({ missed_concepts, onStartReview, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'missed' | 'mastered'>('missed');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'concept' | 'coding'>('all');

  const weaknessList = useMemo(() => missed_concepts.filter(p => !p.mastered), [missed_concepts]);
  const masteredList = useMemo(() => missed_concepts.filter(p => !!p.mastered), [missed_concepts]);

  const currentList = activeTab === 'missed' ? weaknessList : masteredList;

  const filtered = currentList.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.type === selectedCategory;
  });

  const handleDeleteItem = async (e: React.MouseEvent, problemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isMastered = activeTab === 'mastered';
    const message = isMastered 
      ? '정복 목록에서 이 문제를 삭제하시겠습니까?'
      : '약점 목록에서 이 문제를 삭제하시겠습니까?';
      
    if (!window.confirm(message)) return;
    
    try {
      const updated = missed_concepts.filter(p => String(p.id) !== String(problemId));
      
      // DB 업데이트 요청 및 결과 대기
      const res = await onUpdateUser({ missed_concepts: updated });
      
      if (res?.success) {
        alert('목록에서 삭제되었습니다.');
      } else {
        throw new Error(res?.error || '알 수 없는 오류');
      }
    } catch (err: any) {
      console.error('Delete failed in GapFiller:', err);
      alert(`삭제 실패: ${err.message || '데이터베이스 통신 오류입니다.'}\n\n도움말: Supabase SQL Editor에서 UPDATE 정책이 허용되어 있는지 확인하세요.`);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32">
      <header className="mb-12 flex flex-col lg:flex-row justify-between lg:items-end gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-accent/10 border border-orange-accent/20 text-orange-accent text-[10px] font-black uppercase tracking-widest mb-4">
            <BrainCircuit size={12} /> Intelligence Recovery
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-white">빈틈 매우기</h2>
          <p className="text-gray-500 text-lg lg:text-xl font-light leading-relaxed">
            약점을 <span className="text-orange-accent font-bold">강점</span>으로, 실수를 <span className="text-teal-accent font-bold">자산</span>으로 바꾸세요.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 p-1.5 glass rounded-2xl border-white/5 bg-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('missed')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'missed' ? 'bg-orange-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <HelpCircle size={14} className="pointer-events-none" /> 약점 보완 ({weaknessList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mastered')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mastered' ? 'bg-teal-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Award size={14} className="pointer-events-none" /> 정복 완료 ({masteredList.length})
            </button>
          </div>

          <div className="flex gap-2 p-1 glass rounded-xl border-white/5 self-end">
            {(['all', 'concept', 'coding'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  selectedCategory === cat ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center p-12 text-center glass rounded-[64px] border-dashed border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700 mb-6">
            <Zap size={32} />
          </div>
          <p className="text-gray-500 text-xl font-light">목록이 비어있습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((prob) => (
              <MotionDiv
                key={prob.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-8 lg:p-10 rounded-[48px] border-white/5 bg-white/[0.02] flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/[0.08] transition-colors pointer-events-none">
                  {prob.type === 'concept' ? <HelpCircle size={120} /> : <Terminal size={120} />}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      prob.type === 'concept' ? 'bg-teal-accent/10 text-teal-accent border border-teal-accent/20' : 'bg-orange-accent/10 text-orange-accent border border-orange-accent/20'
                    }`}>
                      {prob.type}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteItem(e, prob.id)} 
                      className="p-4 text-gray-500 hover:text-red-500 transition-all z-[100] cursor-pointer rounded-2xl hover:bg-red-500/10 group/del relative pointer-events-auto shadow-sm"
                      title="삭제하기"
                    >
                      <Trash2 size={20} className="pointer-events-none group-hover/del:scale-110 transition-transform" />
                    </button>
                  </div>

                  <h4 className="text-xl lg:text-2xl font-bold mb-6 leading-snug line-clamp-3 text-white">{prob.question}</h4>

                  {activeTab === 'missed' ? (
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 mb-8">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase mb-2">
                        💡 Tutor Hint
                      </div>
                      <p className="text-sm text-gray-400 font-light leading-relaxed italic">"{prob.hint}"</p>
                    </div>
                  ) : (
                    <div className="bg-teal-accent/10 p-5 rounded-2xl border border-teal-accent/20 mb-8">
                      <div className="flex items-center gap-2 text-[10px] font-black text-teal-accent uppercase mb-2">
                        ✨ Mastered Insight
                      </div>
                      <p className="text-sm text-gray-300 font-light leading-relaxed">이 문제를 완벽히 정복했습니다! 원리를 잊지 않도록 기록에 보관 중입니다.</p>
                    </div>
                  )}
                </div>

                {activeTab === 'missed' && (
                  <button
                    type="button"
                    onClick={() => onStartReview(prob)}
                    className="w-full py-5 bg-white/5 group-hover:bg-orange-accent text-gray-400 group-hover:text-white rounded-[24px] font-black transition-all flex items-center justify-center gap-3 border border-white/5 group-hover:border-orange-accent cursor-pointer"
                  >
                    다시 풀어보기 <ChevronRight size={18} className="pointer-events-none" />
                  </button>
                )}
              </MotionDiv>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
