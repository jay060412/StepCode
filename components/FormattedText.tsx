
import React from 'react';

const parseBold = (text: string) => {
  // 굵은 글씨(**) 파싱 로직 개선: 더 정확한 매칭을 위해 비그리디(non-greedy) 정규식 사용
  // **텍스트** 형태를 찾습니다.
  const parts = text.split(/(\*\*.+?\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2).trim();
      
      // "해설:" 또는 "힌트:" 등의 접두사가 있는 경우 특별 스타일 적용
      const specialKeywords = ["해설:", "정답:", "힌트:", "💡"];
      const isSpecial = specialKeywords.some(key => content.startsWith(key));

      if (isSpecial || content.includes("핵심 로직 설명")) {
        return (
          <span key={i} className="block my-4 p-5 rounded-2xl bg-orange-accent/5 border border-orange-accent/20 shadow-sm">
            <strong className="text-orange-accent font-black text-lg mb-1 block tracking-tight">
              {content.startsWith('💡') ? content : `💡 ${content}`}
            </strong>
          </span>
        );
      }
      return <strong key={i} className="text-white font-black inline-block mx-0.5">{content}</strong>;
    }
    return part;
  });
};

export const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // 코드 블록(``` ```) 분리
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const hasLanguage = /^[a-z]+$/i.test(lines[0]);
          const codeContent = hasLanguage ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={index} className="my-6 glass bg-[#050505] rounded-[24px] border border-white/10 overflow-hidden font-mono text-xs shadow-inner">
              <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Code Execution Context</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/20" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                  <div className="w-2 h-2 rounded-full bg-green-500/20" />
                </div>
              </div>
              <pre className="p-6 overflow-x-auto text-teal-accent leading-relaxed">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // 일반 텍스트 및 제목, 리스트 처리
        const textLines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {textLines.map((line, i) => {
              if (!line.trim()) return <div key={i} className="h-2" />;
              
              const trimmed = line.trim();

              // 제목 처리 (###)
              if (trimmed.startsWith('###')) {
                return (
                  <h3 key={i} className="text-xl font-black text-white mt-8 mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-orange-accent rounded-full" />
                    {parseBold(trimmed.replace(/^###\s*/, ''))}
                  </h3>
                );
              }
              
              // 리스트 처리 (* or -)
              if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                const content = trimmed.substring(1).trim();
                return (
                  <div key={i} className="flex gap-3 ml-2 items-start py-1">
                    <span className="text-orange-accent font-black mt-1.5 text-xs">•</span>
                    <span className="flex-1 text-gray-300 leading-relaxed font-light">{parseBold(content)}</span>
                  </div>
                );
              }
              
              return <p key={i} className="text-gray-400 leading-relaxed font-light">{parseBold(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};
