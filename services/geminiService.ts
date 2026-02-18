
import { GoogleGenAI } from "@google/genai";

/**
 * StepCode AI Service (Powered by Google Gemini API)
 * Model: gemini-3-pro-preview
 */

export const askGemini = async (prompt: string, context?: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing");
      return "AI 엔진 설정(API_KEY)이 완료되지 않았습니다. Netlify 환경 변수에서 GROQ_API_KEY를 API_KEY로 이름을 바꾸고 다시 배포해주세요.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `당신은 세계 최고의 코딩 교육 플랫폼 'StepCode'의 전담 AI 튜터입니다.
학습자가 현재 보고 있는 화면 맥락(코드, 문제 등)이 제공되지만, 당신의 최우선 임무는 '사용자의 질문에 즉각적이고 직접적으로 답변하는 것'입니다.

[운영 규칙]
1. 화면 내용을 단순히 요약하거나 읊는 것은 절대 금지입니다.
2. 사용자가 질문을 던지면, 그 질문에 대한 답을 가장 먼저, 명확하게 하십시오.
3. 화면 맥락은 사용자가 "이 코드가 왜 이래?"라고 물었을 때 그 '이 코드'가 무엇인지 파악하는 용도로만 참고하십시오.
4. 친절하고 전문적인 한국어를 사용하며, 마크다운(Markdown) 형식을 활용해 가독성을 높이십시오.

[현재 화면 맥락]
${context || '정보 없음'}

[학생의 질문]
${prompt}`
          }],
        }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 24576 } // 복잡한 코딩 추론을 위한 생각 예산 할당
      }
    });

    return response.text || "답변을 생성할 수 없습니다.";

  } catch (error) {
    console.error("AI Service Error:", error);
    if (error instanceof Error && error.message.includes("API key not found")) {
      return "API 키를 찾을 수 없습니다. Netlify 환경 변수 이름을 API_KEY로 설정했는지 확인해주세요.";
    }
    return "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

/**
 * 브라우저 표준 Web Speech API를 활용한 음성 합성
 */
export const getGeminiSpeech = async (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
    return null;
  }

  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*#`]/g, ''); 
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ko-KR';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
  return null;
};

export async function playPcmAudio(base64Data: string) {
  return null;
}
