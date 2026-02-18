
/**
 * StepCode Service - AI 기능 제거됨
 * 모든 채점 및 인터랙션은 로컬 로직으로 처리됩니다.
 */

export const askGemini = async (prompt: string, context?: string) => {
  console.warn("AI 기능이 비활성화되었습니다.");
  return "AI 기능이 비활성화된 상태입니다.";
};

/**
 * 브라우저 표준 Web Speech API를 활용한 음성 합성
 */
export const getGeminiSpeech = async (text: string) => {
  if (!('speechSynthesis' in window)) return null;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#`]/g, '').slice(0, 200); 
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ko-KR';
  utterance.rate = 1.1;
  window.speechSynthesis.speak(utterance);
  return null;
};
