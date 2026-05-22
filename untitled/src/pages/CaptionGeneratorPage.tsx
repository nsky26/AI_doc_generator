import React, { useState } from "react";
import { Hash, Copy, Sparkles, AlertTriangle, RefreshCw, Instagram, Linkedin, Globe } from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Input } from "../components/shared/Input";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { generateCaptions } from "../services/gemini";
import { CaptionsResponse } from "../types";
import { SAMPLE_TOPICS } from "../utils/prompts";

export default function CaptionGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [captions, setCaptions] = useState<CaptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please specify a topic or keyword to start with.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setCaptions(null);
    
    try {
      const results = await generateCaptions(topic);
      setCaptions(results);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to generate social captions. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTopic("");
    setCaptions(null);
    setError(null);
  };

  return (
    <div id="caption-generator-page" className="space-y-6 max-w-5xl mx-auto px-1 py-2">
      <ToolHeader
        title="AI Caption Generator"
        description="Supply a topic or project concept and generate social media captions optimized for LinkedIn, Instagram, and general audiences."
        categoryBadge="Media"
        icon={<Hash className="w-6 h-6 text-white" />}
        colorClass="from-amber-500 to-orange-600"
      />

      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Concept / Social Post Topic</span>
          <p className="text-xs text-slate-500">Provide themes, news milestones, project links, or accomplishments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="caption-topic-input"
            placeholder="E.g. Just completed a rigorous 4-day full stack AI development learning marathon..."
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <div className="flex gap-2 shrink-0">
            <Button
              variant="gradient"
              onClick={handleGenerate}
              isLoading={isLoading}
              disabled={!topic.trim() || isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-orange-500/10 cursor-pointer w-full sm:w-auto"
            >
              Generate
            </Button>
            {topic && (
              <Button variant="secondary" onClick={handleClear} className="p-3 cursor-pointer">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Topics Presets */}
         <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Try quick topic presets:</span>
          {SAMPLE_TOPICS.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(t);
                setError(null);
              }}
              className="text-[11px] bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-250 border border-slate-900 px-2.5 py-1 rounded transition-colors cursor-pointer text-left line-clamp-1 max-w-[240px]"
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Output Sections */}
      {isLoading ? (
        <Card variant="glass">
          <Loader message="Formulating creative captions..." className="py-24" />
        </Card>
      ) : captions ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Instagram Widget */}
          <Card variant="glass" className="p-5 flex flex-col justify-between border-slate-800/80 hover:border-pink-500/20 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-950/60">
                <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                  <Instagram className="w-4 h-4" />
                  Instagram Version
                </div>
                <CopyButton text={captions.instagram} className="bg-slate-900 hover:bg-slate-850" label="" />
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap selection:bg-pink-500/20 select-text bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                {captions.instagram}
              </div>
            </div>
          </Card>

          {/* LinkedIn Widget */}
          <Card variant="glass" className="p-5 flex flex-col justify-between border-slate-800/80 hover:border-blue-500/20 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-950/60">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Version
                </div>
                <CopyButton text={captions.linkedin} className="bg-slate-900 hover:bg-slate-850" label="" />
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-500/20 select-text bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                {captions.linkedin}
              </div>
            </div>
          </Card>

          {/* General Platform Widget */}
          <Card variant="glass" className="p-5 flex flex-col justify-between border-slate-800/80 hover:border-violet-500/20 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-950/60">
                <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                  <Globe className="w-4 h-4" />
                  General Version
                </div>
                <CopyButton text={captions.general} className="bg-slate-900 hover:bg-slate-850" label="" />
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap selection:bg-violet-500/20 select-text bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                {captions.general}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card variant="border" className="p-12 text-center text-slate-600 flex flex-col items-center justify-center space-y-2 border-dashed border-slate-800">
          <Hash className="w-8 h-8 stroke-[1.2] text-slate-700" />
          <p className="text-sm">Social outputs currently empty</p>
          <p className="text-xs max-w-xs text-slate-500">Generate some headlines to review copy specifically customized for social networks.</p>
        </Card>
      )}
    </div>
  );
}
