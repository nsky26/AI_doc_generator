import React, { useState } from "react";
import { RefreshCw, Copy, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Textarea } from "../components/shared/Textarea";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { convertTone } from "../services/gemini";
import { ToneType } from "../types";
import { SAMPLE_TONE_CONVERSIONS } from "../utils/prompts";

export default function ToneConverterPage() {
  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional");
  const [outputResult, setOutputResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tones: { value: ToneType; label: string; description: string; emoji: string }[] = [
    { value: "professional", label: "Professional", description: "Polished, diplomatic, clear, and action-oriented syntax.", emoji: "💼" },
    { value: "friendly", label: "Friendly", description: "Warm, collaborative, inviting, and cheerful wording.", emoji: "🌟" },
    { value: "formal", label: "Formal", description: "Courteous, academic, highly structured, and respectful style.", emoji: "👔" },
    { value: "casual", label: "Casual", description: "Relaxed, easy-going, colloquial, and conversational flow.", emoji: "☕" },
  ];

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      setError("Please input some text before requesting styling.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const rewritten = await convertTone(inputText, selectedTone);
      setOutputResult(rewritten);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to convert text tone. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (index: number) => {
    setInputText(SAMPLE_TONE_CONVERSIONS[index]);
    setError(null);
  };

  const handleClear = () => {
    setInputText("");
    setOutputResult("");
    setError(null);
  };

  return (
    <div id="tone-converter-page" className="space-y-6 max-w-5xl mx-auto px-1 py-2">
      <ToolHeader
        title="AI Tone Converter"
        description="Refine conversational drafts, direct complaints, or meeting notes into four professional, friendly, casual, or formal variations."
        categoryBadge="Utility"
        icon={<RefreshCw className="w-6 h-6 text-white" />}
        colorClass="from-pink-500 to-rose-650"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Settings (7 cols on desktop) */}
        <div className="md:col-span-7 space-y-6">
          <Card variant="glass" className="p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tone Objective selection</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => loadSample(0)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Load Sample 1
                  </button>
                  <button
                    onClick={() => loadSample(1)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Load Sample 2
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {tones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => {
                      setSelectedTone(tone.value);
                      if (error) setError(null);
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedTone === tone.value
                        ? "bg-pink-950/20 border-pink-500/50 text-slate-100 shadow-lg shadow-pink-500/5"
                        : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-800 hover:bg-slate-900/80"
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{tone.emoji}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${selectedTone === tone.value ? "text-pink-400" : "text-slate-200"}`}>
                        {tone.label}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">{tone.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              id="tone-converter-input"
              label="Original Draft Copy"
              placeholder="E.g. I can't attend the meeting tomorrow. I have other things to do..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              className="min-h-[160px] font-sans"
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                Length: {inputText.length} characters
              </span>
              
              <div className="flex items-center gap-2">
                {inputText && (
                  <Button variant="ghost" onClick={handleClear} className="h-10 cursor-pointer">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                )}
                <Button
                  variant="gradient"
                  onClick={handleRewrite}
                  isLoading={isLoading}
                  disabled={!inputText.trim() || isLoading}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 hover:shadow-rose-600/20 h-10 cursor-pointer"
                >
                  Rewrite Content
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Comparative Results Panel (5 cols on desktop) */}
        <div className="md:col-span-5">
          <Card variant="glass" className="p-6 h-full min-h-[380px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>Rewritten Result</span>
                </h2>
                {outputResult && (
                  <CopyButton text={outputResult} className="bg-slate-900 border-slate-800" label="Copy Text" />
                )}
              </div>

              {isLoading ? (
                <Loader message={`Transforming text to ${selectedTone}...`} className="py-20" />
              ) : outputResult ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-400 bg-pink-950/15 border border-pink-900/30 px-3 py-1.5 rounded-lg w-max uppercase tracking-wider">
                    <span>{tones.find(t => t.value === selectedTone)?.emoji}</span>
                    <span>{selectedTone} Version</span>
                  </div>
                  <div className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-4 border border-slate-900/60 rounded-xl whitespace-pre-line select-text font-sans">
                    {outputResult}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-2">
                  <RefreshCw className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                  <p className="text-sm">Rewriter display is empty</p>
                  <p className="text-xs max-w-xs">Write a brief draft and choose a tone to execute. Rewritten copy is perfect for pasting into Slack, Gmail, or emails.</p>
                </div>
              )}
            </div>

            {outputResult && (
              <div className="bg-slate-950/30 border border-slate-900/50 rounded-xl p-3 text-[10px] text-slate-500 mt-6 md:mt-12">
                <strong>💡 Quick Tip:</strong> Toggle other tones like "Friendly" or "Formal" and click 'Rewrite' to quickly compare styles side-by-side.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
