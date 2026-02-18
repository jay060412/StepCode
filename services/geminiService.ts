
/**
 * StepCode AI Service (Powered by Groq Cloud API)
 * Model: llama-3.3-70b-versatile
 */

export const askGemini = async (prompt: string, context?: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
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
학습자가 현재 보고 있는 화면 맥락(코드, 문제 등)이 제공됩니다.

[운영 규칙]
1. 사용자의 질문에 가장 먼저, 명확하고 친절하게 답변하십시오.
2. 화면 내용은 답변의 근거로만 사용하고, 내용을 그대로 읊지 마십시오.
3. 전문적인 한국어를 사용하며, 마크다운(Markdown) 형식을 활용해 가독성을 높이십시오.
4. 코딩 원리를 시각적으로 설명하듯 비유를 섞어 설명하십시오.

[현재 화면 맥락]
${context || '정보 없음'}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) throw new Error("INVALID_KEY_ERROR");
      throw new Error(errorData.error?.message || "GROQ_API_ERROR");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "답변을 생성할 수 없습니다.";

  } catch (error: any) {
    console.error("Groq AI Service Error:", error);
    
    if (error.message === "API_KEY_MISSING") return "CONNECTED_KEY_REQUIRED";
    if (error.message === "INVALID_KEY_ERROR") return "INVALID_KEY_ERROR";

    return "Groq 엔진 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

/**
 * 브라우저 표준 Web Speech API를 활용한 음성 합성
 */
export const getGeminiSpeech = async (text: string) => {
  if (!('speechSynthesis' in window)) return null;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#`]/g, ''); 
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ko-KR';
  window.speechSynthesis.speak(utterance);
  return null;
};
