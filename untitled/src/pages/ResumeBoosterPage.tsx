import React, { useState } from "react";
import { Briefcase, Copy, RefreshCw, Sparkles, Check, AlertCircle, ChevronRight } from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Textarea } from "../components/shared/Textarea";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { boostResume } from "../services/gemini";
import { ResumeImprovement } from "../types";
import { SAMPLE_RESUME_BULLETS } from "../utils/prompts";

export default function ResumeBoosterPage() {
  const [bulletText, setBulletText] = useState("");
  const [improvement, setImprovement] = useState<ResumeImprovement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!bulletText.trim()) {
      setError("Please paste a job responsibility bullet point first.");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const results = await boostResume(bulletText);
      setImprovement(results);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to optimize resume bullet. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (index: number) => {
    setBulletText(SAMPLE_RESUME_BULLETS[index]);
    setError(null);
  };

  const handleClear = () => {
    setBulletText("");
    setImprovement(null);
    setError(null);
  };

  return (
    <div id="resume-booster-page" className="space-y-6 max-w-5xl mx-auto px-1 py-2">
      <ToolHeader
        title="AI Resume Booster"
        description="Transform flat job descriptions into metrics-driven, active-verb achievement bullets that stand out to recruiters and hiring managers."
        categoryBadge="Career"
        icon={<Briefcase className="w-6 h-6 text-white" />}
        colorClass="from-emerald-500 to-teal-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Form Entry */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dry Job Bullet Point</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadSample(0)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Sample 1
              </button>
              <button
                onClick={() => loadSample(1)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Sample 2
              </button>
            </div>
          </div>

          <Textarea
            id="resume-booster-input"
            placeholder="E.g. I worked on a React project and solved JavaScript syntax errors..."
            value={bulletText}
            onChange={(e) => {
              setBulletText(e.target.value);
              if (error) setError(null);
            }}
            className="min-h-[140px] font-sans"
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[10px] text-slate-500">
              * Recommended: Include active verbs (led, engineered, reduced, compiled).
            </div>
            
            <div className="flex gap-2">
              {bulletText && (
                <Button variant="ghost" onClick={handleClear} className="h-10 cursor-pointer">
                  Reset
                </Button>
              )}
              <Button
                variant="gradient"
                onClick={handleImprove}
                isLoading={isLoading}
                disabled={!bulletText.trim() || isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-555 shadow-emerald-500/10 h-10 cursor-pointer"
              >
                Boost Bullet
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </Card>

        {/* Right Column: Comparison Result Layout */}
        <Card variant="glass" className="p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Optimized Resume Metrics</span>
              </h2>
              {improvement && (
                <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleImprove} className="p-1 px-2.5 h-8 text-[11px] hover:bg-slate-800 border border-slate-850" leftIcon={<RefreshCw className="w-3 h-3" />}>
                  </Button>
                  <CopyButton text={improvement.after} className="bg-slate-900 border-slate-800 h-8" label="Copy Result" />
                </div>
              )}
            </div>

            {isLoading ? (
              <Loader message="Engineering metrics and keywords..." className="py-20" />
            ) : improvement ? (
              <div className="space-y-4 animate-fadeIn select-text text-sm">
                
                {/* Before and After Comparatives Box */}
                <div className="space-y-3">
                  <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl space-y-1 opacity-60">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Before Enhancement</span>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{improvement.before}</p>
                  </div>

                  <div className="relative flex justify-center py-0.5 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                      <ChevronRight className="w-4 h-4 transform rotate-90 lg:rotate-0" />
                    </div>
                  </div>

                  <div className="bg-emerald-950/10 p-4 border border-emerald-900/40 rounded-xl space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Boosted Achievement Bullet</span>
                    <p className="text-sm text-slate-100 font-sans font-medium leading-relaxed">{improvement.after}</p>
                  </div>
                </div>

                {/* Explanation logic bubble */}
                <div className="bg-slate-950/20 border border-slate-900 rounded-xl p-4 space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enhancement Details</span>
                  <p className="text-xs text-slate-400 leading-normal font-sans">{improvement.explanation}</p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-2">
                <Briefcase className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                <p className="text-sm">Booster output is empty</p>
                <p className="text-xs max-w-xs">Introduce your current resume points to view. Ideal for preparing applications for competitive FAANG or tech interviews.</p>
              </div>
            )}
          </div>

          {improvement && (
            <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-4 mt-6">
              * Enhanced layout optimizes text based on active achievements. Ready to add to LinkedIn or PDF resumes.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
