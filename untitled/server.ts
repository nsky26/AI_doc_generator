import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const APP_PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Lazy-initialization utility to prevent crashing on boot if key is missing, while providing clean error messages
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure your API key in the Settings > Secrets menu in the AI Studio UI.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. ChatGPT-style Chatbot API (Supports Conversation History)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const ai = getGeminiClient();

    // Map history to standard Gemini model API structures
    const contents = messages.map((m: any) => {
      const parts: any[] = [{ text: m.content || "" }];
      if (m.image && m.image.data && m.image.mimeType) {
        parts.push({
          inlineData: {
            data: m.image.data,
            mimeType: m.image.mimeType
          }
        });
      }
      return {
        role: m.role === "model" ? "model" : "user",
        parts
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: "You are AI Document Generator Assistant, a brilliant, helpful, and polite AI chatbot. Provide helpful, conversational, and direct answers. Use Markdown formatting when appropriate."
      }
    });

    res.json({ content: response.text || "" });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate chatbot response" });
  }
});

// 2. AI Text Summarizer API (3 to 5 concise bullets)
app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text content is required" });
    }

    const ai = getGeminiClient();
    const prompt = `Summarize the following text into exactly 3-5 concise, high-impact bullet points. Each bullet point should be clear and start with "• ". Do not write introduction or concluding text. Provide ONLY the bullet points:

${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text || "" });
  } catch (error: any) {
    console.error("Summarizer API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
});

// 3. AI Tone Converter API (Professional, Friendly, Formal, Casual)
app.post("/api/tone-convert", async (req, res) => {
  try {
    const { text, tone } = req.body;
    if (!text || !tone) {
      return res.status(400).json({ error: "Both text and target tone are required" });
    }

    const ai = getGeminiClient();
    const prompt = `Rewrite the text below to match a "${tone}" style. Keep the core message and meaning perfectly intact, but alter the wording, vocabulary, and sentence structures to fit the specified tone representation.

Tone target: ${tone}
Original Text: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ convertedText: response.text || "" });
  } catch (error: any) {
    console.error("Tone Converter API error:", error);
    res.status(500).json({ error: error.message || "Failed to convert text tone" });
  }
});

// 4. AI Caption Generator API (Platform-specific response layout schema)
app.post("/api/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getGeminiClient();
    const prompt = `Generate social media captions about the topic/concept: "${topic}". Create three different types: one optimized for Instagram (engaging, short, with emojis/hashtags), one optimized for LinkedIn (thoughtful, structured, professional), and one general caption.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instagram: { type: Type.STRING, description: "Instagram version of the caption with rich emojis and hashtags." },
            linkedin: { type: Type.STRING, description: "LinkedIn post version, professional and structured." },
            general: { type: Type.STRING, description: "A balanced general purpose caption." }
          },
          required: ["instagram", "linkedin", "general"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ captions: parsed });
  } catch (error: any) {
    console.error("Caption Generator API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate captions" });
  }
});

// 5. AI Resume Booster API
app.post("/api/resume-boost", async (req, res) => {
  try {
    const { bulletPoint } = req.body;
    if (!bulletPoint) {
      return res.status(400).json({ error: "Resume bullet point is required" });
    }

    const ai = getGeminiClient();
    const prompt = `Review, expand, and improve the following resume bullet point. Use active verbs, highlight potential metric-driven business outcomes, and make it sound elegant, punchy, and professional for recruiters.

Original Point: ${bulletPoint}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            before: { type: Type.STRING, description: "The original bullet point." },
            after: { type: Type.STRING, description: "The single best improved bullet point (highly professional and metrics-oriented)." },
            explanation: { type: Type.STRING, description: "A short, actionable explanation of the structural enhancements made." }
          },
          required: ["before", "after", "explanation"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ improvement: parsed });
  } catch (error: any) {
    console.error("Resume Booster API error:", error);
    res.status(500).json({ error: error.message || "Failed to improve resume bullet point" });
  }
});

