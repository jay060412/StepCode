
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Play, RotateCcw, Loader2, Sparkles, Code2, ChevronDown, Save, FolderOpen, Trash2, X } from 'lucide-react';
import { askGemini } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { UserProfile, PlaygroundSnippet } from '../types';

type Language = 'python' | 'c';

interface PlaygroundProps {
  user?: UserProfile;
}

export const Playground: React.FC<PlaygroundProps> = ({ user }) => {
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
  const [inputValue, setInputValue] = useState('');
  const inputResolveRef = useRef<((value: string) => void) | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Save/Load states
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippets, setSnippets] = useState<PlaygroundSnippet[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false);
  
  const lineCount = Math.max(15, code.split('\n').length + 3);

  const fetchSnippets = useCallback(async () => {
    if (!user) return;
    setIsLoadingSnippets(true);
    try {
      const { data, error } = await supabase
        .from('playground_snippets')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setSnippets(data || []);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    } finally {
      setIsLoadingSnippets(false);
    }
  }, [user]);

  const handleSaveSnippet = async () => {
    if (!user || !snippetTitle.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('playground_snippets').insert([
        {
          user_id: user.id,
          title: snippetTitle.trim(),
          code,
          language: lang
        }
      ]);
      if (error) throw error;
      alert('코드가 저장되었습니다.');
      setIsSaveModalOpen(false);
      setSnippetTitle('');
      fetchSnippets();
    } catch (err: any) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!window.confirm('정말로 이 코드를 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('playground_snippets').delete().eq('id', id);
      if (error) throw error;
      setSnippets(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleLoadSnippet = (snippet: PlaygroundSnippet) => {
    if (window.confirm('현재 작성 중인 코드가 덮어씌워집니다. 계속하시겠습니까?')) {
      setCode(snippet.code);
      setLang(snippet.language as Language);
      setIsLoadModalOpen(false);
      setOutput('');
      outputBufferRef.current = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      setCode(newValue);
      
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
      
      outputBufferRef.current += value + "\n";
      setOutput(outputBufferRef.current);
      
      inputResolveRef.current(value);
      inputResolveRef.current = null;
    }
  };

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, isWaitingForInput]);

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

  useEffect(() => {
    if (user) {
      fetchSnippets();
    }
  }, [user, fetchSnippets]);

  const handleLangChange = (newLang: Language) => {
    if (isExecuting) stopCode();
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
            await pyodideRef.current.runPythonAsync(transformedCode);
        }
        
        if (outputBufferRef.current.length === 0 && !isWaitingForInput) {
          setOutput(">>> 실행 완료 (출력 없음)");
        }
      } catch (e: any) {
        const errorMsg = e.message;
        setOutput(outputBufferRef.current + `\n❌ Error: ${errorMsg}`);
        
        const lineMatch = errorMsg.match(/line (\d+)/);
        if (lineMatch) {
          setErrorLine(parseInt(lineMatch[1]));
        }
      }
    } else if (lang === 'c') {
      const inputs: string[] = [];
      
      const runServerSide = async (currentInputs: string[]) => {
        try {
          const response = await fetch('/api/execute/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, inputs: currentInputs })
          });
          const data = await response.json();
          if (data.success) {
            return { type: 'success', output: data.stdout + (data.stderr || '') };
          } else {
            return { type: 'error', message: data.error };
          }
        } catch (e) {
          return { type: 'error', message: 'Server connection failed' };
        }
      };

      const systemInstruction = `Strict C terminal (Clang 17).
Output ONLY the terminal text. No explanations. No markdown.
If input is needed, output "[INPUT_REQUIRED: prompt]".
When finished, output "[EXECUTION_FINISHED]".`;

      const getSimulation = async (currentInputs: string[]) => {
        const inputContext = currentInputs.length > 0 
          ? `\nUser has already provided these inputs in order:\n${currentInputs.map((inp, i) => `${i+1}. "${inp}"`).join('\n')}\n\nPlease simulate the execution using these inputs.`
          : "";
        
        const prompt = `Code:\n${code}${inputContext}\n\nExecute and show the terminal output.`;
        return await askGemini(prompt, "C Terminal Mode", systemInstruction);
      };

      try {
        // First, try real execution on the server
        const result = await runServerSide(inputs);
        
        if (result.type === 'success') {
          outputBufferRef.current = result.output;
          setOutput(result.output);
        } else {
          // Fallback to AI simulation if server-side execution fails (e.g., no compiler in sandbox)
          let currentSimulation = await getSimulation(inputs);
          
          while (currentSimulation.includes("[INPUT_REQUIRED:")) {
            const parts = currentSimulation.split(/\[INPUT_REQUIRED:.*?\]/);
            setOutput(parts[0]);
            outputBufferRef.current = parts[0];
            
            const userInput = await new Promise<string>((resolve) => {
              setIsWaitingForInput(true);
              inputResolveRef.current = resolve;
            });

            if (!inputResolveRef.current && !isExecuting) break;
            
            inputs.push(userInput);
            outputBufferRef.current += userInput + "\n";
            setOutput(outputBufferRef.current);

            // Try server-side again with new input
            const nextResult = await runServerSide(inputs);
            if (nextResult.type === 'success') {
              currentSimulation = nextResult.output;
              break; // Exit loop and show final output
            } else {
              currentSimulation = await getSimulation(inputs);
            }
            
            if (!isExecuting) break;
          }
          
          if (isExecuting) {
            const finalOutput = currentSimulation.replace("[EXECUTION_FINISHED]", "");
            setOutput(finalOutput);
            outputBufferRef.current = finalOutput;
          }
        }
      } catch (e) {
        setOutput("실행 중 오류가 발생했습니다.");
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
           <button onClick={() => { fetchSnippets(); setIsLoadModalOpen(true); }} className="p-2.5 lg:p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-[#007AFF] transition-all shrink-0" title="불러오기"><FolderOpen size={18} /></button>
           <button onClick={() => setIsSaveModalOpen(true)} className="p-2.5 lg:p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-green-500 transition-all shrink-0" title="저장하기"><Save size={18} /></button>
           <button onClick={() => setCode('')} className="p-2.5 lg:p-4 glass rounded-xl lg:rounded-2xl text-gray-500 hover:text-white transition-all shrink-0" title="초기화"><RotateCcw size={18} /></button>
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

      {/* Save Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSaveModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md glass p-8 rounded-[32px] border-white/10 bg-[#0a0a0a] shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-6">코드 저장하기</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Snippet Title</label>
                  <input value={snippetTitle} onChange={e => setSnippetTitle(e.target.value)} placeholder="코드의 이름을 입력하세요" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#007AFF]/50 transition-all" />
                </div>
                <button onClick={handleSaveSnippet} disabled={isSaving || !snippetTitle.trim()} className="w-full py-4 bg-[#007AFF] text-white rounded-xl font-black shadow-xl hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 저장 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Load Modal */}
      <AnimatePresence>
        {isLoadModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoadModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl glass p-8 rounded-[32px] border-white/10 bg-[#0a0a0a] shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white">저장된 코드 불러오기</h3>
                <button onClick={() => setIsLoadModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {isLoadingSnippets ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={32} className="animate-spin text-[#007AFF]" />
                    <p className="text-sm text-gray-500 font-bold">목록을 불러오는 중...</p>
                  </div>
                ) : snippets.length === 0 ? (
                  <div className="py-20 text-center text-gray-500 italic">저장된 코드가 없습니다.</div>
                ) : (
                  snippets.map(s => (
                    <div key={s.id} className="group flex items-center justify-between p-5 glass rounded-2xl border-white/5 hover:bg-white/5 transition-all">
                      <div className="cursor-pointer flex-1" onClick={() => handleLoadSnippet(s)}>
                        <h4 className="text-white font-bold mb-1">{s.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${s.language === 'python' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>{s.language}</span>
                          <span className="text-[10px] text-gray-600 font-medium">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSnippet(s.id)} className="p-3 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
