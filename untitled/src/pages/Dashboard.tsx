import React, { useState, useRef, useCallback } from "react";
import {
  Sparkles, FileText, X, ImagePlus, Paperclip, Mic, MicOff,
  Download, RotateCcw, AlertTriangle, ChevronDown, FileCheck,
  Wand2, FlaskConical,
} from "lucide-react";
import { Button } from "../components/shared/Button";
import { Textarea } from "../components/shared/Textarea";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { generateDocument } from "../services/gemini";
import { downloadTextFile } from "../utils/helpers";

// ─── Doc types ────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { value: "free",          label: "Auto Detect",   emoji: "✨" },
  { value: "report",        label: "Report",        emoji: "📊" },
  { value: "email",         label: "Email",         emoji: "📧" },
  { value: "essay",         label: "Essay",         emoji: "📝" },
  { value: "letter",        label: "Letter",        emoji: "✉️"  },
  { value: "summary",       label: "Summary",       emoji: "📋" },
  { value: "proposal",      label: "Proposal",      emoji: "💼" },
  { value: "meeting-notes", label: "Meeting Notes", emoji: "🗒️"  },
  { value: "blog-post",     label: "Blog Post",     emoji: "📰" },
];

// ─── Sample demos ─────────────────────────────────────────────────────────────
const SAMPLES = [
  {
    label: "Project Proposal",
    docType: "proposal",
    prompt:
      "Write a professional project proposal for a mobile app called 'StudyMate' that helps university students track their study habits, set daily goals, and receive AI-powered study tips. The app targets students aged 18–25. Include an overview, objectives, key features, timeline (3 months), and a call to action for stakeholders.",
  },
  {
    label: "Business Email",
    docType: "email",
    prompt:
      "Write a professional business email from a project manager to a client named Mr. David Chen, informing him that the website redesign project has been completed ahead of schedule. Mention that the final deliverables are attached, request a review meeting next week, and express gratitude for their collaboration.",
  },
  {
    label: "Internship Report",
    docType: "report",
    prompt:
      "Generate a formal internship completion report for a student named Priya Sharma who completed a 4-week AI development internship at TechNova Solutions. Include sections: Executive Summary, Tasks Completed, Skills Gained, Challenges Faced, and Recommendations. Make it sound professional and detailed.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface AttachedImage { data: string; mimeType: string; name: string; preview: string; }
interface AttachedFile  { name: string; text: string; size: number; }

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });
}
function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [prompt, setPrompt]               = useState("");
  const [docType, setDocType]             = useState("free");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [attachedFile, setAttachedFile]   = useState<AttachedFile | null>(null);
  const [output, setOutput]               = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [isRecording, setIsRecording]     = useState(false);
  const [typeOpen, setTypeOpen]           = useState(false);
  const [voiceSupported]                  = useState(() =>
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  );
  const recognitionRef = useRef<any>(null);
  const imageInputRef  = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  // ── Image ──────────────────────────────────────────────────────────────────
  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }
    try {
      const data = await fileToBase64(file);
      setAttachedImage({ data, mimeType: file.type, name: file.name, preview: URL.createObjectURL(file) });
      setError(null);
    } catch { setError("Failed to read image."); }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ── File ───────────────────────────────────────────────────────────────────
  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("File must be under 2 MB."); return; }
    try {
      const text = await fileToText(file);
      setAttachedFile({ name: file.name, text: text.slice(0, 12000), size: file.size });
      setError(null);
    } catch { setError("Could not read file. Try a plain .txt file."); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (!voiceSupported) { setError("Speech recognition not supported. Try Chrome."); return; }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (ev: any) => {
      const t = Array.from(ev.results as any[]).map((r: any) => r[0].transcript).join(" ");
      setPrompt(p => p ? p + " " + t : t);
    };
    rec.onerror = () => { setIsRecording(false); setError("Voice error. Try again."); };
    rec.onend   = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start(); setIsRecording(true); setError(null);
  }, [isRecording, voiceSupported]);

  // ── Generate ───────────────────────────────────────────────────────────────
  const runGenerate = async (overridePrompt?: string, overrideType?: string) => {
    const p = overridePrompt ?? prompt;
    const t = overrideType   ?? docType;
    if (!p.trim() && !attachedFile && !attachedImage) {
      setError("Enter a prompt, attach a file, or attach an image.");
      return;
    }
    setError(null); setIsLoading(true); setOutput("");
    try {
      const result = await generateDocument({
        prompt: p.trim(), docType: t,
        fileText: attachedFile?.text,
        imageData: attachedImage?.data,
        imageMimeType: attachedImage?.mimeType,
      });
      setOutput(result);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to generate. Please check your API key.");
    } finally { setIsLoading(false); }
  };

  // ── Load sample ────────────────────────────────────────────────────────────
  const loadSample = (s: typeof SAMPLES[0]) => {
    setPrompt(s.prompt);
    setDocType(s.docType);
    setAttachedImage(null);
    setAttachedFile(null);
    setOutput("");
    setError(null);
    // auto-generate after state settles
    setTimeout(() => runGenerate(s.prompt, s.docType), 50);
  };

  const handleClear = () => {
    setPrompt(""); setDocType("free");
    setAttachedImage(null); setAttachedFile(null);
    setOutput(""); setError(null);
  };

  const handleDownload = () => {
    if (!output) return;
    const label = DOC_TYPES.find(d => d.value === docType)?.label || "document";
    downloadTextFile(output, `generated-${label.toLowerCase().replace(/\s+/g, "-")}.txt`);
  };

  const selectedType = DOC_TYPES.find(d => d.value === docType)!;

  return (
    <div
      id="dashboard-root"
      className="min-h-[calc(100vh-4rem)] w-full relative overflow-x-hidden"
    >
      {/* ── Full-page glassmorphism background blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero welcome header ── */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-violet-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini 2.5-flash
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome to<br className="sm:hidden" /> Document Generator
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Generate professional documents from a prompt, image, file, or voice — instantly.
          </p>
        </div>

        {/* ── Sample load buttons ── */}
        <div className="flex flex-wrap justify-center gap-3">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider self-center">
            <FlaskConical className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
            Load Demo:
          </span>
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              onClick={() => loadSample(s)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 backdrop-blur-md text-slate-300 hover:bg-white/10 hover:border-violet-500/40 hover:text-violet-300 transition-all cursor-pointer disabled:opacity-40"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Main glass card ── */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">

            {/* ── LEFT: Input ── */}
            <div className="p-6 md:p-8 space-y-5">

              {/* Title row */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">AI Document Generator</h2>
                  <p className="text-[11px] text-slate-500">Prompt · Image · File · Voice</p>
                </div>
              </div>

              {/* Doc type selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                <div className="relative">
                  <button
                    onClick={() => setTypeOpen(v => !v)}
                    className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 hover:border-violet-500/40 hover:bg-white/8 transition-all cursor-pointer backdrop-blur-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span>{selectedType.emoji}</span>
                      <span className="font-medium">{selectedType.label}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${typeOpen ? "rotate-180" : ""}`} />
                  </button>
                  {typeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                      {DOC_TYPES.map(dt => (
                        <button
                          key={dt.value}
                          onClick={() => { setDocType(dt.value); setTypeOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left ${
                            docType === dt.value ? "bg-violet-950/60 text-violet-300" : "text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <span className="w-5 text-center">{dt.emoji}</span>
                          <span>{dt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prompt / Instructions</label>
                  <button
                    onClick={toggleRecording}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      isRecording
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-100 hover:border-slate-600"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? "Stop" : "Voice"}
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={e => { setPrompt(e.target.value); if (error) setError(null); }}
                  placeholder="Describe what you want to generate… e.g. 'Write a project proposal for a mobile app that helps students track study habits'"
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all resize-none backdrop-blur-sm"
                />
                {isRecording && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                    Listening… speak your prompt clearly
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attachments</label>
                <div className="flex flex-wrap gap-2">
                  <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleImagePick} />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:border-violet-500/40 hover:text-slate-100 text-xs font-medium transition-all cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-violet-400" />
                    Image
                  </button>
                  <input ref={fileInputRef} type="file" accept=".txt,.md,.csv,.pdf,.doc,.docx" className="hidden" onChange={handleFilePick} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:border-violet-500/40 hover:text-slate-100 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    File
                  </button>
                </div>
                <p className="text-[10px] text-slate-600">PNG/JPG/WEBP up to 5 MB · TXT/MD/CSV up to 2 MB</p>

                {attachedImage && (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <img src={attachedImage.preview} alt={attachedImage.name} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{attachedImage.name}</p>
                      <p className="text-[10px] text-slate-500">{attachedImage.mimeType}</p>
                    </div>
                    <button onClick={() => setAttachedImage(null)} className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                )}
                {attachedFile && (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{formatBytes(attachedFile.size)}</p>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {(prompt || attachedImage || attachedFile || output) && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
                <Button
                  variant="gradient"
                  onClick={() => runGenerate()}
                  isLoading={isLoading}
                  disabled={(!prompt.trim() && !attachedFile && !attachedImage) || isLoading}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="ml-auto h-11 px-6 cursor-pointer shadow-lg shadow-violet-600/25"
                >
                  Generate Document
                </Button>
              </div>
            </div>

            {/* ── RIGHT: Output ── */}
            <div className="p-6 md:p-8 flex flex-col min-h-[520px]">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  Generated Document
                </h2>
                {output && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-violet-400 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <CopyButton text={output} className="bg-white/5 border-white/10 h-8" label="Copy" />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <Loader message="Writing your document…" className="py-24" />
                ) : output ? (
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans select-text bg-white/5 rounded-xl p-5 border border-white/10 animate-fadeIn">
                    {output}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-600 stroke-[1.2]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-400">Your document will appear here</p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Type a prompt, attach a file or image, use voice — or click a demo above to see it in action.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {output && (
                <div className="text-[11px] text-slate-500 border-t border-white/10 pt-3 mt-4 shrink-0">
                  Generated as <span className="text-violet-400 font-semibold">{selectedType.emoji} {selectedType.label}</span> · Gemini 2.5-flash
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
