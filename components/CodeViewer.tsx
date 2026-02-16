
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson, ExplanationBlock } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, Terminal, Sparkles, Variable } from 'lucide-react';

interface CodeViewerProps {
  lesson: Lesson;
  onFinishConcept: () => void;
  onPageChange?: (index: number) => void;
}

const COLOR_MAP: Record<ExplanationBlock['type'], string> = {
  yellow: '#FEF08A',
  blue: '#60A5FA',
  purple: '#C084FC',
  red: '#F87171',
  orange: '#FB923C',
  green: '#4ADE80'
};

const BG_MAP: Record<ExplanationBlock['type'], string> = {
  yellow: 'rgba(254, 240, 138, 0.12)',
  blue: 'rgba(96, 165, 250, 0.12)',
  purple: 'rgba(192, 132, 252, 0.12)',
  red: 'rgba(248, 113, 113, 0.12)',
  orange: 'rgba(251, 146, 60, 0.12)',
  green: 'rgba(74, 222, 128, 0.12)'
};

export const CodeViewer: React.FC<CodeViewerProps> = ({ lesson, onFinishConcept, onPageChange }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [currentVars, setCurrentVars] = useState<Record<string, any> | null>(null);
  
  const pages = lesson.pages || [];
  const currentPage = pages[pageIndex];
  const isLastPage = pages.length === 0 || pageIndex === pages.length - 1;

  useEffect(() => {
    onPageChange?.(pageIndex);
    setIsTracing(false);
    setActiveLine(null);
    setCurrentVars(null);

    // [버그 수정] 페이지 이동 시 부드러운 스크롤 업 (smooth)
    const scrollContainer = document.getElementById('learn-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pageIndex, onPageChange]);

  const startTrace = async () => {
    if (isTracing || !currentPage) return;
    setIsTracing(true);
    
    const flow = currentPage.traceFlow || 
                 currentPage.code.split('\n').map((_, i) => i);
                 
    for (let i = 0; i < flow.length; i++) {
      const lineIdx = flow[i];
      setActiveLine(lineIdx);
      
      if (currentPage.variableHistory && currentPage.variableHistory[i]) {
        setCurrentVars(currentPage.variableHistory[i]);
      } else {
        setCurrentVars(null);
      }
      
      await new Promise(r => setTimeout(r, 700));
    }
    
    setIsTracing(false);
    setActiveLine(null);
    setCurrentVars(null);
  };

  if (!currentPage) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-10 lg:p-20 glass rounded-[32px] lg:rounded-[40px] text-gray-500 italic space-y-6 text-center">
        <div className="text-xl lg:text-2xl font-bold">학습 자료 준비 중</div>
        <p className="text-sm lg:text-base">이 레슨의 개념 학습 자료가 아직 준비되지 않았습니다.</p>
        <button 
          onClick={onFinishConcept} 
          className="py-4 lg:py-6 px-10 lg:px-16 bg-[#007AFF] text-white rounded-[24px] lg:rounded-[30px] text-lg lg:text-xl font-bold hover:scale-105 transition-all shadow-2xl active:scale-95"
        >
          다음 단계로 이동
        </button>
      </div>
    );
  }

  const cleanTitle = currentPage.title.replace(/^[0-9]+\.?\s*/, '');

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-10 blur-fix">
      {/* 개념 헤더 */}
      <div className="glass p-6 lg:p-10 rounded-[32px] lg:rounded-[40px] border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 will-change-blur">
        <div className="space-y-3 lg:space-y-4 flex-1">
          <h3 className="text-2xl lg:text-4xl font-bold flex items-center gap-3 lg:gap-4 text-white">
            <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-[#007AFF] flex items-center justify-center text-white text-xl lg:text-2xl shrink-0">{pageIndex + 1}</span>
            <span className="tracking-tight truncate">{cleanTitle}</span>
          </h3>
          <p className="text-base lg:text-xl text-gray-400 font-light leading-relaxed whitespace-pre-line">
            {currentPage.content}
          </p>
        </div>
        <button 
          onClick={startTrace}
          disabled={isTracing}
          className="group flex items-center gap-3 px-6 py-4 bg-[#007AFF] text-white rounded-2xl font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-[#007AFF]/20 will-change-blur"
        >
          <PlayCircle size={24} className={isTracing ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
          {isTracing ? "실행 추적 중" : "로직 흐름 추적"}
        </button>
      </div>

      {/* 코드 및 설명 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-6">
          <div className="glass rounded-[32px] lg:rounded-[40px] border-white/10 bg-[#0a0a0a] overflow-hidden p-8 lg:p-12 relative shadow-inner overflow-x-auto custom-scrollbar">
            <h4 className="text-gray-600 font-mono text-[10px] lg:text-sm mb-6 lg:mb-10 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Logic Structure
            </h4>
            <div className="font-mono text-lg lg:text-3xl leading-relaxed lg:leading-[1.6] relative">
              {currentPage.code.split('\n').map((line, idx) => {
                const explanation = currentPage.explanations?.find(e => e.codeLine === idx);
                const isActive = activeLine === idx;
                
                const textColorClass = !isTracing 
                  ? 'text-white' 
                  : (isActive ? 'text-white font-bold' : 'text-gray-700');

                return (
                  <div key={`${pageIndex}-${idx}`} className={`relative flex items-center gap-3 transition-all duration-300 ${isActive ? 'pl-2 lg:pl-4' : ''}`}>
                    <div className="relative z-10 whitespace-pre flex items-center gap-4">
                      <span className={`relative z-20 transition-all duration-300 ${textColorClass}`}>
                        {line || ' '}
                      </span>

                      <AnimatePresence>
                        {isActive && currentVars && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2 px-3 py-1 bg-[#007AFF]/20 border border-[#007AFF]/40 rounded-full"
                          >
                            <Variable size={12} className="text-[#007AFF]" />
                            {Object.entries(currentVars).map(([key, val]) => (
                              <span key={key} className="text-[10px] lg:text-xs font-bold">
                                <span className="text-gray-400">{key}:</span>
                                <span className="text-white ml-1">{JSON.stringify(val)}</span>
                              </span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {explanation && (
                          <motion.div 
                            initial={{ width: 0, opacity: 0 }} 
                            animate={{ width: '110%', opacity: 1 }}
                            className="absolute inset-y-0 -left-2 rounded-lg -z-10 blur-[1px]"
                            style={{ backgroundColor: BG_MAP[explanation.type] }}
                          />
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {isActive && (
                          <motion.div 
                            layoutId="trace-glow-current"
                            className="absolute inset-y-0 -left-4 -right-10 bg-[#007AFF]/25 border-l-[3px] border-[#007AFF] -z-10 blur-[1px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={`result-${pageIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-[24px] lg:rounded-[32px] border-white/10 bg-black/40 p-6 lg:p-10 shadow-xl"
            >
               <div className="flex items-center gap-3 mb-4 lg:mb-6">
                 <Terminal size={18} className="text-[#007AFF]" />
                 <span className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest">Execution Result</span>
               </div>
               <div className="font-mono text-sm lg:text-xl text-green-400 bg-black/60 p-5 lg:p-8 rounded-2xl border border-white/5 whitespace-pre-wrap min-h-[100px] flex items-center overflow-hidden">
                 {currentPage.exampleOutput ? (
                   <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full"
                   >
                     {currentPage.exampleOutput}
                   </motion.div>
                 ) : (
                   <span className="text-gray-700 italic flex items-center gap-2"><Sparkles size={16} /> 실행 시 위와 같은 결과가 출력됩니다.</span>
                 )}
               </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <AnimatePresence mode="popLayout">
            {currentPage.explanations?.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 lg:gap-6 group"
              >
                <div className="flex flex-col items-center pt-1.5 lg:pt-2 shrink-0">
                   <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-black shadow-lg text-sm lg:text-base group-hover:scale-110 transition-transform" style={{ backgroundColor: COLOR_MAP[exp.type] }}>
                     {exp.badge}
                   </div>
                   {i < (currentPage.explanations?.length || 0) - 1 && (
                     <div className="w-0.5 h-8 lg:h-12 bg-white/5 my-1.5 lg:my-2" />
                   )}
                </div>
                <div className="flex-1 p-5 lg:p-8 rounded-[24px] lg:rounded-[32px] glass-blue border-white/5 relative group-hover:border-[#007AFF]/30 group-hover:bg-[#007AFF]/5 transition-all shadow-xl blur-fix">
                  <h5 className="font-bold text-base lg:text-xl mb-1 lg:mb-2" style={{ color: COLOR_MAP[exp.type] }}>{exp.title}</h5>
                  <p className="text-gray-300 leading-relaxed text-sm lg:text-lg">{exp.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex flex-col items-center gap-6 lg:gap-10 pt-6 px-1 lg:px-4">
        <div className="flex justify-between items-center w-full px-2 relative z-20">
          <button 
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(p => p - 1)}
            className="flex items-center gap-2 px-5 lg:px-8 py-3 lg:py-4 glass rounded-xl lg:rounded-2xl text-xs lg:text-base text-gray-500 hover:text-white transition-all disabled:opacity-0 will-change-blur hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={16} /> 이전
          </button>
          <div className="flex gap-1.5 lg:gap-2">
            {pages.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full transition-all duration-500 ${i === pageIndex ? 'bg-[#007AFF] w-6 lg:w-12' : 'bg-white/10'}`} />
            ))}
          </div>
          <button 
            disabled={isLastPage}
            onClick={() => setPageIndex(p => p + 1)}
            className={`flex items-center gap-2 px-6 lg:px-10 py-3 lg:py-4 glass rounded-xl lg:rounded-2xl font-bold transition-all text-xs lg:text-base group hover:border-[#007AFF]/50 will-change-blur hover:scale-105 active:scale-95 ${
              isLastPage ? 'opacity-0 pointer-events-none' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            다음 <ChevronRight size={16} />
          </button>
        </div>

        <AnimatePresence>
          {isLastPage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full flex justify-center px-2 z-20"
            >
              <button 
                onClick={onFinishConcept} 
                className="w-full lg:w-auto py-5 lg:py-6 px-10 lg:px-16 bg-[#007AFF] text-white rounded-[24px] lg:rounded-[30px] text-lg lg:text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-[#007AFF]/40 flex items-center justify-center gap-3 active:scale-95 will-change-blur"
              >
                퀴즈 시작하기 <CheckCircle2 size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
