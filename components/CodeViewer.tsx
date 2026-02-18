
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson, ExplanationBlock } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, Terminal, Sparkles, Variable, BookOpen, Quote, Maximize2, Minimize2 } from 'lucide-react';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;

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

// Define CodeViewerProps interface
interface CodeViewerProps {
  lesson: Lesson;
  onFinishConcept: () => void;
  onPageChange?: (pageIndex: number) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ lesson, onFinishConcept, onPageChange }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [isWide, setIsWide] = useState(false); // 가로 확장 모드 상태
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
    <div className="w-full max-w-[1600px] mx-auto space-y-8 lg:space-y-12 pb-10 blur-fix">
      {/* 1. 최상단 타이틀 영역 */}
      <MotionDiv 
        key={`header-${pageIndex}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 lg:p-10 rounded-[32px] lg:rounded-[40px] border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-white/[0.02] to-transparent shadow-xl"
      >
        <div className="flex items-center gap-6">
          <span className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#007AFF] flex items-center justify-center text-white text-2xl lg:text-3xl font-black shrink-0 shadow-lg shadow-[#007AFF]/20">{pageIndex + 1}</span>
          <div>
            <h3 className="text-2xl lg:text-4xl font-black tracking-tighter text-white mb-1 lg:mb-2">{cleanTitle}</h3>
            <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-[0.3em] ml-1">Observation & Logical Deduction</p>
          </div>
        </div>
      </MotionDiv>

      {/* 2. 상단 핵심 내용 요약 (전체 너비) */}
      <MotionDiv 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 lg:p-12 rounded-[32px] lg:rounded-[40px] border-white/10 bg-[#0c0c0c] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-4 -left-4 p-8 opacity-5 text-[#007AFF] rotate-12">
          <Quote size={100} />
        </div>
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3 text-[#007AFF]">
             <div className="w-8 h-8 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
               <BookOpen size={18} />
             </div>
             <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em]">Learning Objectives</span>
          </div>
          <p className="text-xl lg:text-2xl text-white/90 font-medium leading-relaxed lg:leading-relaxed whitespace-pre-line border-l-4 border-[#007AFF] pl-8 lg:pl-10">
            {currentPage.content}
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-[10px] font-bold uppercase tracking-widest pl-10">
            <Sparkles size={12} className="text-gray-700" />
            핵심 개념을 먼저 파악한 후 아래 코드를 관찰해보세요.
          </div>
        </div>
      </MotionDiv>

      {/* 3. 하단 레이아웃: 확장 모드에 따라 grid-cols 가변 적용 */}
      <MotionDiv 
        layout
        className={`grid grid-cols-1 ${isWide ? 'xl:grid-cols-1 gap-16' : 'xl:grid-cols-5 gap-8 lg:gap-12'} items-start`}
      >
        
        {/* [Left Column] Code & Logical Tracing & Output */}
        <MotionDiv 
          layout
          className={`${isWide ? 'xl:col-span-1' : 'xl:col-span-3'} space-y-8 ${isWide ? '' : 'sticky top-4'}`}
        >
          <div className="glass rounded-[32px] lg:rounded-[40px] border-white/10 bg-[#0a0a0a] overflow-hidden relative shadow-inner">
            <div className="px-8 py-5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Terminal size={18} className="text-[#007AFF]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Code Environment</span>
              </div>
              <div className="flex items-center gap-3">
                {/* 확장 토글 버튼 */}
                <button 
                  onClick={() => setIsWide(!isWide)}
                  className="p-2.5 glass rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all border-white/5"
                  title={isWide ? "축소하기" : "넓게 보기"}
                >
                  {isWide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <button 
                  onClick={startTrace}
                  disabled={isTracing}
                  className="group flex items-center gap-3 px-6 py-2.5 bg-[#007AFF] text-white rounded-xl font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-[#007AFF]/20"
                >
                  <PlayCircle size={18} className={isTracing ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
                  <span className="text-xs">{isTracing ? "Executing..." : "로직 흐름 추적"}</span>
                </button>
                <div className="hidden sm:flex gap-1.5 ml-2 border-l border-white/10 pl-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
              </div>
            </div>

            <div className={`p-8 lg:p-14 overflow-x-auto custom-scrollbar transition-all duration-500 ${isWide ? 'min-h-[400px]' : 'min-h-[250px]'}`}>
              <div className="font-mono text-xl lg:text-3xl leading-relaxed lg:leading-[1.7] relative">
                {currentPage.code.split('\n').map((line, idx) => {
                  const explanation = currentPage.explanations?.find(e => e.codeLine === idx);
                  const isActive = activeLine === idx;
                  
                  const textColorClass = !isTracing 
                    ? 'text-white' 
                    : (isActive ? 'text-white font-bold' : 'text-gray-800');

                  return (
                    <div key={`${pageIndex}-${idx}`} className={`relative flex items-center gap-4 transition-all duration-300 ${isActive ? 'pl-6 lg:pl-10' : ''}`}>
                      <div className="relative z-10 whitespace-pre flex items-center gap-8">
                        <span className={`relative z-20 transition-all duration-300 ${textColorClass}`}>
                          {line || ' '}
                        </span>

                        <AnimatePresence>
                          {isActive && currentVars && (
                            <MotionDiv 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-3 px-5 py-2 bg-[#007AFF]/20 border border-[#007AFF]/40 rounded-full shadow-lg"
                            >
                              <Variable size={16} className="text-[#007AFF]" />
                              {Object.entries(currentVars).map(([key, val]) => (
                                <span key={key} className="text-sm lg:text-base font-bold text-white">
                                  <span className="text-gray-500 font-normal">{key}:</span>
                                  <span className="ml-2">{JSON.stringify(val)}</span>
                                </span>
                              ))}
                            </MotionDiv>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {explanation && (
                            <MotionDiv 
                              initial={{ width: 0, opacity: 0 }} 
                              animate={{ width: '115%', opacity: 1 }}
                              className="absolute inset-y-0 -left-6 rounded-2xl -z-10 blur-[1px]"
                              style={{ backgroundColor: BG_MAP[explanation.type] }}
                            />
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {isActive && (
                            <MotionDiv 
                              layoutId="trace-glow-current"
                              className="absolute inset-y-0 -left-8 -right-32 bg-[#007AFF]/25 border-l-[5px] border-[#007AFF] -z-10 blur-[2px]"
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
          </div>

          {/* 터미널 출력 영역 */}
          <AnimatePresence mode="wait">
            <MotionDiv 
              key={`result-${pageIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-[32px] border-white/10 bg-black/40 p-8 lg:p-10 shadow-xl"
            >
               <div className="flex items-center gap-3 mb-6">
                 <Terminal size={20} className="text-green-400" />
                 <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-gray-500">Virtual Output Terminal</span>
               </div>
               <div className="font-mono text-xl lg:text-3xl text-green-400 bg-black/60 p-8 lg:p-12 rounded-[24px] border border-white/5 whitespace-pre-wrap min-h-[120px] flex items-center shadow-inner overflow-hidden">
                 {currentPage.exampleOutput ? (
                   <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                     {currentPage.exampleOutput}
                   </MotionDiv>
                 ) : (
                   <span className="text-gray-700 italic flex items-center gap-4 text-sm lg:text-base"><Sparkles size={20} /> 코드 실행 결과가 이곳에 출력됩니다.</span>
                 )}
               </div>
            </MotionDiv>
          </AnimatePresence>
        </MotionDiv>

        {/* [Right Column] Detailed Analysis */}
        <MotionDiv 
          layout
          className={`${isWide ? 'xl:col-span-1' : 'xl:col-span-2'} space-y-6 lg:space-y-8`}
        >
           <div className="flex items-center gap-3 px-4">
              <div className="p-2 bg-[#007AFF]/10 rounded-lg text-[#007AFF]">
                <Sparkles size={20} />
              </div>
              <h4 className="text-lg lg:text-xl font-black text-white tracking-tight uppercase">Detail Logic Analysis</h4>
           </div>
           
           <div className={`space-y-6 lg:space-y-8 ${isWide ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 !space-y-0' : ''}`}>
              <AnimatePresence mode="popLayout">
                {currentPage.explanations?.map((exp, i) => (
                  <MotionDiv
                    key={exp.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-6 group"
                  >
                    <div className={`flex flex-col items-center pt-2 shrink-0 ${isWide ? 'hidden sm:flex' : 'flex'}`}>
                       <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center font-black text-black shadow-xl text-lg lg:text-xl group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0" style={{ backgroundColor: COLOR_MAP[exp.type] }}>
                         {exp.badge}
                       </div>
                       {i < (currentPage.explanations?.length || 0) - 1 && !isWide && (
                         <div className="w-0.5 h-12 lg:h-16 bg-white/5 my-2" />
                       )}
                    </div>
                    <div className="flex-1 p-6 lg:p-8 rounded-[32px] glass-blue border-white/5 relative group-hover:border-[#007AFF]/30 group-hover:bg-[#007AFF]/5 transition-all shadow-xl blur-fix h-full">
                      <h5 className="font-black text-lg lg:text-xl mb-2 lg:mb-3" style={{ color: COLOR_MAP[exp.type] }}>{exp.title}</h5>
                      <p className="text-gray-400 leading-relaxed text-sm lg:text-lg font-light">{exp.text}</p>
                    </div>
                  </MotionDiv>
                ))}
              </AnimatePresence>
           </div>
        </MotionDiv>
      </MotionDiv>

      {/* Footer Navigation */}
      <div className="flex flex-col items-center gap-10 pt-16 border-t border-white/5">
        <div className="flex justify-between items-center w-full max-w-3xl px-8 relative z-20">
          <button 
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(p => p - 1)}
            className="flex items-center gap-3 px-8 lg:px-10 py-4 lg:py-5 glass rounded-[20px] lg:rounded-[24px] text-sm font-bold text-gray-500 hover:text-white transition-all disabled:opacity-0 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={20} /> 이전 개념
          </button>
          <div className="flex gap-4">
            {pages.map((_, i) => (
              <div key={i} className={`h-2 lg:h-2.5 rounded-full transition-all duration-500 ${i === pageIndex ? 'bg-[#007AFF] w-12 lg:w-16 shadow-[0_0_15px_rgba(0,122,255,0.5)]' : 'bg-white/10 w-2 lg:w-2.5'}`} />
            ))}
          </div>
          <button 
            disabled={isLastPage}
            onClick={() => setPageIndex(p => p + 1)}
            className={`flex items-center gap-3 px-10 lg:px-12 py-4 lg:py-5 glass rounded-[20px] lg:rounded-[24px] font-black transition-all text-sm hover:scale-105 active:scale-95 ${
              isLastPage ? 'opacity-0 pointer-events-none' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            다음 개념 <ChevronRight size={20} />
          </button>
        </div>

        <AnimatePresence>
          {isLastPage && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full flex justify-center pb-20"
            >
              <button 
                onClick={onFinishConcept} 
                className="group py-6 lg:py-8 px-16 lg:px-24 bg-[#007AFF] text-white rounded-[32px] lg:rounded-[40px] text-xl lg:text-2xl font-black hover:scale-105 transition-all shadow-3xl shadow-[#007AFF]/40 flex items-center justify-center gap-6 active:scale-95"
              >
                검증 단계로 이동 (개념 퀴즈) <CheckCircle2 size={32} className="group-hover:rotate-12 transition-transform" />
              </button>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
