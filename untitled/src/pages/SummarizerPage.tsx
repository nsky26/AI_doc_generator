import React, { useState } from "react";
import { FileText, Copy, RotateCcw, AlertTriangle, Check, Sparkles } from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Textarea } from "../components/shared/Textarea";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { summarizeText } from "../services/gemini";
import { SAMPLE_SUMMARIES } from "../utils/prompts";

export default function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [outputSummary, setOutputSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError("Please paste or type or run a sample text first.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const summaryResult = await summarizeText(inputText);
      setOutputSummary(summaryResult);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to generate summary. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (index: number) => {
    setInputText(SAMPLE_SUMMARIES[index]);
    setError(null);
  };

  const handleClear = () => {
    setInputText("");
    setOutputSummary("");
    setError(null);
  };

  return (
    <div id="summarizer-page" className="space-y-6 max-w-5xl mx-auto px-1 py-2">
      <ToolHeader
        title="AI Text Summarizer"
        description="Condense heavy documents, articles, or notes into exactly 3-5 concise bullet points in seconds."
        categoryBadge="Utility"
        icon={<FileText className="w-6 h-6 text-white" />}
        colorClass="from-violet-500 to-fuchsia-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Input Panel */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Source Text Document</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadSample(0)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Sample 1
              </button>
              <button
                type="button"
                onClick={() => loadSample(1)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Sample 2
              </button>
            </div>
          </div>

          <Textarea
            id="summarizer-source"
            placeholder="Paste your long essays, transcripts, or articles here (minimum 50 words recommended)..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
            className="min-h-[250px] font-sans h-auto"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 font-mono">
              Characters: {inputText.length} | Words: {inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length}
            </div>
            
            <div className="flex items-center gap-2.5">
              {inputText && (
                <Button variant="ghost" onClick={handleClear} className="h-10 cursor-pointer">
                  <RotateCcw className="w-4 h-4" />
                  Clear Current
                </Button>
              )}
              <Button
                variant="gradient"
                onClick={handleSummarize}
                isLoading={isLoading}
                disabled={!inputText.trim() || isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="h-10 cursor-pointer"
              >
                Summarize
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </Card>

        {/* Right Column: Summarized Output Panel */}
        <Card variant="glass" className="p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Summary Bullet Points</span>
              </h2>
              {outputSummary && (
                <CopyButton text={outputSummary} className="bg-slate-900 border-slate-800" label="Copy Summary" />
              )}
            </div>

            {isLoading ? (
              <Loader message="Synthesizing bullet points..." className="py-20" />
            ) : outputSummary ? (
              <div className="space-y-4 animate-fadeIn text-slate-200 text-sm leading-relaxed whitespace-pre-line select-text font-sans bg-slate-950/40 rounded-xl p-4 border border-slate-900/60">
                {outputSummary}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-2">
                <FileText className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                <p className="text-sm">Summary display is empty</p>
                <p className="text-xs max-w-xs">Introduce custom text or select a trial sample above, then press 'Summarize' to view.</p>
              </div>
            )}
          </div>

          {outputSummary && (
            <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-4 mt-6">
              * Structured using a 3-5 high-impact point formula as instructed. Ideal for rapid briefings or status reports.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
