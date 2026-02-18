
/**
 * StepCode AI Service (Powered by Groq Cloud API)
 * Model: llama-3.3-70b-versatile (Llama 3.3 70B)
 */

export const askGemini = async (prompt: string, context?: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return "ENGINE_CONFIG_ERROR";
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `당신은 세계 최고의 코딩 교육 플랫폼 'StepCode'의 전담 AI 튜터입니다.
사용자는 현재 파이썬 또는 C언어를 학습 중이며, 제공되는 맥락을 바탕으로 답변하십시오.

[운영 규칙]
1. 사용자의 질문에 가장 먼저, 명확하고 친절하게 한국어로 답변하십시오.
2. 현재 화면의 코드나 문제 맥락을 파악하여 구체적인 조언을 제공하십시오.
3. 마크다운(Markdown) 형식을 적극 활용하여 코드 가독성을 높이십시오.
4. Groq 엔진의 빠른 속도를 강조하듯 명쾌하게 설명하십시오.

[현재 학습 맥락]
${context || '일반 학습 중'}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 4096,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error Detail:", errorData);
      if (response.status === 401) return "INVALID_API_KEY";
      throw new Error("GROQ_COMMUNICATION_ERROR");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "답변을 생성할 수 없습니다.";

  } catch (error: any) {
    console.error("Groq Service Critical Error:", error);
    return "현재 Groq AI 엔진과 통신할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
};

/**
 * 브라우저 표준 Web Speech API를 활용한 음성 합성 (Groq 답변 읽기용)
 */
export const getGeminiSpeech = async (text: string) => {
  if (!('speechSynthesis' in window)) return null;
  window.speechSynthesis.cancel();
  // 마크다운 기호 제거 후 정제된 텍스트만 읽기
  const cleanText = text.replace(/[*#`]/g, '').slice(0, 200); 
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ko-KR';
  utterance.rate = 1.1;
  window.speechSynthesis.speak(utterance);
  return null;
};
