
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Problem } from '../types';
import { HelpCircle, Terminal, Play, RotateCcw, Bot, CheckCircle2, Loader2, Activity } from 'lucide-react';
import { askGemini } from '../services/geminiService';
import { FormattedText } from './FormattedText';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;

interface ProblemSolvingProps {
  problems: Problem[];
  onFinish: (missed: Problem[]) => void;
  onProblemChange?: (prob: Problem) => void;
  type: 'concept' | 'coding';
}

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export const ProblemSolving: React.FC<ProblemSolvingProps> = ({ problems, onFinish, onProblemChange, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [missed, setMissed] = useState<Problem[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const pyodideRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputBufferRef = useRef<string[]>([]);

  const currentProb = problems && problems.length > 0 ? problems[currentIndex] : null;

  useEffect(() => {
    if (currentProb) {
      onProblemChange?.(currentProb);
    }
  }, [currentIndex, currentProb, onProblemChange]);

  const shuffledOptions = useMemo(() => {
    if (!currentProb || !currentProb.options) return [];
    return [...currentProb.options].sort(() => Math.random() - 0.5);
  }, [currentIndex, currentProb]);

  useEffect(() => {
    setUserAnswer('');
    setIsCorrect(null);
    setAiFeedback(null);
    setOutput([]);
    outputBufferRef.current = [];
    if (textareaRef.current) textareaRef.current.focus();

    const initPyodide = async () => {
      if (window.loadPyodide && !pyodideRef.current) {
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
  }, [currentIndex]);

  const handleExecute = async () => {
    if (!pyodideRef.current) return;
    setOutput(["실행 중..."]);
    outputBufferRef.current = [];
    try {
      await pyodideRef.current.runPythonAsync(userAnswer);
    } catch (e: any) {
      setOutput([...outputBufferRef.current, `❌ Error: ${e.message}`]);
    }
  };

  const handleSubmit = async () => {
    if (!currentProb) return;

    if (type === 'concept') {
      const matched = userAnswer === currentProb.answer;
      setIsCorrect(matched);
      if (!matched) setMissed(prev => [...prev, currentProb]);
      const feedback = matched 
        ? `### 정답입니다! 🎉\n${currentProb.explanation || '완벽하게 이해하셨네요!'}`
        : `### 틀렸습니다! 😢\n정답은 **${currentProb.answer}** 입니다.\n\n**이유:** ${currentProb.explanation || '다시 한 번 생각해보세요.'}`;
      setAiFeedback(feedback);
    } else {
      setIsAiLoading(true);
      const gradingPrompt = `사용자의 파이썬 코드가 아래 문제에 정답인지 판단하세요.\n[문제]: ${currentProb.question}\n[정답 예시]: ${currentProb.answer}\n[사용자 코드]: ${userAnswer}\n[실행 결과]: ${output.join('\n')}\n응답 형식: "TRUE" 또는 "FALSE" 한 줄 이후 상세 설명을 적으세요.`;
      try {
        const result = await askGemini(gradingPrompt, "Grading Mode");
        const matched = result.trim().toUpperCase().startsWith("TRUE");
        setIsCorrect(matched);
        if (!matched) setMissed(prev => [...prev, currentProb]);
        setAiFeedback(result.split('\n').slice(1).join('\n'));
      } catch (e) {
        setAiFeedback("분석 중 오류가 발생했습니다.");
      }
      setIsAiLoading(false);
    }
  };

  const handleNextAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(missed);
    }
  };

  if (!currentProb) return null;

  return (
    <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto glass rounded-[40px] border-white/5 bg-black/60 overflow-hidden shadow-2xl mb-20 relative z-10">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-[20px] ${type === 'concept' ? 'bg-[#007AFF]/20 text-[#007AFF]' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {type === 'concept' ? <HelpCircle size={28} /> : <Terminal size={28} />}
          </div>
          <div>
            <h3 className="font-bold text-2xl tracking-tight">{type === 'concept' ? '개념 마스터' : '코드 챌린지'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#007AFF]" style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="text-gray-500 font-mono text-sm">{currentIndex + 1} / {problems.length}</div>
      </div>

      <div className="p-12">
        <h4 className="text-3xl font-bold text-white mb-8 leading-tight">{currentProb.question}</h4>

        {type === 'coding' && (currentProb.exampleInput || currentProb.exampleOutput) && (
          <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
            {currentProb.exampleOutput && (
              <div className="flex-1 min-w-[240px] glass bg-white/[0.02] p-6 rounded-3xl border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  <CheckCircle2 size={14} className="text-green-500" /> Example Output
                </div>
                <pre className="font-mono text-green-400/80 bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre">{currentProb.exampleOutput}</pre>
              </div>
            )}
          </div>
        )}

        <div className="min-h-[300px]">
          {type === 'concept' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {shuffledOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={isCorrect !== null}
                  onClick={() => setUserAnswer(opt)}
                  className={`p-8 rounded-[32px] text-left text-xl font-bold border transition-all flex items-center justify-between group ${
                    userAnswer === opt ? 'border-[#007AFF] bg-[#007AFF]/10 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="w-full glass rounded-[32px] border-white/10 overflow-hidden bg-[#050505] flex flex-col shadow-inner">
                <div className="flex overflow-hidden relative font-mono text-xl md:text-2xl min-h-[300px]">
                  <textarea
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isCorrect !== null}
                    className="flex-1 bg-transparent border-none outline-none text-cyan-400 pt-10 px-8 pb-10 resize-none leading-[44px] font-mono"
                    placeholder="# 코드를 입력하세요..."
                    spellCheck={false}
                  />
                </div>
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                   <button onClick={handleExecute} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-300 transition-colors">
                     <Play size={14} className="text-green-500" /> 코드 실행
                   </button>
                </div>
              </div>
              {output.length > 0 && (
                <div className="glass bg-black border-white/5 rounded-2xl p-6 font-mono text-green-400/90 whitespace-pre-wrap">
                  {output.map((line, i) => <div key={i} className="text-green-400/90 mb-1">{line}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        {aiFeedback ? (
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-10 glass-blue border-[#007AFF]/20 rounded-[40px] flex flex-col gap-8 relative z-20">
             <div className="flex-1">
                <div className="text-lg text-gray-300 leading-relaxed"><FormattedText text={aiFeedback} /></div>
                <div className="mt-10 flex justify-end">
                  <button 
                    type="button"
                    onClick={handleNextAction} 
                    className="px-12 py-5 bg-[#007AFF] text-white rounded-[24px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-[100] pointer-events-auto"
                  >
                    {currentIndex < problems.length - 1 ? '다음 문제로' : '학습 완료하기'}
                  </button>
                </div>
             </div>
          </MotionDiv>
        ) : (
          <div className="mt-16 flex justify-end gap-5 items-center">
             <button onClick={() => { setUserAnswer(''); setOutput([]); }} className="p-5 glass rounded-2xl text-gray-600 hover:text-white transition-colors"><RotateCcw size={24} /></button>
             <button onClick={handleSubmit} disabled={!userAnswer.trim() || isAiLoading} className="px-16 py-6 rounded-[30px] font-black text-lg flex items-center gap-4 bg-[#007AFF] text-white shadow-2xl shadow-[#007AFF]/30 active:scale-95 transition-all disabled:opacity-50">
                {isAiLoading ? <Loader2 className="animate-spin" /> : <>결과 확인 <CheckCircle2 size={24} /></>}
             </button>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};
