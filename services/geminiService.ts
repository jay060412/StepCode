
import { GoogleGenAI, Modality } from "@google/genai";

const getApiKey = () => {
  // 전역 window 객체를 통한 안전한 환경 변수 추출
  const env = (window as any).process?.env || (typeof process !== 'undefined' ? process.env : {});
  return env?.API_KEY || '';
};

export const askGemini = async (prompt: string, context?: string) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return "AI 연결을 위해 API 키가 필요합니다.";
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are StepCode AI Assistant, an expert Python educator. 
      Answer in Korean. Format clearly with markdown.
      Context: ${context || 'General Python'}.
      User: ${prompt}`,
    });
    return response.text || "답변을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "죄송합니다. 현재 AI 답변이 어렵습니다.";
  }
};

export const getGeminiSpeech = async (text: string) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `읽어주세요: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export async function playPcmAudio(base64Data: string) {
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return null;
    const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = audioCtx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
    return source;
  } catch (e) {
    return null;
  }
}
