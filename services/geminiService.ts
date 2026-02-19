
import { GoogleGenAI } from "@google/genai";

/**
 * StepCode Service - Gemini AI Implementation
 * @google/genai SDK를 사용하여 AI 채점 및 인터랙션을 처리합니다.
 */

export const askGemini = async (prompt: string, context?: string) => {
  // AI 인스턴스를 매 호출 시 생성하여 최신 환경 변수 반영
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex task (coding tutor)
      contents: context ? `Context: ${context}\n\nUser Question: ${prompt}` : prompt,
      config: {
        systemInstruction: "You are a professional coding tutor. Answer the student's questions clearly and provide helpful debugging tips. Use markdown for code formatting.",
      }
    });
    
    // Use .text property to extract content
    return response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key")) return "INVALID_API_KEY";
    return "ENGINE_CONFIG_ERROR";
  }
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
