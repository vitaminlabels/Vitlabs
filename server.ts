import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, type GenerateContentResponse, type Content } from "@google/genai";
import { CBT_SYSTEM_INSTRUCTION, REFRAME_SYSTEM_INSTRUCTION } from "./constants.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "missing-api-key";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
      retryOptions: {
        attempts: 1,
      },
    },
  });
}

// Store multi-turn conversation history per sessionId
const chatHistories = new Map<string, Content[]>();

async function generateWithFallback(
  params: {
    contents: Content[] | string;
    config?: Record<string, unknown>;
  }
): Promise<GenerateContentResponse> {
  const ai = getGenAIClient();
  let lastError: unknown = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (error) {
      console.warn(`Model ${model} failed, trying next fallback:`, error instanceof Error ? error.message : error);
      lastError = error;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize or reset a chat session
  app.post("/api/chat/init", (req, res) => {
    try {
      const { sessionId = "default" } = req.body || {};
      chatHistories.set(sessionId, []);
      res.json({ ok: true, sessionId });
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      res.status(500).json({
        error: "Failed to initialize chat session",
      });
    }
  });

  // Send a message to the CBT AI companion
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message, sessionId = "default" } = req.body || {};
      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const history = chatHistories.get(sessionId) || [];
      const updatedContents: Content[] = [
        ...history,
        { role: "user", parts: [{ text: message }] },
      ];

      const result = await generateWithFallback({
        contents: updatedContents,
        config: {
          systemInstruction: CBT_SYSTEM_INSTRUCTION,
        },
      });

      const responseText = result.text || "";
      const isCrisis = responseText.includes("[CRISIS_DETECTED]");
      const cleanText = responseText.replace("[CRISIS_DETECTED]", "").trim();

      chatHistories.set(sessionId, [
        ...updatedContents,
        { role: "model", parts: [{ text: responseText }] },
      ]);

      res.json({ text: cleanText, isCrisis });
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({
        error: "Maaf, saya sedang mengalami kesulitan koneksi. Bisakah kita coba lagi sebentar lagi?",
      });
    }
  });

  // Stream a message from the CBT AI companion (SSE)
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { message, sessionId = "default" } = req.body || {};
      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const history = chatHistories.get(sessionId) || [];
      const updatedContents: Content[] = [
        ...history,
        { role: "user", parts: [{ text: message }] },
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const ai = getGenAIClient();
      let streamSuccess = false;
      let fullText = "";

      for (const model of FALLBACK_MODELS) {
        try {
          const streamResponse = await ai.models.generateContentStream({
            model,
            contents: updatedContents,
            config: {
              systemInstruction: CBT_SYSTEM_INSTRUCTION,
            },
          });

          for await (const chunk of streamResponse) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
              fullText += c.text;
              res.write(`data: ${JSON.stringify({ text: c.text })}\n\n`);
            }
          }
          streamSuccess = true;
          break;
        } catch (err) {
          console.warn(`Stream model ${model} failed:`, err instanceof Error ? err.message : err);
        }
      }

      if (!streamSuccess) {
        throw new Error("All streaming models failed");
      }

      chatHistories.set(sessionId, [
        ...updatedContents,
        { role: "model", parts: [{ text: fullText }] },
      ]);

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Gemini Chat Stream Error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Maaf, saya sedang mengalami kesulitan koneksi. Bisakah kita coba lagi sebentar lagi?",
        });
      } else {
        res.write(
          `data: ${JSON.stringify({
            error: "Maaf, saya sedang mengalami kesulitan koneksi. Bisakah kita coba lagi sebentar lagi?",
          })}\n\n`
        );
        res.end();
      }
    }
  });

  // Cognitive reframing analysis endpoint
  app.post("/api/reframe", async (req, res) => {
    try {
      const { thought, emotion } = req.body || {};
      if (!thought || !emotion) {
        res.status(400).json({ error: "Thought and emotion are required" });
        return;
      }

      const prompt = `Pikiran Negatif: "${thought}". Emosi: "${emotion}".`;

      const response = await generateWithFallback({
        contents: prompt,
        config: {
          systemInstruction: REFRAME_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              distortionType: { type: Type.STRING },
              explanation: { type: Type.STRING },
              reframes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response from model");
      }

      const parsed = JSON.parse(text.trim());
      res.json(parsed);
    } catch (error) {
      console.error("Reframing Error:", error);
      res.status(500).json({
        error: "Terjadi kendala saat menganalisis pikiran. Silakan coba lagi sebentar lagi.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
