import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Trash2, User, ImagePlus, X, Plus, MessageCircle, Sparkles,
} from "lucide-react";
import { CopyButton } from "../components/shared/CopyButton";
import { askGeminiChat } from "../services/gemini";
import { Message, ChatSession } from "../types";
import { SAMPLE_CHATBOT_PROMPTS } from "../utils/prompts";
import { useAuth } from "../contexts/auth";
import {
  loadSessions, saveSessions, createSession, addMessage,
  deleteSession, clearAllSessions,
} from "../utils/history";

// ── helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });
}

// ── component ─────────────────────────────────────────────────────────────────
export default function ChatbotPage() {
  const { user } = useAuth();
  const email = user?.email || "anonymous";

  // ── session state ──────────────────────────────────────────────────────────
  const [sessions, setSessions]               = useState<ChatSession[]>(() => loadSessions(email));
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;
  const messages: Message[] = activeSession?.messages ?? [];

  // ── ui state ───────────────────────────────────────────────────────────────
  const [userInput, setUserInput]     = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);

  // ── guard against double-send (StrictMode / fast-click) ───────────────────
  const sendingRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // ── init session ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = loadSessions(email);
    if (loaded.length === 0) {
      const s = createSession(email, "New Chat");
      setSessions(loadSessions(email));
      setActiveSessionId(s.id);
    } else {
      setSessions(loaded);
      setActiveSessionId(prev => prev ?? loaded[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // ── scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  // ── new chat ───────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    const s = createSession(email);
    const updated = loadSessions(email);
    setSessions(updated);
    setActiveSessionId(s.id);
    setError(null);
  }, [email]);

  // ── delete session ─────────────────────────────────────────────────────────
  const handleDeleteSession = useCallback((sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = deleteSession(email, sid);
    setSessions(remaining);
    if (activeSessionId === sid)
      setActiveSessionId(remaining[0]?.id ?? null);
  }, [email, activeSessionId]);

  // ── switch session ─────────────────────────────────────────────────────────
  const handleSwitchSession = useCallback((sid: string) => {
    setActiveSessionId(sid);
    setError(null);
  }, []);

  // ── image pick ─────────────────────────────────────────────────────────────
  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > 4 * 1024 * 1024) { setError("Image must be under 4 MB."); return; }
    try {
      const base64 = await fileToBase64(file);
      setPendingImage({ data: base64, mimeType: file.type, name: file.name });
      setError(null);
    } catch { setError("Failed to read image."); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── send ───────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = overrideText ?? userInput;
    if ((!text.trim() && !pendingImage) || isLoading || sendingRef.current) return;

    sendingRef.current = true;
    setError(null);

    // Resolve session id
    let sid = activeSessionId;
    if (!sid) {
      const s = createSession(email, "New Chat");
      sid = s.id;
      setSessions(loadSessions(email));
      setActiveSessionId(sid);
    }

    // Build user message
    const userMsg: Message = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      ...(pendingImage ? { image: { data: pendingImage.data, mimeType: pendingImage.mimeType } } : {}),
    };

    // Snapshot current messages for API (before state update)
    const historyForApi = [...messages, userMsg];

    // Write to localStorage once, then sync state from it
    addMessage(email, sid, userMsg);
    setSessions(loadSessions(email));

    // Clear inputs
    if (!overrideText) setUserInput("");
    const hadImage = !!pendingImage;
    setPendingImage(null);

    setIsLoading(true);
    try {
      const responseText = await askGeminiChat(historyForApi);
      const aiMsg: Message = {
        id: `a_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        role: "model",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      addMessage(email, sid, aiMsg);
      setSessions(loadSessions(email));
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          (hadImage ? "Failed to analyze image." : "Failed to get response. Check your API key.")
      );
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [userInput, pendingImage, isLoading, activeSessionId, email, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      id="chatbot-root"
      className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
    >
      {/* ════════════════════════════════════════════════════════════════════
          LEFT — Chat history panel (always visible, ChatGPT style)
      ════════════════════════════════════════════════════════════════════ */}
      <aside
        className="w-64 shrink-0 flex flex-col h-full"
        style={{
          background: "rgba(5,7,20,0.85)",
          borderRight: "1px solid rgba(139,92,246,0.12)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* New chat button */}
        <div className="p-3 shrink-0" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer group"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <Plus className="w-4 h-4 text-violet-400 group-hover:rotate-90 transition-transform duration-200" />
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessions.length === 0 && (
            <p className="text-[11px] text-slate-600 text-center pt-8 px-4">No conversations yet. Start a new chat!</p>
          )}
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => handleSwitchSession(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all group ${
                s.id === activeSessionId ? "text-violet-200" : "text-slate-500 hover:text-slate-200"
              }`}
              style={
                s.id === activeSessionId
                  ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }
                  : {}
              }
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
              <span className="flex-1 truncate">{s.title}</span>
              <button
                onClick={e => handleDeleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-600 hover:text-rose-400 transition-all cursor-pointer rounded"
                aria-label="Delete"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Clear all */}
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
          <button
            onClick={() => {
              clearAllSessions(email);
              setSessions([]);
              setActiveSessionId(null);
              handleNewChat();
            }}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-600 hover:text-rose-400 transition-colors cursor-pointer py-1.5 rounded-lg hover:bg-rose-500/5"
          >
            <Trash2 className="w-3 h-3" />
            Clear all history
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT — Chat area
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Top bar */}
        <div
          className="px-5 py-3 flex items-center gap-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(139,92,246,0.1)", background: "rgba(3,5,15,0.6)" }}
        >
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
            {activeSession?.title || "New Chat"}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

          {/* Empty state */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pb-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-200">How can I help you today?</h2>
                <p className="text-sm text-slate-500 max-w-sm">Ask me anything — questions, code, analysis, or attach an image.</p>
              </div>
              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {SAMPLE_CHATBOT_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    className="text-xs px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map(msg => {
            const isAI = msg.role === "model";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isAI ? "mr-auto msg-ai" : "ml-auto flex-row-reverse msg-user"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAI ? "text-violet-300" : "text-slate-200"
                  }`}
                  style={
                    isAI
                      ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }
                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1.5 max-w-[80%]">
                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={
                      isAI
                        ? {
                            background: "rgba(15,18,40,0.8)",
                            border: "1px solid rgba(139,92,246,0.15)",
                            borderTopLeftRadius: "4px",
                          }
                        : {
                            background: "linear-gradient(135deg, rgba(109,40,217,0.9), rgba(79,70,229,0.9))",
                            border: "1px solid rgba(139,92,246,0.3)",
                            borderTopRightRadius: "4px",
                          }
                    }
                  >
                    {msg.image && (
                      <div className="mb-2.5 rounded-xl overflow-hidden max-w-[240px] border border-white/10">
                        <img
                          src={`data:${msg.image.mimeType};base64,${msg.image.data}`}
                          alt="attached"
                          className="w-full h-auto block"
                        />
                      </div>
                    )}
                    {msg.content && (
                      <div className="whitespace-pre-wrap select-text text-slate-100">{msg.content}</div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-600 ${!isAI ? "justify-end" : ""}`}>
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <>
                        <span>·</span>
                        <CopyButton
                          text={msg.content}
                          className="border-0 bg-transparent p-0.5 rounded h-auto text-slate-600 hover:text-slate-300"
                          label=""
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto msg-ai">
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
              >
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                style={{ background: "rgba(15,18,40,0.8)", border: "1px solid rgba(139,92,246,0.15)", borderTopLeftRadius: "4px" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
              </div>
            </div>
          )}

          {error && (
            <div
              className="text-xs text-rose-400 rounded-xl px-4 py-3 max-w-lg mx-auto text-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ── */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderTop: "1px solid rgba(139,92,246,0.1)", background: "rgba(3,5,15,0.7)" }}
        >
          {/* Pending image */}
          {pendingImage && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <img src={`data:${pendingImage.mimeType};base64,${pendingImage.data}`} alt={pendingImage.name} className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xs text-slate-300 max-w-[140px] truncate">{pendingImage.name}</span>
              <button onClick={() => setPendingImage(null)} className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input row */}
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            {/* Image attach */}
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" ref={fileInputRef} onChange={handleImagePick} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-violet-400 hover:bg-white/5 transition-all cursor-pointer shrink-0"
              aria-label="Attach image"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              disabled={isLoading}
              value={userInput}
              onChange={e => { setUserInput(e.target.value); if (error) setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder={pendingImage ? "Add a caption (optional)…" : "Message AI…"}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none py-1"
            />

            {/* Send */}
            <button
              onClick={() => handleSend()}
              disabled={(!userInput.trim() && !pendingImage) || isLoading}
              className="p-2 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-30"
              style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.3)" }}
              aria-label="Send"
            >
              <Send className="w-4 h-4 text-violet-300" />
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-700 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
