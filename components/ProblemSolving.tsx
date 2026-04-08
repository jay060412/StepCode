
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Problem } from '../types';
import { HelpCircle, Terminal, Play, RotateCcw, CheckCircle2, XCircle, ChevronLeft, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react';
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
  language?: string;
}

declare global {
  interface Window {
    loadPyodide: any;
  }
}

const getResultLabel = (status: string) => {
  switch (status) {
    case 'accepted':
      return '정답';
    case 'wrong_answer':
      return '오답';
    case 'compile_error':
      return '컴파일 에러';
    case 'runtime_error':
      return '런타임 에러';
    case 'time_limit_exceeded':
      return '시간 초과';
    default:
      return '시스템 오류';
  }
};

export const ProblemSolving: React.FC<ProblemSolvingProps> = ({ 
  problems, 
  onFinish, 
  onProblemChange, 
  onBackToConcept,
  onSaveProgress,
  savedResults = {},
  savedAnswers = {},
  type,
  language = 'python'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>(savedAnswers);
  const [results, setResults] = useState<Record<number, { isCorrect: boolean; feedback: string; output?: string[]; grading?: any }>>(savedResults as any);
  const [output, setOutput] = useState<string[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  
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
    if (!currentProb || results[currentIndex] || isGrading) return;

    let isCorrect = false;
    let feedback = "";
    let gradingData = null;

    if (type === 'concept') {
      isCorrect = currentUserAnswer === currentProb.answer;
      feedback = isCorrect 
        ? `### 정답입니다! 🎉\n\n${currentProb.explanation || '훌륭합니다! 핵심 원리를 정확히 이해하셨네요.'}`
        : `### 오답입니다 😢\n\n내가 선택한 답: **${currentUserAnswer}**\n정답: **${currentProb.answer}**\n\n**해설:** ${currentProb.explanation || '제시된 보기를 다시 한번 확인해보세요.'}`;
    } else {
      setIsGrading(true);
      try {
        const response = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: currentUserAnswer,
            testCases: currentProb.testCases || []
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Grading server error');
        }
        
        const data = await response.json();
        gradingData = data;
        // 모든 테스트 케이스가 'accepted'인 경우에만 정답으로 처리
        isCorrect = data.results.every((r: any) => r.status === 'accepted');

        if (isCorrect) {
          feedback = `### 구현 성공! 🎉\n\n모든 테스트 케이스(${data.results.length}개)를 통과했습니다.\n\n**핵심 로직 설명:** ${currentProb.explanation || '정확한 로직을 구현하셨습니다.'}`;
        } else {
          const failedCount = data.results.filter((r: any) => r.status !== 'accepted').length;
          feedback = `### 구현 실패 😢\n\n총 ${data.results.length}개의 테스트 케이스 중 ${failedCount}개에서 오류가 발생했습니다.\n\n**힌트:** ${currentProb.hint || '입출력 형식을 다시 확인해보세요.'}`;
        }
      } catch (e) {
        console.error("Grading failed:", e);
        feedback = `### 채점 서버 오류 ⚠️\n\n채점 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`;
        setIsGrading(false);
        return; // 오류 시 제출 처리 안 함
      }
      setIsGrading(false);
    }

    const newResults = {
      ...results,
      [currentIndex]: { isCorrect, feedback, output: [...output], grading: gradingData }
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
    <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto glass rounded-[24px] lg:rounded-[40px] border-black/5 bg-white overflow-hidden shadow-2xl mb-10 lg:mb-20 relative z-10">
      {/* Top Navigation Bar */}
      <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-black/5 bg-black/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-6">
          <div className={`p-2 lg:p-3 rounded-xl ${type === 'concept' ? 'bg-orange-accent/20 text-orange-accent' : 'bg-teal-accent/20 text-teal-accent'}`}>
            {type === 'concept' ? <HelpCircle size={18} /> : <Terminal size={18} />}
          </div>
          <div className="flex items-center gap-1.5 lg:gap-2">
            {problems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[8px] lg:text-[10px] font-black transition-all ${
                  currentIndex === idx 
                    ? 'ring-2 ring-orange-accent ring-offset-2 ring-offset-background bg-orange-accent text-white scale-110' 
                    : results[idx]
                      ? results[idx].isCorrect 
                        ? 'bg-teal-accent text-white' 
                        : 'bg-red-500 text-white'
                      : 'bg-black/10 text-gray-500 hover:bg-black/20'
                }`}
              >
                {results[idx] ? (results[idx].isCorrect ? <CheckCircle2 size={10} /> : <XCircle size={10} />) : idx + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">
           {currentIndex + 1} / {problems.length} <span className="hidden sm:inline">Problems</span>
        </div>
      </div>

      <div className="p-6 lg:p-14">
        <div className="mb-6 lg:mb-10">
          <span className="text-[8px] lg:text-[10px] font-black text-orange-accent uppercase tracking-[0.2em] mb-2 lg:mb-3 block">Challenge Task</span>
          
          {type === 'coding' ? (
            <div className="space-y-8">
              <h4 className="text-xl lg:text-3xl font-bold text-main leading-tight whitespace-pre-line">{currentProb.question}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentProb.inputDescription && (
                  <div className="glass p-6 rounded-2xl border-black/5 bg-black/[0.01]">
                    <h5 className="text-xs font-black text-orange-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ChevronRight size={14} /> Input Description
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">{currentProb.inputDescription}</p>
                  </div>
                )}
                {currentProb.outputDescription && (
                  <div className="glass p-6 rounded-2xl border-black/5 bg-black/[0.01]">
                    <h5 className="text-xs font-black text-teal-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ChevronRight size={14} /> Output Description
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">{currentProb.outputDescription}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentProb.exampleInput && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Example Input</h5>
                    <pre className="p-4 bg-black/5 rounded-xl font-mono text-xs text-gray-600 border border-black/5">{currentProb.exampleInput}</pre>
                  </div>
                )}
                {currentProb.exampleOutput && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Example Output</h5>
                    <pre className="p-4 bg-black/5 rounded-xl font-mono text-xs text-gray-600 border border-black/5">{currentProb.exampleOutput}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <h4 className="text-xl lg:text-3xl font-bold text-main leading-tight whitespace-pre-line">{currentProb.question}</h4>
          )}
        </div>

        <div className="min-h-[250px] lg:min-h-[320px]">
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
                          ? 'border-teal-accent bg-teal-accent/10 text-teal-accent' 
                          : 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-orange-accent bg-orange-accent/10 text-main' 
                      : 'border-black/5 text-gray-500 hover:bg-black/5'
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
              <div className="w-full glass rounded-[32px] border-black/10 overflow-hidden bg-white flex flex-col shadow-inner">
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
                    className="flex-1 bg-transparent border-none outline-none text-teal-accent p-8 resize-none leading-relaxed font-mono"
                    placeholder="# 여기에 파이썬 코드를 작성하세요..."
                    spellCheck={false}
                  />
                </div>
                {!results[currentIndex] && (
                  <div className="p-4 bg-black/[0.02] border-t border-black/5 flex justify-end gap-3">
                     {language === 'python' && (
                       <button 
                         onClick={handleExecute} 
                         disabled={isGrading}
                         className="flex items-center gap-2 px-6 py-3 bg-black/5 hover:bg-black/10 rounded-2xl text-xs font-bold text-main transition-colors disabled:opacity-50"
                       >
                         <Play size={14} className="text-teal-accent" /> 코드 실행
                       </button>
                     )}
                  </div>
                )}
              </div>
              <div className="glass bg-white border border-black/10 rounded-2xl p-6 font-mono min-h-[100px] shadow-inner">
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Terminal Output</div>
                 {output.length > 0 ? (
                   output.map((line, i) => <div key={i} className="text-teal-accent mb-1 text-sm">{line}</div>)
                 ) : (
                   <div className="text-gray-400 italic text-sm">실행 결과가 여기에 표시됩니다.</div>
                 )}
              </div>
            </div>
          )}
        </div>

        {results[currentIndex] ? (
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 lg:mt-12 p-6 lg:p-12 glass rounded-[24px] lg:rounded-[32px] border-black/10 flex flex-col gap-6 lg:gap-8 relative z-20 bg-white shadow-xl">
             <div className="flex-1">
                <div className="text-base lg:text-lg text-main leading-relaxed">
                  <FormattedText text={results[currentIndex].feedback} />
                </div>

                {results[currentIndex].grading && (
                  <div className="mt-8 space-y-6">
                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Test Case Results</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {results[currentIndex].grading.results.map((r: any, i: number) => (
                        <div key={i} className={`p-4 rounded-xl border flex flex-col gap-2 ${r.status === 'accepted' ? 'bg-teal-accent/5 border-teal-accent/20 text-teal-accent' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-tighter">테스트 {r.index || i + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold">{getResultLabel(r.status)}</span>
                              {r.status === 'accepted' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            </div>
                          </div>
                          
                          {r.status === 'wrong_answer' && (
                            <div className="mt-1 space-y-1 text-[10px] font-mono opacity-80">
                              <div className="flex justify-between"><span>기댓값:</span> <span>{r.expected}</span></div>
                              <div className="flex justify-between"><span>실제값:</span> <span>{r.actual}</span></div>
                            </div>
                          )}

                          {(r.status === 'compile_error' || r.status === 'runtime_error' || r.status === 'system_error') && (
                            <div className="mt-1 p-2 bg-black/5 rounded text-[9px] font-mono break-all line-clamp-2">
                              {r.stderr || r.message}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 상세 오답 정보 표시 (첫 번째 실패 케이스) */}
                    {results[currentIndex].grading.results.some((r: any) => r.status !== 'accepted') && (
                      <div className="mt-6 p-6 bg-red-50 rounded-2xl border border-red-100">
                        <h6 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                          <AlertTriangle size={16} /> 상세 오류 분석
                        </h6>
                        <div className="space-y-4">
                          {results[currentIndex].grading.results.filter((r: any) => r.status !== 'accepted').slice(0, 1).map((r: any, i: number) => (
                            <div key={i} className="grid grid-cols-1 gap-4 text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">
                                  {getResultLabel(r.status)}
                                </span>
                                <span className="text-gray-400 font-bold">테스트 케이스 {r.index || currentIndex + 1}</span>
                              </div>

                              {r.input && (
                                <div className="space-y-1">
                                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Input:</span>
                                  <pre className="p-3 bg-white rounded-lg border border-red-100 font-mono text-gray-600 overflow-x-auto">{r.input}</pre>
                                </div>
                              )}

                              {r.status === 'wrong_answer' ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Your Output:</span>
                                    <pre className="p-3 bg-white rounded-lg border border-red-100 font-mono text-red-400 overflow-x-auto">{r.actual || '(없음)'}</pre>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Expected Output:</span>
                                    <pre className="p-3 bg-white rounded-lg border border-red-100 font-mono text-teal-600 overflow-x-auto">{r.expected}</pre>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Error Message:</span>
                                  <pre className="p-3 bg-white rounded-lg border border-red-100 font-mono text-red-500 whitespace-pre-wrap overflow-x-auto">
                                    {r.stderr || r.message || '상세 에러 내용이 없습니다.'}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                          {results[currentIndex].grading.results.filter((r: any) => r.status !== 'accepted').length > 1 && (
                            <p className="text-[10px] text-red-400 italic mt-2">
                              * 외 {results[currentIndex].grading.results.filter((r: any) => r.status !== 'accepted').length - 1}개의 테스트 케이스가 더 실패했습니다.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <button 
                    onClick={onBackToConcept}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-accent transition-all text-[10px] lg:text-sm font-bold group"
                  >
                    <BookOpen size={16} className="group-hover:-rotate-12 transition-transform" />
                    개념이 기억 안 나시나요? <span className="hidden sm:inline">(학습으로 돌아가기)</span>
                  </button>

                  <button 
                    onClick={handleNextAction} 
                    className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-orange-accent text-white rounded-[16px] lg:rounded-[20px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm lg:text-base"
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
          <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
             <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => { 
                  const newAnswers = { ...userAnswers, [currentIndex]: '' };
                  setUserAnswers(newAnswers); 
                  setOutput([]); 
                  onSaveProgress(results, newAnswers);
                }} className="flex-1 sm:flex-none p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-main transition-colors border border-black/5 bg-white shadow-md flex items-center justify-center" title="초기화">
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={onBackToConcept} 
                  className="flex-[2] sm:flex-none p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-main transition-colors flex items-center justify-center gap-2 text-[10px] lg:text-xs font-bold border border-black/5 bg-white shadow-md"
                >
                  <BookOpen size={16} /> 개념 다시보기
                </button>
             </div>
             <button 
               onClick={handleSubmit} 
               disabled={!currentUserAnswer.trim() || isGrading} 
               className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-5 rounded-[16px] lg:rounded-[22px] font-black text-base lg:text-lg flex items-center justify-center gap-3 bg-orange-accent text-white shadow-2xl shadow-orange-accent/30 active:scale-95 transition-all disabled:opacity-30"
             >
                {isGrading ? '채점 중...' : '정답 제출하기'} <CheckCircle2 size={20} />
             </button>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};
