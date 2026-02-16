
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Play, RotateCcw, Loader2, Sparkles, Code2, ChevronDown } from 'lucide-react';
import { askGemini } from '../services/geminiService';

type Language = 'python' | 'c';

export const Playground: React.FC = () => {
  const [lang, setLang] = useState<Language>('python');
  const [code, setCode] = useState('name = input("이름을 입력하세요: ")\nprint(f"안녕, {name}님!")');
  const [output, setOutput] = useState<string[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const pyodideRef = useRef<any>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const outputBufferRef = useRef<string[]>([]);
  
  const lineCount = Math.max(15, code.split('\n').length + 3);

  useEffect(() => {
    if (lang === 'python') {
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

            pyodideRef.current.setStdin({
              read() {
                const result = window.prompt("입력이 필요합니다:");
                if (result === null) return null;
                
                const inputLine = result + "\n";
                outputBufferRef.current.push(`> ${result}`);
                setOutput([...outputBufferRef.current]);
                
                return inputLine;
              }
            });

          } catch (e) {
            console.error("Pyodide 초기화 실패:", e);
            setOutput(["엔진 로드 중 오류가 발생했습니다."]);
          }
          setIsEngineLoading(false);
        }
      };
      initPyodide();
    }
  }, [lang]);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    if (newLang === 'c') {
      setCode('#include <stdio.h>\n\nint main() {\n    char name[20];\n    printf("이름을 입력하세요: ");\n    scanf("%s", name);\n    printf("안녕, %s님!\\n", name);\n    return 0;\n}');
    } else {
      setCode('name = input("이름을 입력하세요: ")\nprint(f"안녕, {name}님!")');
    }
    setOutput([]);
  };

  const runCode = async () => {
    if (isExecuting) return;
    
    setOutput(["실행을 준비합니다..."]);
    outputBufferRef.current = [];
    setIsExecuting(true);

    if (lang === 'python' && pyodideRef.current) {
      try {
        await pyodideRef.current.runPythonAsync(code);
        if (outputBufferRef.current.length === 0) {
          setOutput([">>> 실행 완료 (출력 없음)"]);
        }
      } catch (e: any) {
        setOutput([...outputBufferRef.current, `❌ Error: ${e.message}`]);
      }
    } else if (lang === 'c') {
      const prompt = `C언어 코드를 시뮬레이션 해주세요:\n${code}`;
      try {
        const result = await askGemini(prompt, "C Language Simulation Mode");
        setOutput(result.split('\n'));
      } catch (e) {
        setOutput(["시뮬레이션 중 오류가 발생했습니다."]);
      }
    }
    setIsExecuting(false);
  };

  return (
    <div className="p-4 lg:p-12 h-full flex flex-col gap-4 lg:gap-8 max-w-[1600px] mx-auto overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto">
          <div className="relative group shrink-0">
            <button className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-4 glass rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base text-[#007AFF] hover:bg-white/5 transition-all">
              {lang === 'python' ? 'Python 3.12' : 'C Language'} <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-40 lg:w-48 glass rounded-xl lg:rounded-2xl border-white/10 hidden group-hover:block z-50 overflow-hidden shadow-2xl">
              <button onClick={() => handleLangChange('python')} className="w-full px-5 py-3 lg:py-4 text-left hover:bg-white/5 transition-all text-xs lg:text-sm font-bold border-b border-white/5">Python 3.12</button>
              <button onClick={() => handleLangChange('c')} className="w-full px-5 py-3 lg:py-4 text-left hover:bg-white/5 transition-all text-xs lg:text-sm font-bold">C Language</button>
            </div>
          </div>
          <h2 className="text-xl lg:text-4xl font-bold tracking-tight truncate">연습장</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button onClick={() => setCode('')} className="p-2.5 lg:p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-white transition-all shrink-0"><RotateCcw size={18} /></button>
           <button onClick={runCode} disabled={isExecuting || isEngineLoading} className="flex-1 sm:flex-none px-6 lg:px-10 py-2.5 lg:py-4 bg-[#007AFF] text-white rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 lg:gap-3 shadow-2xl active:scale-95 transition-all text-sm lg:text-base disabled:opacity-50">
             {isExecuting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />} 실행
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-4 lg:gap-8 min-h-0">
        <div className="flex-[2] glass rounded-[24px] lg:rounded-[40px] border-white/10 bg-[#050505] flex flex-col shadow-2xl overflow-hidden min-h-[300px]">
           <div className="px-5 py-3 lg:py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
              <div className="flex gap-1.5 lg:gap-2.5"><div className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 rounded-full bg-red-500/20 border border-red-500/30" /><div className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" /><div className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 rounded-full bg-green-500/20 border border-green-500/30" /></div>
              <span className="text-[8px] lg:text-[10px] text-gray-500 font-mono uppercase tracking-widest">{lang === 'python' ? 'main.py' : 'main.c'}</span>
           </div>
           <div className="flex-1 flex overflow-hidden relative font-mono text-sm lg:text-xl">
              <div ref={lineNumbersRef} className="w-10 lg:w-16 bg-black/40 border-r border-white/5 pt-6 lg:pt-10 flex flex-col items-stretch text-gray-700 select-none overflow-hidden">
                {Array.from({ length: lineCount }).map((_, i) => (<div key={i} className="h-[24px] lg:h-[32px] flex items-center justify-end pr-2 lg:pr-4 text-[9px] lg:text-[13px] font-bold">{i + 1}</div>))}
              </div>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-cyan-400 pt-6 lg:pt-10 px-4 lg:px-8 pb-10 resize-none leading-[24px] lg:leading-[32px] font-mono whitespace-pre custom-scrollbar" spellCheck={false} />
           </div>
        </div>
        
        <div className="flex-1 glass rounded-[24px] lg:rounded-[40px] border-white/10 bg-[#0a0a0a] flex flex-col shadow-2xl overflow-hidden min-h-[200px] xl:min-h-0">
           <div className="px-5 py-3 lg:py-4 bg-white/[0.03] border-b border-white/5 flex items-center gap-3"><Terminal size={16} className="text-[#007AFF]" /><span className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Output</span></div>
           <div className="flex-1 p-5 lg:p-8 font-mono text-xs lg:text-base overflow-y-auto bg-black/40 custom-scrollbar">
               {isEngineLoading ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                   <Loader2 size={32} className="animate-spin text-[#007AFF]" />
                   <p className="text-sm font-bold tracking-tight">파이썬 엔진 준비 중...</p>
                 </div>
               ) : output.length === 0 ? (
                 <div className="text-gray-700 italic flex items-center gap-2 h-full justify-center text-sm">
                   <Sparkles size={18} /> 코드를 실행하여 결과를 확인하세요.
                 </div>
               ) : (
                 output.map((line, i) => <div key={i} className="text-green-400/90 mb-1 leading-relaxed">{line}</div>)
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
