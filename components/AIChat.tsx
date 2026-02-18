
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Volume2, Loader2, Minimize2, Maximize2, MessageSquare, Sparkles, Key, AlertCircle, ExternalLink } from 'lucide-react';
import { askGemini, getGeminiSpeech } from '../services/geminiService';
import { ChatMessage, Lesson, Problem } from '../types';
import { FormattedText } from './FormattedText';
import { motion, AnimatePresence } from 'framer-motion';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

interface AIChatProps {
  currentLesson?: Lesson;
  currentPageIndex?: number;
  currentStage?: 'concept' | 'quiz' | 'coding';
  currentProblem?: Problem;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

// Fixed: Removed local AIStudio interface and Window augmentation to avoid conflicts with 
// pre-configured global definitions provided by the environment.

export const AIChat: React.FC<AIChatProps> = ({ 
  currentLesson, 
  currentPageIndex, 
  currentStage, 
  currentProblem,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    // Fixed: Always check for selected key if process.env.API_KEY is not hardcoded
    if (process.env.API_KEY) {
      setNeedsKey(false);
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: '반가워요! **Gemini 3 Pro** 연결이 완료되었습니다. 궁금한 점은 무엇이든 물어보세요!' }]);
      }
    } else {
      // Assuming window.aistudio is pre-configured and globally accessible as per guidelines
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setNeedsKey(!hasKey);
    }
  };

  const handleConnectKey = async () => {
    try {
      // Trigger key selection dialog
      await (window as any).aistudio.openSelectKey();
      // Assume successful selection to avoid race condition as per guidelines
      setNeedsKey(false);
      setMessages([{ role: 'assistant', content: '엔진이 성공적으로 연결되었습니다! 코딩 학습 중 궁금한 내용을 입력해주세요.' }]);
    } catch (err) {
      console.error("Key selection failed", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized, needsKey]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const currentPage = currentLesson?.pages?.[currentPageIndex || 0];
    const context = `
      학습단계: ${currentStage || '일반'}
      레슨명: ${currentLesson?.title || '정보 없음'}
      현재 페이지 내용: ${currentPage?.content || '없음'}
      현재 코드 상황: ${currentPage?.code || '없음'}
      문제: ${currentProblem?.question || '없음'}
    `;

    const response = await askGemini(input, context);

    if (response === "CONNECTED_KEY_REQUIRED" || response === "INVALID_KEY_ERROR") {
      setNeedsKey(true);
      setMessages(prev => [...prev, { role: 'assistant', content: '앗, API 키 연결이 해제되었거나 유효하지 않습니다. 다시 연결이 필요합니다.' }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
    setIsLoading(false);
  };

  const handleSpeak = (text: string) => {
    getGeminiSpeech(text);
  };

  if (isMinimized) {
    return (
      <div className="w-full h-full flex flex-col items-center py-8 gap-8 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <MotionButton 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMinimize}
          className="w-14 h-14 rounded-[22px] bg-[#007AFF] text-white flex items-center justify-center shadow-2xl shadow-[#007AFF]/40 relative group"
        >
          <Bot size={28} />
          {!needsKey && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />}
        </MotionButton>
        <button onClick={onToggleMinimize} className="p-4 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl">
          <Maximize2 size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/40">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
           <div className="relative">
             <div className="w-11 h-11 rounded-2xl bg-[#007AFF] flex items-center justify-center text-white shadow-xl shadow-[#007AFF]/20">
               <Bot size={24} />
             </div>
             {!needsKey && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />}
           </div>
           <div>
             <span className="font-bold text-sm block tracking-tight">StepCode AI Tutor</span>
             <div className="flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${needsKey ? 'bg-red-500' : 'bg-[#007AFF] animate-pulse'}`} />
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                 {needsKey ? 'Offline' : 'Gemini 3 Pro Online'}
               </span>
             </div>
           </div>
        </div>
        <button onClick={onToggleMinimize} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Minimize2 size={20} />
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-[#007AFF]/5">
        {needsKey && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[32px] glass-blue border-[#007AFF]/30 flex flex-col items-center text-center gap-6 my-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <Key size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">AI 엔진을 활성화하세요</h4>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Gemini 3 Pro 엔진을 사용하려면 <br/> Netlify에 설정한 API 키를 연결해야 합니다.
              </p>
            </div>
            <button 
              onClick={handleConnectKey}
              className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#007AFF]/20 flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              AI 엔진 연결하기 <ExternalLink size={16} />
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-[10px] text-gray-600 underline hover:text-gray-400"
            >
              결제 및 프로젝트 설정 안내 (ai.google.dev)
            </a>
          </MotionDiv>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            {m.role === 'assistant' && (
              <span className="text-[10px] font-bold text-gray-600 mb-2 ml-1 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} className="text-[#007AFF]" /> AI Tutor
              </span>
            )}
            <div className={`relative max-w-[92%] p-5 rounded-[24px] text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
              ? 'bg-[#007AFF] text-white rounded-tr-none' 
              : 'glass-blue text-gray-300 rounded-tl-none border-[#007AFF]/10'
            }`}>
              {m.role === 'assistant' ? (
                <>
                  <FormattedText text={m.content} />
                  <button 
                    onClick={() => handleSpeak(m.content)}
                    className="mt-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-[#007AFF] transition-all"
                  >
                    <Volume2 size={14} />
                  </button>
                </>
              ) : m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 p-4 bg-white/5 rounded-[20px] w-fit border border-white/5">
            <Loader2 size={16} className="animate-spin text-[#007AFF]" />
            <span className="text-xs text-gray-500 font-medium">Gemini 3 엔진 추론 중...</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-[#0a0a0a]/50">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-[24px] pl-5 pr-3 py-3 focus-within:border-[#007AFF]/50 focus-within:bg-white/[0.05] transition-all">
          <input 
            type="text" 
            value={input}
            disabled={needsKey}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={needsKey ? "먼저 엔진을 연결해주세요..." : "궁금한 점을 물어보세요..."}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600 disabled:opacity-30"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || needsKey}
            className="w-11 h-11 bg-[#007AFF] text-white rounded-[18px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-[#007AFF]/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
