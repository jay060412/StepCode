
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Problem } from '../types';
import { HelpCircle, Terminal, Play, RotateCcw, CheckCircle2, XCircle, ChevronLeft, BookOpen, ChevronRight } from 'lucide-react';
import { FormattedText } from './FormattedText';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;

interface ProblemSolvingProps {
  problems: Problem[];
  onFinish: (missed: Problem[]) => void;
  onProblemChange?: (prob: Problem) => void;
  onBackToConcept?: () => void;
  onSaveProgress: (results: Record<number, any>, answers: Record<number, string>) => void;
  savedResults?: Record<number, any>;
  savedAnswers?: Record<number, string>;
  type: 'concept' | 'coding';
}

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export const ProblemSolving: React.FC<ProblemSolvingProps> = ({ 
  problems, 
  onFinish, 
  onProblemChange, 
  onBackToConcept,
  onSaveProgress,
  savedResults = {},
  savedAnswers = {},
  type 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>(savedAnswers);
  const [results, setResults] = useState<Record<number, { isCorrect: boolean; feedback: string; output?: string[] }>>(savedResults as any);
  const [output, setOutput] = useState<string[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  
  const pyodideRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputBufferRef = useRef<string[]>([]);

  const currentProb = problems && problems.length > 0 ? problems[currentIndex] : null;
  const currentResult = results[currentIndex];
  const currentUserAnswer = userAnswers[currentIndex] || '';

  useEffect(() => {
    if (currentProb) {
      onProblemChange?.(currentProb);
    }
  }, [currentIndex, currentProb, onProblemChange]);

  // 각 문제별로 셔플된 옵션을 고정하기 위해 useMemo 사용
  const allShuffledOptions = useMemo(() => {
    return problems.map(p => {
      if (!p.options) return [];
      return [...p.options].sort(() => Math.random() - 0.5);
    });
  }, [problems]);

  useEffect(() => {
    // 이미 푼 문제가 아니라면 초기화
    if (!results[currentIndex]) {
      setOutput([]);
      outputBufferRef.current = [];
    } else {
      setOutput(results[currentIndex].output || []);
    }
    
    if (textareaRef.current) textareaRef.current.focus();

    const initPyodide = async () => {
      if (window.loadPyodide && !pyodideRef.current && type === 'coding') {
        setIsEngineLoading(true);
        try {
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
          });
          const handleOutput = (text: string) => {
            const trimmed = text.trimEnd();
            if (trimmed) {
              outputBufferRef.current.push(trimmed);
              setOutput([...outputBufferRef.current]);
            }
          };
          pyodideRef.current.setStdout({ batched: handleOutput });
          pyodideRef.current.setStderr({ batched: handleOutput });
        } catch (e) {
          console.error("Pyodide init failed:", e);
        }
        setIsEngineLoading(false);
      }
    };
    initPyodide();
  }, [currentIndex, type]);

  const handleExecute = async () => {
    if (!pyodideRef.current) return;
    setOutput(["실행 중..."]);
    outputBufferRef.current = [];
    try {
      await pyodideRef.current.runPythonAsync(currentUserAnswer);
    } catch (e: any) {
      const errMsg = `❌ Error: ${e.message}`;
      outputBufferRef.current.push(errMsg);
      setOutput([...outputBufferRef.current]);
    }
  };

  const handleSubmit = async () => {
    if (!currentProb || results[currentIndex]) return;

    let isCorrect = false;
    let feedback = "";

    if (type === 'concept') {
      isCorrect = currentUserAnswer === currentProb.answer;
      feedback = isCorrect 
        ? `### 정답입니다! 🎉\n\n${currentProb.explanation || '훌륭합니다! 핵심 원리를 정확히 이해하셨네요.'}`
        : `### 오답입니다 😢\n\n내가 선택한 답: **${currentUserAnswer}**\n정답: **${currentProb.answer}**\n\n**해설:** ${currentProb.explanation || '제시된 보기를 다시 한번 확인해보세요.'}`;
    } else {
      const actualOutput = output.join('\n').trim();
      const expectedOutput = currentProb.exampleOutput?.trim() || "";
      isCorrect = actualOutput === expectedOutput;

      feedback = isCorrect
        ? `### 구현 성공! 🎉\n\n예상 출력 결과와 정확히 일치합니다.\n\n**실행 결과:**\n\`\`\`\n${actualOutput}\n\`\`\`\n\n**핵심 로직 설명:** ${currentProb.explanation || '정확한 출력문을 구현하셨습니다.'}`
        : `### 결과 불일치 😢\n\n출력값이 정답과 다릅니다.\n\n**나의 출력:**\n\`\`\`\n${actualOutput || '(출력 없음)'}\n\`\`\`\n\n**예상 출력:**\n\`\`\`\n${expectedOutput}\n\`\`\``;
    }

    const newResults = {
      ...results,
      [currentIndex]: { isCorrect, feedback, output: [...output] }
    };
    
    setResults(newResults);
    // 부모 컴포넌트에 현재 진행 상황 동기화
    onSaveProgress(newResults, userAnswers);
  };

  const handleNextAction = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const missed = problems.filter((_, idx) => !results[idx]?.isCorrect);
      onFinish(missed);
    }
  };

  if (!currentProb) return null;

  return (
    <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto glass rounded-[40px] border-white/5 bg-black/60 overflow-hidden shadow-2xl mb-20 relative z-10">
      {/* Top Navigation Bar */}
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`p-3 rounded-xl ${type === 'concept' ? 'bg-[#007AFF]/20 text-[#007AFF]' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {type === 'concept' ? <HelpCircle size={20} /> : <Terminal size={20} />}
          </div>
          <div className="flex items-center gap-2">
            {problems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  currentIndex === idx 
                    ? 'ring-2 ring-[#007AFF] ring-offset-2 ring-offset-black bg-[#007AFF] text-white scale-110' 
                    : results[idx]
                      ? results[idx].isCorrect 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                      : 'bg-white/10 text-gray-500 hover:bg-white/20'
                }`}
              >
                {results[idx] ? (results[idx].isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />) : idx + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
           {currentIndex + 1} / {problems.length} Problems
        </div>
      </div>

      <div className="p-10 lg:p-14">
        <div className="mb-10">
          <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.2em] mb-3 block">Challenge Task</span>
          <h4 className="text-2xl lg:text-3xl font-bold text-white leading-tight whitespace-pre-line">{currentProb.question}</h4>
        </div>

        <div className="min-h-[320px]">
          {type === 'concept' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allShuffledOptions[currentIndex].map((opt, i) => (
                <button
                  key={i}
                  disabled={!!results[currentIndex]}
                  onClick={() => {
                    const newAnswers = { ...userAnswers, [currentIndex]: opt };
                    setUserAnswers(newAnswers);
                    // 답안 선택 시에도 부모와 동기화 (제출 전이지만 상태 유지 위해)
                    onSaveProgress(results, newAnswers);
                  }}
                  className={`p-6 lg:p-8 rounded-[28px] text-left text-lg font-bold border transition-all flex items-center justify-between group ${
                    currentUserAnswer === opt 
                      ? results[currentIndex]
                        ? results[currentIndex].isCorrect 
                          ? 'border-green-500 bg-green-500/10 text-green-400' 
                          : 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-[#007AFF] bg-[#007AFF]/10 text-white' 
                      : 'border-white/5 text-gray-500 hover:bg-white/5'
                  }`}
                >
                  <span className="flex-1">{opt}</span>
                  {currentUserAnswer === opt && (
                    results[currentIndex]?.isCorrect ? <CheckCircle2 size={20} /> : results[currentIndex] ? <XCircle size={20} /> : null
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-full glass rounded-[32px] border-white/10 overflow-hidden bg-[#050505] flex flex-col shadow-inner">
                <div className="flex overflow-hidden relative font-mono text-lg lg:text-xl min-h-[280px]">
                  <textarea
                    ref={textareaRef}
                    value={currentUserAnswer}
                    onChange={(e) => {
                      const newAnswers = { ...userAnswers, [currentIndex]: e.target.value };
                      setUserAnswers(newAnswers);
                      onSaveProgress(results, newAnswers);
                    }}
                    disabled={!!results[currentIndex]}
                    className="flex-1 bg-transparent border-none outline-none text-cyan-400 p-8 resize-none leading-relaxed font-mono"
                    placeholder="# 여기에 파이썬 코드를 작성하세요..."
                    spellCheck={false}
                  />
                </div>
                {!results[currentIndex] && (
                  <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                     <button onClick={handleExecute} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-300 transition-colors">
                       <Play size={14} className="text-green-500" /> 코드 실행
                     </button>
                  </div>
                )}
              </div>
              <div className="glass bg-black/60 border-white/5 rounded-2xl p-6 font-mono min-h-[100px] shadow-inner">
                 <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Terminal Output</div>
                 {output.length > 0 ? (
                   output.map((line, i) => <div key={i} className="text-green-400/90 mb-1 text-sm">{line}</div>)
                 ) : (
                   <div className="text-gray-800 italic text-sm">실행 결과가 여기에 표시됩니다.</div>
                 )}
              </div>
            </div>
          )}
        </div>

        {results[currentIndex] ? (
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-8 lg:p-12 glass rounded-[32px] border-white/5 flex flex-col gap-8 relative z-20 bg-white/[0.01]">
             <div className="flex-1">
                <div className="text-lg text-gray-300 leading-relaxed"><FormattedText text={results[currentIndex].feedback} /></div>
                
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <button 
                    onClick={onBackToConcept}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#007AFF] transition-all text-sm font-bold group"
                  >
                    <BookOpen size={16} className="group-hover:-rotate-12 transition-transform" />
                    개념이 기억 안 나시나요? (학습으로 돌아가기)
                  </button>

                  <button 
                    onClick={handleNextAction} 
                    className="w-full sm:w-auto px-10 py-5 bg-[#007AFF] text-white rounded-[20px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {currentIndex < problems.length - 1 ? (
                      <>다음 문제로 이동 <ChevronRight size={18} /></>
                    ) : (
                      <>학습 완료하기 <CheckCircle2 size={18} /></>
                    )}
                  </button>
                </div>
             </div>
          </MotionDiv>
        ) : (
          <div className="mt-12 flex justify-between items-center">
             <div className="flex gap-2">
                <button onClick={() => { 
                  const newAnswers = { ...userAnswers, [currentIndex]: '' };
                  setUserAnswers(newAnswers); 
                  setOutput([]); 
                  onSaveProgress(results, newAnswers);
                }} className="p-4 glass rounded-2xl text-gray-600 hover:text-white transition-colors" title="초기화">
                  <RotateCcw size={20} />
                </button>
                <button 
                  onClick={onBackToConcept} 
                  className="p-4 glass rounded-2xl text-gray-600 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  <BookOpen size={18} /> 개념 다시보기
                </button>
             </div>
             <button 
               onClick={handleSubmit} 
               disabled={!currentUserAnswer.trim() && type === 'coding'} 
               className="px-12 py-5 rounded-[22px] font-black text-lg flex items-center gap-3 bg-[#007AFF] text-white shadow-2xl shadow-[#007AFF]/30 active:scale-95 transition-all disabled:opacity-30"
             >
                정답 제출하기 <CheckCircle2 size={20} />
             </button>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};
