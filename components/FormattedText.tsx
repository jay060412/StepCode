
import React from 'react';

const parseBold = (text: string) => {
  // 굵은 글씨(**)를 더 정확하게 분리하기 위해 정규식 개선
  const parts = text.split(/(\*\*[^\*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      // "핵심 로직 설명" 문구가 포함된 경우 네온 블루 효과 추가
      if (content.includes("핵심 로직 설명")) {
        return (
          <span key={i} className="block my-6 p-6 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/30 shadow-[0_0_20px_rgba(0,122,255,0.1)]">
            <strong className="text-[#007AFF] font-black text-xl mb-2 block tracking-tight">💡 {content}</strong>
          </span>
        );
      }
      return <strong key={i} className="text-white font-bold inline-block">{content}</strong>;
    }
    return part;
  });
};

export const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // 코드 블록(``` ```)을 먼저 분리합니다.
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // 코드 블록 렌더링
          const lines = part.slice(3, -3).trim().split('\n');
          const hasLanguage = /^[a-z]+$/i.test(lines[0]);
          const codeContent = hasLanguage ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={index} className="my-4 glass bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden font-mono text-xs shadow-inner">
              <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Python Code</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/30" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                  <div className="w-2 h-2 rounded-full bg-green-500/30" />
                </div>
              </div>
              <pre className="p-4 overflow-x-auto text-cyan-400 leading-relaxed">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // 일반 텍스트 처리
        const textLines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {textLines.map((line, i) => {
              if (!line.trim()) return <div key={i} className="h-2" />;
              
              if (line.startsWith('###')) {
                return <h3 key={i} className="text-lg font-bold text-[#007AFF] mt-6 mb-2 border-l-4 border-[#007AFF] pl-4">{parseBold(line.replace('###', '').trim())}</h3>;
              }
              
              if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                const content = line.trim().substring(1).trim();
                return (
                  <div key={i} className="flex gap-3 ml-2 items-start py-0.5">
                    <span className="text-[#007AFF] font-bold mt-1">•</span>
                    <span className="flex-1 text-gray-300 leading-relaxed">{parseBold(content)}</span>
                  </div>
                );
              }
              
              return <p key={i} className="text-gray-300 leading-relaxed">{parseBold(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};
