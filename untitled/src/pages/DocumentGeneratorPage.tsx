import React, { useState, useRef, useCallback } from "react";
import {
  FileText, Sparkles, X, ImagePlus, Paperclip, Mic, MicOff,
  Download, RotateCcw, AlertTriangle, ChevronDown, FileCheck,
} from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Textarea } from "../components/shared/Textarea";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { generateDocument } from "../services/gemini";
import { downloadTextFile } from "../utils/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttachedImage {
  data: string;       // base64
  mimeType: string;
  name: string;
  preview: string;    // object URL
}

interface AttachedFile {
  name: string;
  text: string;       // extracted plain text
  size: number;
}

const DOC_TYPES = [
  { value: "free",          label: "Auto Detect",    emoji: "✨" },
  { value: "report",        label: "Report",         emoji: "📊" },
  { value: "email",         label: "Email",          emoji: "📧" },
  { value: "essay",         label: "Essay",          emoji: "📝" },
  { value: "letter",        label: "Letter",         emoji: "✉️"  },
  { value: "summary",       label: "Summary",        emoji: "📋" },
  { value: "proposal",      label: "Proposal",       emoji: "💼" },
  { value: "meeting-notes", label: "Meeting Notes",  emoji: "🗒️"  },
  { value: "blog-post",     label: "Blog Post",      emoji: "📰" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentGeneratorPage() {
  const [prompt, setPrompt]           = useState("");
  const [docType, setDocType]         = useState("free");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [attachedFile, setAttachedFile]   = useState<AttachedFile | null>(null);
  const [output, setOutput]           = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported]              = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef                = useRef<any>(null);

  // Dropdown
  const [typeOpen, setTypeOpen]       = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  // ── Image attach ────────────────────────────────────────────────────────────
  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }
    try {
      const data = await fileToBase64(file);
      const preview = URL.createObjectURL(file);
      setAttachedImage({ data, mimeType: file.type, name: file.name, preview });
      setError(null);
    } catch { setError("Failed to read image."); }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ── File attach (TXT / PDF text layer / DOCX plain text) ────────────────────
  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["text/plain", "text/csv", "text/markdown",
                     "application/pdf", "application/msword",
                     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(txt|md|csv)$/i)) {
      setError("Supported file types: TXT, MD, CSV. PDF and DOCX text layers are extracted automatically.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { setError("File must be under 2 MB."); return; }
    try {
      const text = await fileToText(file);
      setAttachedFile({ name: file.name, text: text.slice(0, 12000), size: file.size });
      setError(null);
    } catch { setError("Could not read file text. Try a plain .txt file."); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Voice recording ─────────────────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (!voiceSupported) { setError("Speech recognition is not supported in this browser. Try Chrome."); return; }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join(" ");
      setPrompt((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => { setIsRecording(false); setError("Voice recognition error. Please try again."); };
    recognition.onend   = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setError(null);
  }, [isRecording, voiceSupported]);

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim() && !attachedFile && !attachedImage) {
      setError("Please enter a prompt, attach a file, or attach an image to generate a document.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setOutput("");
    try {
      const result = await generateDocument({
        prompt:       prompt.trim(),
        docType,
        fileText:     attachedFile?.text,
        imageData:    attachedImage?.data,
        imageMimeType: attachedImage?.mimeType,
      });
      setOutput(result);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to generate document. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setDocType("free");
    setAttachedImage(null);
    setAttachedFile(null);
    setOutput("");
    setError(null);
  };

  const handleDownload = () => {
    if (!output) return;
    const label = DOC_TYPES.find(d => d.value === docType)?.label || "document";
    downloadTextFile(output, `generated-${label.toLowerCase().replace(/\s+/g, "-")}.txt`);
  };

  const selectedType = DOC_TYPES.find(d => d.value === docType)!;

  return (
    <div id="doc-generator-page" className="space-y-6 max-w-6xl mx-auto px-1 py-2">
      <ToolHeader
        title="AI Document Generator"
        description="Generate any document from a text prompt, uploaded file, image, or voice input. Choose a document type and let Gemini write it for you."
        categoryBadge="Generate"
        icon={<FileText className="w-6 h-6 text-white" />}
        colorClass="from-violet-500 to-indigo-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Input Panel ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Document Type Selector */}
          <Card variant="glass" className="p-5 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Document Type</span>
            <div className="relative">
              <button
                onClick={() => setTypeOpen(v => !v)}
                className="w-full flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 hover:border-violet-500/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{selectedType.emoji}</span>
                  <span className="font-medium">{selectedType.label}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
              </button>

              {typeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                  {DOC_TYPES.map(dt => (
                    <button
                      key={dt.value}
                      onClick={() => { setDocType(dt.value); setTypeOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left ${
                        docType === dt.value
                          ? "bg-violet-950/40 text-violet-300"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base w-5 text-center">{dt.emoji}</span>
                      <span>{dt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Prompt Input */}
          <Card variant="glass" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Prompt / Instructions</span>
              {/* Voice button */}
              <button
                onClick={toggleRecording}
                title={isRecording ? "Stop recording" : "Dictate prompt via microphone"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isRecording
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-600"
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? "Stop" : "Voice"}
              </button>
            </div>

            <Textarea
              id="doc-gen-prompt"
              placeholder="Describe what you want to generate… e.g. 'Write a project proposal for a mobile app that helps students track study habits' or leave blank and attach a file/image."
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); if (error) setError(null); }}
              className="min-h-[160px] font-sans"
            />

            {isRecording && (
              <div className="flex items-center gap-2 text-xs text-rose-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Listening… speak your prompt clearly
              </div>
            )}
          </Card>

          {/* Attachments Row */}
          <Card variant="glass" className="p-5 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Attachments</span>

            <div className="flex flex-wrap gap-3">
              {/* Image attach */}
              <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleImagePick} />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:border-violet-500/50 hover:text-slate-100 text-xs font-medium transition-all cursor-pointer"
              >
                <ImagePlus className="w-4 h-4 text-violet-400" />
                Attach Image
              </button>

              {/* File attach */}
              <input ref={fileInputRef} type="file" accept=".txt,.md,.csv,.pdf,.doc,.docx" className="hidden" onChange={handleFilePick} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:border-violet-500/50 hover:text-slate-100 text-xs font-medium transition-all cursor-pointer"
              >
                <Paperclip className="w-4 h-4 text-indigo-400" />
                Attach File
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Supported: PNG, JPG, GIF, WEBP (images) · TXT, MD, CSV (text files) · max 5 MB image / 2 MB file
            </p>

            {/* Attached image preview */}
            {attachedImage && (
              <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                <img src={attachedImage.preview} alt={attachedImage.name} className="w-12 h-12 rounded-lg object-cover border border-slate-700/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{attachedImage.name}</p>
                  <p className="text-[10px] text-slate-500">{attachedImage.mimeType}</p>
                </div>
                <button onClick={() => setAttachedImage(null)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer" aria-label="Remove image">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attached file preview */}
            {attachedFile && (
              <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{attachedFile.name}</p>
                  <p className="text-[10px] text-slate-500">{formatBytes(attachedFile.size)} · {attachedFile.text.length.toLocaleString()} chars extracted</p>
                </div>
                <button onClick={() => setAttachedFile(null)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </Card>

          {/* Error */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            {(prompt || attachedImage || attachedFile || output) && (
              <Button variant="ghost" onClick={handleClear} className="h-11 cursor-pointer">
                <RotateCcw className="w-4 h-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="gradient"
              onClick={handleGenerate}
              isLoading={isLoading}
              disabled={(!prompt.trim() && !attachedFile && !attachedImage) || isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="h-11 px-6 cursor-pointer"
            >
              Generate Document
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Output Panel ───────────────────────────────────────────── */}
        <Card variant="glass" className="p-6 min-h-[520px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 shrink-0">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Generated Document
            </h2>
            {output && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleDownload}
                  className="h-8 px-3 text-[11px] border border-slate-800 text-violet-400 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
                <CopyButton text={output} className="bg-slate-900 border-slate-800 h-8" label="Copy" />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <Loader message="Writing your document…" className="py-24" />
            ) : output ? (
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans select-text bg-slate-950/40 rounded-xl p-5 border border-slate-900/60 animate-fadeIn">
                {output}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-24 text-slate-500 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-700 stroke-[1.2]" />
                </div>
                <p className="text-sm font-medium">Your document will appear here</p>
                <p className="text-xs max-w-xs text-slate-600">
                  Enter a prompt, attach a file or image, or use your voice — then click Generate Document.
                </p>
              </div>
            )}
          </div>

          {output && (
            <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-3 mt-4 shrink-0">
              Generated as <span className="text-violet-400 font-semibold">{selectedType.emoji} {selectedType.label}</span> · powered by Gemini 2.5-flash
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
