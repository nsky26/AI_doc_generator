import axios from "axios";
import { Message, ToneType, CaptionsResponse, ResumeImprovement, ThemeSuggestion } from "../types";

const api = axios.create({
  timeout: 45000, // accommodate larger model completions
  headers: {
    "Content-Type": "application/json",
  },
});

export async function askGeminiChat(messages: Message[]): Promise<string> {
  const response = await api.post("/api/chat", { messages });
  return response.data.content;
}

export async function summarizeText(text: string): Promise<string> {
  const response = await api.post("/api/summarize", { text });
  return response.data.summary;
}

export async function convertTone(text: string, tone: ToneType): Promise<string> {
  const response = await api.post("/api/tone-convert", { text, tone });
  return response.data.convertedText;
}

export async function generateCaptions(topic: string): Promise<CaptionsResponse> {
  const response = await api.post("/api/generate-captions", { topic });
  return response.data.captions;
}

export async function boostResume(bulletPoint: string): Promise<ResumeImprovement> {
  const response = await api.post("/api/resume-boost", { bulletPoint });
  return response.data.improvement;
}

export async function generateCertificateContent(
  recipientName: string,
  courseTitle: string,
  duration: string
): Promise<string> {
  const response = await api.post("/api/certificate-generator", {
    recipientName,
    courseTitle,
    duration,
  });
  return response.data.certificateText;
}

export async function generateThemeSuggestions(projectDescription: string): Promise<ThemeSuggestion> {
  const response = await api.post("/api/theme-suggestion", { projectDescription });
  return response.data.theme;
}

export async function generateDocument(payload: {
  prompt: string;
  docType: string;
  fileText?: string;
  imageData?: string;
  imageMimeType?: string;
}): Promise<string> {
  const response = await api.post("/api/generate-document", payload);
  return response.data.document;
}
