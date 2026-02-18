
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Volume2, Loader2, Minimize2, Maximize2, MessageSquare, Sparkles } from 'lucide-react';
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '반가워요! 차세대 **Gemini 3 Pro** 엔진으로 업그레이드된 StepCode AI 튜터입니다. 궁금한 점은 무엇이든 물어보세요! 코드의 맥락을 완벽히 이해하고 도와드릴게요.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      학습단계: ${currentStage || '일반'}
      레슨명: ${currentLesson?.title || '정보 없음'}
      현재 페이지 내용: ${currentPage?.content || '없음'}
      현재 코드 상황: ${currentPage?.code || '없음'}
      문제: ${currentProblem?.question || '없음'}
    `;

    const response = await askGemini(input, context);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
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
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
        </MotionButton>
        <div className="h-px w-10 bg-white/10" />
        <button onClick={onToggleMinimize} className="p-4 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl hover:bg-white/10">
          <Maximize2 size={24} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="[writing-mode:vertical-rl] rotate-180 text-gray-700 font-black uppercase tracking-[0.4em] text-[11px] py-10 select-none opacity-50">
            Gemini 3 Pro AI Assistant
          </div>
        </div>
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
             <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
           </div>
           <div>
             <span className="font-bold text-sm block tracking-tight">StepCode AI Tutor</span>
             <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gemini 3 Pro</span>
             </div>
           </div>
        </div>
        <button onClick={onToggleMinimize} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Minimize2 size={20} />
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-[#007AFF]/5">
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
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="궁금한 점을 물어보세요..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 bg-[#007AFF] text-white rounded-[18px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-[#007AFF]/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
