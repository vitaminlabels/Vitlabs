// Client-side service that communicates with server-side Gemini API endpoints

let currentSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const initializeChat = () => {
  currentSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  fetch("/api/chat/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: currentSessionId }),
  }).catch((error) => {
    console.error("Failed to initialize chat session:", error);
  });
};

export const sendMessageToAI = async (
  userMessage: string
): Promise<{ text: string; isCrisis: boolean }> => {
  try {
    const response = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        sessionId: currentSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || "",
      isCrisis: Boolean(data.isCrisis),
    };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      text: "Maaf, saya sedang mengalami kesulitan koneksi. Bisakah kita coba lagi sebentar lagi?",
      isCrisis: false,
    };
  }
};

export const generateReframe = async (thought: string, emotion: string) => {
  try {
    const response = await fetch("/api/reframe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thought, emotion }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Reframing Error:", error);
    throw error;
  }
};