
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Play, RotateCcw, Loader2, Sparkles, Code2, ChevronDown } from 'lucide-react';
import { askGemini } from '../services/geminiService';

type Language = 'python' | 'c';

export const Playground: React.FC = () => {
  const [lang, setLang] = useState<Language>('python');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [code, setCode] = useState('name = input("이름을 입력하세요: ")\nprint(f"안녕, {name}님!")');
  const [output, setOutput] = useState<string>('');
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const pyodideRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const outputBufferRef = useRef<string>('');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputResolveRef = useRef<((value: string) => void) | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  
  const lineCount = Math.max(15, code.split('\n').length + 3);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      setCode(newValue);
      
      // Selection update needs to happen after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputResolveRef.current) {
      const value = inputValue;
      setInputValue('');
      setIsWaitingForInput(false);
      
      // Add the input to the output log
      outputBufferRef.current += value + "\n";
      setOutput(outputBufferRef.current);
      
      inputResolveRef.current(value);
      inputResolveRef.current = null;
    }
  };

  // 스크롤 동기화
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, isWaitingForInput]);

  // Pyodide 초기화 및 입출력 설정
  useEffect(() => {
    if (lang === 'python') {
      const initPyodide = async () => {
        if (window.loadPyodide && !pyodideRef.current) {
          setIsEngineLoading(true);
          try {
            pyodideRef.current = await window.loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
            });

            // 1. 표준 출력(Stdout) 및 에러(Stderr) 설정
            const handleOutput = (text: string) => {
              outputBufferRef.current += text;
              setOutput(outputBufferRef.current);
            };

            pyodideRef.current.setStdout({ batched: handleOutput });
            pyodideRef.current.setStderr({ batched: handleOutput });

          } catch (e) {
            console.error("Pyodide 초기화 실패:", e);
            setOutput("엔진 로드 중 오류가 발생했습니다.");
          }
          setIsEngineLoading(false);
        }
      };
      initPyodide();
    }
  }, [lang]);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    setIsLangOpen(false);
    if (newLang === 'c') {
      setCode('#include <stdio.h>\n\nint main() {\n    char name[20];\n    printf("이름을 입력하세요: ");\n    scanf("%s", name);\n    printf("안녕, %s님!\\n", name);\n    return 0;\n}');
    } else {
      setCode('name = input("이름을 입력하세요: ")\nprint(f"안녕, {name}님!")');
    }
    setOutput('');
    outputBufferRef.current = '';
  };

  const stopCode = () => {
    setIsExecuting(false);
    setIsWaitingForInput(false);
    if (inputResolveRef.current) {
      inputResolveRef.current('');
      inputResolveRef.current = null;
    }
    outputBufferRef.current += "\n[실행 중지됨]\n";
    setOutput(outputBufferRef.current);
  };

  const runCode = async () => {
    if (isExecuting) return;
    
    setOutput("실행을 준비합니다...\n");
    outputBufferRef.current = '';
    setIsExecuting(true);
    setIsWaitingForInput(false);
    setErrorLine(null);

    if (lang === 'python' && pyodideRef.current) {
      try {
        // 1. 비동기 입력을 위한 JS 함수 노출
        (window as any).handle_output = (text: string) => {
          outputBufferRef.current += text;
          setOutput(outputBufferRef.current);
        };

        (window as any).get_input_from_js = (promptText: string) => {
          return new Promise((resolve) => {
            setIsWaitingForInput(true);
            inputResolveRef.current = resolve;
          });
        };

        // 2. 파이썬 코드 변환 및 실행 준비
        const wrapperCode = `
import ast
import js
import sys

async def __async_input__(prompt=""):
    if prompt:
        js.handle_output(str(prompt))
    return await js.get_input_from_js(str(prompt))

def __transform_code__(user_code):
    try:
        tree = ast.parse(user_code)
        
        class InputTransformer(ast.NodeTransformer):
            def __init__(self):
                self.async_funcs = set()

            def visit_Call(self, node):
                self.generic_visit(node)
                if isinstance(node.func, ast.Name):
                    if node.func.id == 'input':
                        node.func.id = '__async_input__'
                        return ast.Await(value=node)
                    elif node.func.id in self.async_funcs:
                        return ast.Await(value=node)
                return node
            
            def visit_FunctionDef(self, node):
                has_input = False
                for child in ast.walk(node):
                    if isinstance(child, ast.Call) and isinstance(child.func, ast.Name) and child.func.id == 'input':
                        has_input = True
                        break
                
                if has_input:
                    self.async_funcs.add(node.name)
                
                self.generic_visit(node)
                
                if has_input:
                    new_node = ast.AsyncFunctionDef(
                        name=node.name,
                        args=node.args,
                        body=node.body,
                        decorator_list=node.decorator_list,
                        returns=node.returns,
                        type_comment=node.type_comment
                    )
                    ast.copy_location(new_node, node)
                    return new_node
                return node
            
            def visit_Expr(self, node):
                self.generic_visit(node)
                if isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name):
                    if node.value.func.id in self.async_funcs:
                        if not isinstance(node.value, ast.Await):
                            node.value = ast.Await(value=node.value)
                return node

        transformer = InputTransformer()
        transformed_tree = transformer.visit(tree)
        ast.fix_missing_locations(transformed_tree)
        
        # 최상위 레벨의 코드를 async 함수로 감싸서 실행할 수 있게 함
        # ast.unparse는 Python 3.9+에서 지원
        code_str = ast.unparse(transformed_tree)
        return code_str
    except Exception as e:
        return f"# Error: {str(e)}\\n" + user_code

__transformed_code__ = __transform_code__(js.user_code)
`;
        (window as any).user_code = code;
        await pyodideRef.current.runPythonAsync(wrapperCode);
        
        const transformedCode = pyodideRef.current.globals.get("__transformed_code__");
        
        if (transformedCode.startsWith("# Error")) {
            await pyodideRef.current.runPythonAsync(code);
        } else {
            // 변환된 코드가 await를 포함하므로 runPythonAsync로 실행
            await pyodideRef.current.runPythonAsync(transformedCode);
        }
        
        if (outputBufferRef.current.length === 0 && !isWaitingForInput) {
          setOutput(">>> 실행 완료 (출력 없음)");
        }
      } catch (e: any) {
        const errorMsg = e.message;
        setOutput(outputBufferRef.current + `\n❌ Error: ${errorMsg}`);
        
        // 에러 라인 파싱
        const lineMatch = errorMsg.match(/line (\d+)/);
        if (lineMatch) {
          setErrorLine(parseInt(lineMatch[1]));
        }
      }
    } else if (lang === 'c') {
      const prompt = `C언어 코드를 시뮬레이션 해주세요:\n${code}`;
      try {
        const result = await askGemini(prompt, "C Language Simulation Mode");
        setOutput(result);
      } catch (e) {
        setOutput("시뮬레이션 중 오류가 발생했습니다.");
      }
    }
    setIsExecuting(false);
  };

  return (
    <div className="p-4 lg:p-12 h-full flex flex-col gap-4 lg:gap-8 max-w-[1600px] mx-auto overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto">
          <div className="relative shrink-0">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-4 glass rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base text-[#007AFF] hover:bg-white/5 transition-all"
            >
              {lang === 'python' ? 'Python 3.12' : 'C Language'} <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-40 lg:w-48 glass rounded-xl lg:rounded-2xl border-white/10 z-50 overflow-hidden shadow-2xl"
                >
                  <button onClick={() => handleLangChange('python')} className="w-full px-5 py-3 lg:py-4 text-left hover:bg-white/5 transition-all text-xs lg:text-sm font-bold border-b border-white/5 text-white">Python 3.12</button>
                  <button onClick={() => handleLangChange('c')} className="w-full px-5 py-3 lg:py-4 text-left hover:bg-white/5 transition-all text-xs lg:text-sm font-bold text-white">C Language</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <h2 className="text-xl lg:text-4xl font-bold tracking-tight truncate">연습장</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button onClick={() => setCode('')} className="p-2.5 lg:p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-white transition-all shrink-0"><RotateCcw size={18} /></button>
           {isExecuting ? (
             <button onClick={stopCode} className="flex-1 sm:flex-none px-6 lg:px-10 py-2.5 lg:py-4 bg-red-500 text-white rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 lg:gap-3 shadow-2xl active:scale-95 transition-all text-sm lg:text-base">
               <RotateCcw size={18} /> 중지
             </button>
           ) : (
             <button onClick={runCode} disabled={isEngineLoading} className="flex-1 sm:flex-none px-6 lg:px-10 py-2.5 lg:py-4 bg-[#007AFF] text-white rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 lg:gap-3 shadow-2xl active:scale-95 transition-all text-sm lg:text-base disabled:opacity-50">
               {isEngineLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />} 실행
             </button>
           )}
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
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-[24px] lg:h-[32px] flex items-center justify-end pr-2 lg:pr-4 text-[9px] lg:text-[13px] font-bold transition-colors ${errorLine === i + 1 ? 'bg-red-500/20 text-red-500 border-r-2 border-red-500' : ''}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea 
                ref={textareaRef}
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-cyan-400 pt-6 lg:pt-10 px-4 lg:px-8 pb-10 resize-none leading-[24px] lg:leading-[32px] font-mono whitespace-pre custom-scrollbar" 
                spellCheck={false} 
              />
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
                 <div className="whitespace-pre-wrap text-green-400/90 leading-relaxed">
                   {output}
                   {isWaitingForInput && (
                     <form onSubmit={handleInputSubmit} className="inline-flex items-center">
                       <div className="grid grid-cols-1 grid-rows-1 items-center">
                         <span className="invisible whitespace-pre font-mono row-start-1 col-start-1">{inputValue}</span>
                         <input 
                           autoFocus
                           value={inputValue}
                           onChange={e => setInputValue(e.target.value)}
                           className="row-start-1 col-start-1 bg-transparent border-none outline-none text-white font-mono p-0 m-0 w-full"
                         />
                       </div>
                     </form>
                   )}
                   <div ref={outputEndRef} />
                 </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