// 6. AI Certificate Content Generator
app.post("/api/certificate-generator", async (req, res) => {
  try {
    const { recipientName, courseTitle, duration } = req.body;
    if (!recipientName || !courseTitle || !duration) {
      return res.status(400).json({ error: "Name, Course/Role, and Duration are required fields" });
    }

    const ai = getGeminiClient();
    const prompt = `Write a beautiful, formal, and authoritative certificate citation paragraph. It is being awarded to ${recipientName} for successfully fulfilling the requirements of "${courseTitle}" held over a duration of ${duration}. Make it sound incredibly official, elegant, and highly professional for placement in a formal corporate or educational certificate ceremony. Let it conclude with a line recognizing their dedication and excellence. Keep the output as a single unified citation block.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ certificateText: response.text || "" });
  } catch (error: any) {
    console.error("Certificate Generator API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate certificate paragraph" });
  }
});

// 7. AI Theme Suggestion Tool (Structured Output)
app.post("/api/theme-suggestion", async (req, res) => {
  try {
    const { projectDescription } = req.body;
    if (!projectDescription) {
      return res.status(400).json({ error: "Project description is required" });
    }

    const ai = getGeminiClient();
    const prompt = `Analyze this digital web/mobile app description: "${projectDescription}". Propose a professional, beautiful UI theme mockup scheme containing a coherent and accessible 5-color palette, 2 Google Font pairings, background CSS suggestions (e.g. gradients or solid codes), and 3 clever UX visual design tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              description: "A gorgeous 4-5 color palette mapping colors to hex and literal visual descriptions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING, description: "Hexadecimal color string like #8B5CF6." },
                  name: { type: Type.STRING, description: "Friendly descriptor name. E.g. 'Royal Purple'." }
                },
                required: ["hex", "name"]
              }
            },
            fonts: {
              type: Type.ARRAY,
              description: "Exactly two complementary font recommendations (E.g. [heading font, body font]).",
              items: { type: Type.STRING }
            },
            background: { type: Type.STRING, description: "A CSS style property value for background, such as 'linear-gradient(to bottom, #0F172A, #1E1B4B)' or '#0b0f19'." },
            tips: {
              type: Type.ARRAY,
              description: "Three expert creative design tips on how to apply these colors/fonts.",
              items: { type: Type.STRING }
            }
          },
          required: ["colors", "fonts", "background", "tips"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ theme: parsed });
  } catch (error: any) {
    console.error("Theme Suggestion API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate theme suggestion" });
  }
});

// 8. AI Document Generator — text + optional base64 image/file content
app.post("/api/generate-document", async (req, res) => {
  try {
    const { prompt, docType, fileText, imageData, imageMimeType } = req.body;
    if (!prompt && !fileText && !imageData) {
      return res.status(400).json({ error: "At least a prompt, file content, or image is required." });
    }

    const ai = getGeminiClient();

    const docTypeInstructions: Record<string, string> = {
      "report":       "a formal structured report with an Executive Summary, Findings, and Conclusion sections",
      "email":        "a professional business email with Subject, Greeting, Body, and Sign-off",
      "essay":        "a well-structured essay with Introduction, Body paragraphs, and Conclusion",
      "letter":       "a formal letter with proper salutation, body paragraphs, and closing",
      "summary":      "a concise executive summary with 3-5 key bullet points followed by a short paragraph",
      "proposal":     "a business proposal with Overview, Objectives, Approach, Timeline, and Call to Action",
      "meeting-notes":"structured meeting notes with Attendees, Agenda Items, Key Decisions, and Action Items",
      "blog-post":    "an engaging blog post with a catchy title, introduction, subheadings, and conclusion",
      "free":         "a well-written document in the most appropriate format for the given content",
    };

    const format = docTypeInstructions[docType] || docTypeInstructions["free"];

    let textInstruction = `You are an expert document writer. Generate ${format}.\n\n`;
    if (prompt) textInstruction += `User Instructions / Topic:\n${prompt}\n\n`;
    if (fileText) textInstruction += `Attached File Content (use this as source material):\n${fileText}\n\n`;
    textInstruction += `Write the complete document now. Use clear formatting with headings and paragraphs where appropriate.`;

    const parts: any[] = [{ text: textInstruction }];

    if (imageData && imageMimeType) {
      parts.push({ inlineData: { data: imageData, mimeType: imageMimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
    });

    res.json({ document: response.text || "" });
  } catch (error: any) {
    console.error("Document Generator API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate document" });
  }
});

// Configure Vite middleware for development vs production
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production — serving dist/   Node_ENV=production");
  } else {
    console.log("Development — starting Vite SSR middlewares   NODE_ENV=" + (process.env.NODE_ENV || "undefined"));
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, host: true },
        appType: "spa",
        resolve: {
          alias: {
            "/@fs/": path.resolve("."),
          },
        },
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached successfully.");
    } catch (viteErr: any) {
      console.error("Vite failed to start:", viteErr.message || viteErr);
    }
  }

  const server = app.listen(APP_PORT, () => {
    // hostname undefined = all interfaces, avoids Windows 0.0.0.0 binding quirk
    console.log(`------------------------------------------------------------`);
    console.log(`  AI Toolkit Server  →  http://localhost:${APP_PORT}`);
    console.log(`  API endpoints     →  http://localhost:${APP_PORT}/api/`);
    console.log(`  Vite HMR          →  http://localhost:5173/`);
    console.log(`------------------------------------------------------------`);
  });

  server.on("error", (err: any) => {
    console.error("\n[FATAL] Server listen error:", err.message || err);
    console.error("  → Is another process already on port", APP_PORT, "?");
    console.error("  → Fix: taskkill /PID <PID> /F   /   or   Set PORT=3001 npm run dev\n");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("\n[FATAL] Unhandled promise rejection:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.error("\n[FATAL] Uncaught exception:", err.message || err);
    process.exit(1);
  });
}

startServer();
