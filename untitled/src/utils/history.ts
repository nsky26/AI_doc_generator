import type { ChatSession, Message } from "../types";

export const HISTORY_KEY_PREFIX = "ai_docgen_chats";

export function getHistoryKey(email: string): string {
  return `${HISTORY_KEY_PREFIX}_${email.toLowerCase()}`;
}

export function loadSessions(email: string): ChatSession[] {
  try {
    const raw = localStorage.getItem(getHistoryKey(email));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return [];
}

export function saveSessions(email: string, sessions: ChatSession[]): void {
  localStorage.setItem(getHistoryKey(email), JSON.stringify(sessions));
}

export function createSession(email: string, title?: string): ChatSession {
  const session: ChatSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title: title || "New Chat",
    messages: [],
    createdAt: Date.now(),
  };
  const existing = loadSessions(email);
  saveSessions(email, [session, ...existing]);
  return session;
}

export function addMessage(email: string, sessionId: string, message: Message): ChatSession | null {
  const sessions = loadSessions(email);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return null;
  sessions[idx].messages.push(message);
  // Auto-title from first user message
  if (sessions[idx].messages.length === 1 && message.role === "user") {
    sessions[idx].title = message.content.slice(0, 40) + (message.content.length > 40 ? "…" : "");
  }
  saveSessions(email, sessions);
  return sessions[idx];
}

export function deleteSession(email: string, sessionId: string): ChatSession[] {
  const sessions = loadSessions(email).filter((s) => s.id !== sessionId);
  saveSessions(email, sessions);
  return sessions;
}

export function clearAllSessions(email: string): void {
  saveSessions(email, []);
}
