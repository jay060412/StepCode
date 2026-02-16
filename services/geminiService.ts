
import { GoogleGenAI, Modality } from "@google/genai";

export const askGemini = async (prompt: string, context?: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are StepCode AI Assistant, an expert Python educator. 
      Your mission is to explain coding concepts clearly and concisely.
      
      Current Learning Context:
      ${context || 'General Python programming'}.
      
      Instructions:
      1. Answer in Korean.
      2. Format your response clearly using bullet points or numbered lists.
      3. Do NOT use too many long paragraphs. Make it readable at a glance.
      4. Use code blocks for any code examples.
      5. Address the current lesson code if the user asks about it.
      
      User question: ${prompt}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "죄송합니다. AI 서비스를 현재 이용할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const getGeminiSpeech = async (text: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `읽어주세요: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm and clear Korean voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio data not found");
    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

// PCM Decoding Utility
export async function playPcmAudio(base64Data: string) {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const data = decode(base64Data);
  const dataInt16 = new Int16Array(data.buffer);
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
}
