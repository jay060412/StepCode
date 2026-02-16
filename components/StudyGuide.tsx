
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, BookOpen, 
  CheckCircle2, Terminal, Variable, 
  Sparkles, Code2, Layout, MousePointer2, Brain, Rocket,
  MessageSquareCode
} from 'lucide-react';

interface StudyGuideProps {
  onStartPython: () => void;
  onViewCurriculum: () => void;
  onStartAlgorithm: () => void;
}

const HelpCircleIcon = (props: any): React.ReactNode => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

export const StudyGuide: React.FC<StudyGuideProps> = ({ onStartPython, onViewCurriculum, onStartAlgorithm }) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'quiz' | 'coding'>('concept');

  const studyStages = {
    concept: {
      title: "Step 1. 개념 학습 (관찰)",
      desc: "단순히 글을 읽는 것이 아니라, 코드가 '살아 움직이는 과정'을 관찰하는 단계입니다. StepCode와 함께라면 지루한 인강 없이도 원리를 꿰뚫을 수 있습니다.",
      points: [
        "테마의 전반적인 맥락을 먼저 파악하세요.",
        "코드 옆의 번호 배지를 클릭해 숨겨진 상세 설명을 확인하세요.",
        "'로직 흐름 추적' 버튼으로 컴퓨터의 사고 흐름을 눈으로 따라가세요.",
        "변수 모니터링 창을 통해 값이 실시간으로 변하는 순간을 포착하세요."
      ],
      color: "text-[#007AFF]",
      bgColor: "bg-[#007AFF]/10",
      icon: <PlayCircle size={24} />
    },
    quiz: {
      title: "Step 2. 개념 퀴즈 (검증)",
      desc: "눈으로 본 논리가 내 것이 되었는지 즉시 테스트합니다. 헷갈리는 개념을 잡아주는 가장 빠른 필터입니다.",
      points: [
        "객관식 퀴즈를 통해 핵심 개념의 빈틈을 찾습니다.",
        "오답 시 AI 튜터가 제공하는 정교한 힌트를 활용해 다시 생각해보세요.",
        "단순히 정답을 맞히는 것보다 '왜' 정답인지를 이해하는 것이 중요합니다."
      ],
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      icon: <HelpCircleIcon size={24} />
    },
    coding: {
      title: "Step 3. 코딩 도전 (구현)",
      desc: "이해한 원리를 직접 코드로 써 내려갑니다. 가장 어렵지만 실력이 가장 많이 느는 단계입니다.",
      points: [
        "별도의 설치 없이 브라우저에서 즉시 코드를 작성하세요.",
        "콘솔창의 에러 메시지를 두려워 말고 하나씩 해결해 나가는 재미를 느끼세요.",
        "최종 제출 시 AI가 당신의 코드를 분석해 최적화 방향을 제시해줍니다."
      ],
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      icon: <Terminal size={24} />
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32 h-full overflow-y-auto custom-scrollbar scroll-smooth">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 lg:mb-24"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
          <Sparkles size={14} className="text-[#007AFF]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">StepCode Strategy Guide</span>
        </div>
        <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          가장 확실하게 <br/>코딩을 배우는 법
        </h2>
        <p className="text-gray-500 text-lg lg:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          StepCode는 <span className="text-white font-medium">관찰-검증-구현</span>의 반복을 통해 <br className="hidden lg:block"/> 단순 암기가 아닌 프로그래밍적 사고력을 길러줍니다.
        </p>
      </motion.div>

      <div className="mb-24 lg:mb-32">
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-10">
          {(['concept', 'quiz', 'coding'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-[20px] font-bold text-sm transition-all border ${
                activeTab === tab 
                ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-xl shadow-[#007AFF]/20 scale-105' 
                : 'glass text-gray-500 border-white/5 hover:text-gray-300'
              }`}
            >
              {tab === 'concept' ? '1. 개념 학습' : tab === 'quiz' ? '2. 개념 퀴즈' : '3. 코딩 도전'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="flex flex-col gap-4 sticky top-4">
            <div className="flex items-center justify-between px-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Screen Simulation</span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="glass rounded-[40px] border-white/10 bg-black/40 overflow-hidden shadow-2xl aspect-[4/3] flex flex-col"
                >
                  <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/40" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                      <div className="w-2 h-2 rounded-full bg-green-500/40" />
                    </div>
                  </div>

                  <div className="flex-1 p-6 lg:p-10 flex flex-col gap-6 overflow-hidden">
                    {activeTab === 'concept' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center text-white font-bold">1</div>
                          <div className="h-4 w-40 bg-white/10 rounded-full" />
                        </div>
                        <div className="glass bg-black/40 p-6 rounded-3xl border-white/5 font-mono text-cyan-400 space-y-2 relative">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700 text-xs">01</span>
                            <span>name = "StepCode"</span>
                          </div>
                          <div className="flex items-center gap-3 opacity-30">
                            <span className="text-gray-700 text-xs">02</span>
                            <span>print(f"Hello {name}")</span>
                          </div>
                          <div className="absolute top-4 right-4 px-3 py-1 bg-[#007AFF]/20 border border-[#007AFF]/40 rounded-full text-[10px] flex items-center gap-2">
                            <Variable size={10} /> name: "StepCode"
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="px-6 py-3 bg-[#007AFF] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                            <PlayCircle size={14} /> 로직 흐름 추적
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div className="flex flex-col items-center justify-center h-full gap-8">
                         <div className="w-16 h-16 rounded-3xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                           <BookOpen size={32} />
                         </div>
                         <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                         <div className="w-full space-y-3">
                           <div className="w-full p-4 glass border-purple-500/30 rounded-2xl flex justify-between items-center">
                             <span className="text-sm font-bold text-purple-400">A. 변수 이름</span>
                             <CheckCircle2 size={18} className="text-purple-400" />
                           </div>
                           <div className="w-full p-4 glass border-white/5 rounded-2xl text-sm text-gray-500">B. 함수 결과</div>
                         </div>
                      </div>
                    )}

                    {activeTab === 'coding' && (
                      <div className="flex flex-col h-full gap-4">
                         <div className="flex-1 glass bg-black/40 rounded-3xl border-white/5 p-6 font-mono text-cyan-400">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-gray-700 text-xs">01</span>
                              <span># 코드를 작성하세요</span>
                            </div>
                         </div>
                         <div className="h-20 glass bg-[#0a0a0a] rounded-2xl border-white/5 p-4 font-mono text-[10px] text-green-400">
                           <div>&gt; 입력을 기다리는 중...</div>
                         </div>
                         <div className="flex justify-end">
                           <div className="px-8 py-3 bg-cyan-500 text-black rounded-xl text-xs font-black">
                             결과 확인
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#007AFF]/10 blur-[40px] rounded-full -z-10" />
            </motion.div>
          </div>

          <div className="space-y-12">
            <div>
              <span className={`px-4 py-2 ${studyStages[activeTab].bgColor} ${studyStages[activeTab].color} rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block`}>
                How to Master
              </span>
              <h3 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight text-white leading-tight">
                {studyStages[activeTab].title}
              </h3>
              <p className="text-gray-400 text-lg lg:text-xl font-light leathering-relaxed">
                {studyStages[activeTab].desc}
              </p>
            </div>

            <div className="space-y-6">
              {studyStages[activeTab].points.map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${studyStages[activeTab].color} shrink-0`} />
                  <span className="text-gray-300 text-base lg:text-lg font-light leading-snug">{point}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-24 lg:mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight">당신의 코딩 수준은 어디인가요?</h2>
          <p className="text-gray-500 font-light">나에게 꼭 맞는 효율적인 시작점을 제안합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass p-10 lg:p-14 rounded-[50px] border-white/5 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 rounded-[30px] bg-purple-500/10 text-purple-400 flex items-center justify-center mb-8 shadow-2xl">
              <Brain size={40} />
            </div>
            <h4 className="text-3xl font-black mb-4">코딩이 생전 처음이에요</h4>
            <p className="text-gray-400 font-light leading-relaxed mb-10 text-lg">
              문법보다 <strong>'논리'</strong>를 먼저 익히는 것이 중요합니다. 코딩에 대한 막연한 두려움을 버리세요. 컴퓨터는 단지 명령을 따르는 기계일 뿐입니다. <br/><br/>
              <span className="text-purple-400 font-bold italic">"컴퓨터처럼 사고하는 법부터 가볍게 시작하세요."</span>
            </p>
            <div className="w-full space-y-4 mb-10 text-left bg-white/[0.02] p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-purple-400" /> 알고리즘 사고력 트랙 (기초 논리)
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-purple-400" /> 파이썬 입문 트랙 (실전 문법)
              </div>
            </div>
            <button 
              onClick={onStartAlgorithm}
              className="w-full py-5 bg-purple-600 text-white rounded-[24px] font-black shadow-2xl shadow-purple-600/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3"
            >
              사고력 트랙으로 시작하기 <Rocket size={20} />
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass p-10 lg:p-14 rounded-[50px] border-white/5 bg-gradient-to-br from-[#007AFF]/10 via-transparent to-transparent flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 rounded-[30px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-8 shadow-2xl">
              <Code2 size={40} />
            </div>
            <h4 className="text-3xl font-black mb-4">코딩 경험이 조금 있어요</h4>
            <p className="text-gray-400 font-light leading-relaxed mb-10 text-lg">
              블록 코딩이나 기초 문법을 접해보셨나요? 그렇다면 바로 텍스트 코딩의 세계로 뛰어드세요. StepCode의 <strong>'로직 추적'</strong> 기능이 당신의 코딩 근육을 더 단단하게 만들어줄 것입니다. <br/><br/>
              <span className="text-[#007AFF] font-bold italic">"알고 있는 것을 실제로 구현하는 힘을 기르세요."</span>
            </p>
            <div className="w-full space-y-4 mb-10 text-left bg-white/[0.02] p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-[#007AFF]" /> 파이썬 입문 트랙 (직관적 이해)
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-[#007AFF]" /> 파이썬 실무 심화 (고급 활용)
              </div>
            </div>
            <button 
              onClick={onStartPython}
              className="w-full py-5 bg-[#007AFF] text-white rounded-[24px] font-black shadow-2xl shadow-[#007AFF]/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3"
            >
              파이썬 트랙 바로가기 <Rocket size={20} />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Layout, title: "정갈한 UI", desc: "학습에만 몰입할 수 있도록 깔끔하고 정제된 인터페이스를 제공합니다." },
          { icon: MessageSquareCode, title: "AI 밀착 케어", desc: "모든 페이지에서 당신의 코드를 이해하는 AI 튜터가 24시간 대기합니다." },
          { icon: MousePointer2, title: "시각적 추적", desc: "코드가 실행되는 순간의 공기를 읽듯, 데이터의 흐름을 눈으로 보며 익힙니다." }
        ].map((f, i) => {
          const IconComponent = f.icon;
          return (
            <div key={i} className="glass p-8 rounded-[40px] border-white/5 text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#007AFF]/10 transition-colors">
                <IconComponent size={28} className="text-gray-400 group-hover:text-[#007AFF] transition-colors" />
              </div>
              <h4 className="text-xl font-bold mb-3">{f.title}</h4>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 30 }}
        viewport={{ once: true }}
        className="mt-24 lg:mt-32 p-12 lg:p-24 rounded-[60px] bg-gradient-to-br from-[#007AFF]/20 via-[#007AFF]/5 to-transparent border border-[#007AFF]/20 text-center"
      >
        <h2 className="text-3xl lg:text-5xl font-black mb-10 tracking-tighter">당신의 첫 번째 코딩 동반자, <br className="hidden sm:block"/> StepCode.</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <button 
            onClick={onStartPython}
            className="px-12 py-5 bg-[#007AFF] text-white rounded-[24px] font-black text-lg shadow-2xl shadow-[#007AFF]/30 hover:scale-105 active:scale-95 transition-all"
          >
            지금 바로 python학습 시작하기
          </button>
          <button 
            onClick={onViewCurriculum}
            className="px-12 py-5 glass text-white rounded-[24px] font-black text-lg hover:bg-white/10 transition-all"
          >
            커리큘럼 전체 보기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
