
import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Loader2, Minimize2, Maximize2, Sparkles, AlertCircle, Cpu, Zap } from 'lucide-react';
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
  const [status, setStatus] = useState<'online' | 'offline' | 'error'>('offline');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Netlify 환경 변수에 API_KEY가 있는지 확인
    if (process.env.API_KEY) {
      setStatus('online');
      if (messages.length === 0) {
        setMessages([{ 
          role: 'assistant', 
          content: '반가워요! 초고속 **Groq Llama 3.3 70B** 엔진이 준비되었습니다. 학습 중 궁금한 점은 무엇이든 물어보세요!' 
        }]);
      }
    } else {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const currentPage = currentLesson?.pages?.[currentPageIndex || 0];
    const context = `
      단계: ${currentStage || '일반 학습'}
      레슨: ${currentLesson?.title || '정보 없음'}
      내용: ${currentPage?.content || '없음'}
      코드: ${currentPage?.code || '없음'}
      문제: ${currentProblem?.question || '없음'}
    `;

    const response = await askGemini(input, context);

    if (response === "ENGINE_CONFIG_ERROR" || response === "INVALID_API_KEY") {
      setStatus('error');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '앗, Groq API 설정에 문제가 발생했습니다. Netlify의 API_KEY 설정을 확인해주세요.' 
      }]);
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
          className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-2xl relative group ${
            status === 'error' ? 'bg-red-600 shadow-red-600/20' : 'bg-orange-600 shadow-orange-600/40'
          }`}
        >
          <Cpu size={28} className="text-white" />
          {status === 'online' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
          )}
        </MotionButton>
        <button onClick={onToggleMinimize} className="p-4 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl">
          <Maximize2 size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/40">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
           <div className="relative">
             <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
               <Cpu size={24} />
             </div>
             {status === 'online' && (
               <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
             )}
           </div>
           <div>
             <span className="font-bold text-sm block tracking-tight text-white">Groq AI Tutor</span>
             <div className="flex items-center gap-1.5">
               <Zap size={10} className={status === 'online' ? 'text-orange-400' : 'text-gray-600'} />
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                 {status === 'online' ? 'Llama 3.3 70B Active' : status === 'error' ? 'Engine Error' : 'Connecting...'}
               </span>
             </div>
           </div>
        </div>
        <button onClick={onToggleMinimize} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Minimize2 size={20} />
        </button>
      </div>
      
      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-orange-500/5">
        {status === 'error' && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[24px] bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400"
          >
            <AlertCircle size={20} />
            <p className="text-xs font-medium">API_KEY 설정이 되어있지 않습니다. (Netlify 환경변수를 확인하세요)</p>
          </MotionDiv>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            {m.role === 'assistant' && (
              <span className="text-[10px] font-bold text-gray-600 mb-2 ml-1 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} className="text-orange-500" /> AI Response
              </span>
            )}
            <div className={`relative max-w-[92%] p-5 rounded-[24px] text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
              ? 'bg-[#007AFF] text-white rounded-tr-none' 
              : 'glass text-gray-300 rounded-tl-none border-orange-500/10'
            }`}>
              {m.role === 'assistant' ? (
                <>
                  <FormattedText text={m.content} />
                  <button 
                    onClick={() => handleSpeak(m.content)}
                    className="mt-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-orange-500 transition-all"
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
            <Loader2 size={16} className="animate-spin text-orange-500" />
            <span className="text-xs text-gray-500 font-medium">Groq LPU 추론 중...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/5 bg-[#0a0a0a]/50">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-[24px] pl-5 pr-3 py-3 focus-within:border-orange-500/50 focus-within:bg-white/[0.05] transition-all">
          <input 
            type="text" 
            value={input}
            disabled={status !== 'online'}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={status === 'online' ? "궁금한 코딩 질문을 입력하세요..." : "AI 엔진 확인 중..."}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600 disabled:opacity-30"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || status !== 'online'}
            className="w-11 h-11 bg-orange-600 text-white rounded-[18px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-orange-600/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
