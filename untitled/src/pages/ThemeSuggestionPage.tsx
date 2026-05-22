import React, { useState } from "react";
import { Palette, Copy, Sparkles, AlertTriangle, RefreshCw, Layers, Check, Type } from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Textarea } from "../components/shared/Textarea";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { generateThemeSuggestions } from "../services/gemini";
import { ThemeSuggestion } from "../types";
import { SAMPLE_THEMES } from "../utils/prompts";

export default function ThemeSuggestionPage() {
  const [projectDescription, setProjectDescription] = useState("");
  const [theme, setTheme] = useState<ThemeSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States to hold the active "applied" test theme
  const [appliedTheme, setAppliedTheme] = useState<ThemeSuggestion | null>(null);

  const handleGenerate = async () => {
    if (!projectDescription.trim()) {
      setError("Please describe your project first (e.g. coffee shop mobile app, cybersecurity analytics portal).");
      return;
    }

    setError(null);
    setIsLoading(true);
    setTheme(null);
    setAppliedTheme(null);

    try {
      const suggestedTheme = await generateThemeSuggestions(projectDescription);
      setTheme(suggestedTheme);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to generate theme schema. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (index: number) => {
    setProjectDescription(SAMPLE_THEMES[index]);
    setError(null);
  };

  const handleApplyTheme = () => {
    if (!theme) return;
    setAppliedTheme(theme);
  };

  const handleResetAppliedTheme = () => {
    setAppliedTheme(null);
  };

  const handleClear = () => {
    setProjectDescription("");
    setTheme(null);
    setAppliedTheme(null);
    setError(null);
  };

  return (
    <div id="theme-suggestion-page-root" className="space-y-6 max-w-5xl mx-auto px-1 py-2">
      <ToolHeader
        title="AI Theme Suggestion Tool"
        description="Describe your project and receive a complete UI theme with an accessible color palette, font pairings, and design tips — delivered as structured JSON."
        categoryBadge="Design"
        icon={<Palette className="w-6 h-6 text-white" />}
        colorClass="from-purple-500 to-indigo-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Project Concept Summary</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => loadSample(0)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Coffee
                </button>
                <button
                  onClick={() => loadSample(1)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  SaaS
                </button>
                <button
                  onClick={() => loadSample(2)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Playful
                </button>
              </div>
            </div>

            <Textarea
              id="theme-project-desc"
              placeholder="E.g. A gorgeous, modern task manager application with minimalist glass cards, custom focus modes, and beautiful ambient animations..."
              value={projectDescription}
              onChange={(e) => {
                setProjectDescription(e.target.value);
                if (error) setError(null);
              }}
              className="min-h-[145px] font-sans"
            />

            <div className="flex items-center justify-between gap-2.5 pt-1">
              <span className="text-[10px] text-slate-500">
                Returns strictly formed styling JSON.
              </span>
              
              <div className="flex gap-2 shrink-0">
                {projectDescription && (
                  <Button variant="ghost" onClick={handleClear} className="h-10 cursor-pointer">
                    Reset
                  </Button>
                )}
                <Button
                  variant="gradient"
                  onClick={handleGenerate}
                  isLoading={isLoading}
                  disabled={!projectDescription.trim() || isLoading}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-indigo-600/10 h-10 cursor-pointer font-semibold"
                >
                  Generate Schema
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

          {/* Applied Live Theme Real-Time Sandbox Preview Box */}
          {theme && (
            <Card variant="glass" className="p-6 space-y-4 border-violet-500/20 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span>Interactive Sandbox</span>
                </h3>
                {appliedTheme ? (
                  <button
                    onClick={handleResetAppliedTheme}
                    className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors py-0.5 px-2 rounded bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 cursor-pointer"
                  >
                    Reset Sandbox
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 italic">Static View</span>
                )}
              </div>

              {/* Sandbox Card Component */}
              <div
                className="p-5 border duration-300 rounded-2xl relative overflow-hidden transition-all text-left"
                style={{
                  background: appliedTheme ? appliedTheme.background : "rgba(15,23,42,0.6)",
                  borderColor: appliedTheme && appliedTheme.colors[0] ? appliedTheme.colors[0].hex : "rgba(51,65,85,0.4)",
                  fontFamily: appliedTheme && appliedTheme.fonts[1] ? `'${appliedTheme.fonts[1]}', sans-serif` : "inherit",
                }}
              >
                {/* Visual Glow */}
                <div 
                  className="absolute bottom-0 right-0 w-32 h-32 opacity-20 blur-[50px] rounded-full pointer-events-none"
                  style={{
                    backgroundColor: appliedTheme && appliedTheme.colors[1] ? appliedTheme.colors[1].hex : "rgba(139,92,246,0.3)"
                  }}
                />

                <div className="relative z-10 space-y-3">
                  <h4
                    className="text-base font-black tracking-tight"
                    style={{
                      fontFamily: appliedTheme && appliedTheme.fonts[0] ? `'${appliedTheme.fonts[0]}', sans-serif` : "inherit",
                      color: appliedTheme && appliedTheme.colors[0] ? appliedTheme.colors[0].hex : "#f8fafc"
                    }}
                  >
                    {appliedTheme ? "Glow Sandbox Active!" : "Preview Theme Card"}
                  </h4>
                  
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {appliedTheme 
                      ? "The dashboard sandbox component has been redrawn matching the AI suggestions. Background gradients, font references, and matching accent lines are loaded." 
                      : "Click 'Apply theme to Sandbox' on the right to load color codes and fonts dynamically in this workspace box."
                    }
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {(appliedTheme || theme).colors.map((c, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                        style={{
                          backgroundColor: `${c.hex}15`,
                          borderColor: `${c.hex}40`,
                          color: c.hex
                        }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Theme suggestions payload (7 cols) */}
        <div className="lg:col-span-7">
          <Card variant="glass" className="p-6 min-h-[380px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span>Palette Schema (JSON)</span>
                </h2>
                {theme && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      onClick={handleApplyTheme}
                      className="p-1 px-2.5 h-8 text-[11px] hover:bg-slate-800 border border-slate-850 text-purple-400 cursor-pointer"
                    >
                      <Layers className="w-3 h-3" />
                      Apply Theme to Sandbox
                    </Button>
                    <CopyButton text={JSON.stringify(theme, null, 2)} className="bg-slate-900 border-slate-800 h-8" label="Copy JSON" />
                  </div>
                )}
              </div>

              {isLoading ? (
                <Loader message="Synthesizing accessible visual templates..." className="py-24" />
              ) : theme ? (
                <div className="space-y-6 animate-fadeIn select-text text-sm">
                  
                  {/* Swatch visual line block */}
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Aesthetic Colors Palette</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {theme.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-950/40 border border-slate-900 shrink-0"
                        >
                          {/* Colored swatch rectangle */}
                          <div
                            className="w-full h-12 rounded-lg border border-white/5 shadow-inner shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-200 line-clamp-1">{color.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono tracking-wide">{color.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Font specification panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 border border-slate-900/80 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        <Type className="w-3.5 h-3.5" />
                        <span>Heading Font Pairing</span>
                      </div>
                      <p className="text-base font-black tracking-tight text-slate-200" style={{ fontFamily: `'${theme.fonts[0]}', sans-serif` }}>
                        {theme.fonts[0]}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-900/80 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        <Type className="w-3.5 h-3.5" />
                        <span>Body Font Pairing</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-normal" style={{ fontFamily: `'${theme.fonts[1]}', sans-serif` }}>
                        {theme.fonts[1]}
                      </p>
                    </div>
                  </div>

                  {/* Backdrop background gradients summary */}
                  <div className="bg-slate-950/40 border border-slate-900/80 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Canvas Canvas Suggestions</span>
                    <code className="text-xs text-purple-300 font-mono break-all leading-normal bg-slate-950/90 py-1.5 px-3 rounded-lg border border-slate-900 block select-all">
                      {theme.background}
                    </code>
                  </div>

                  {/* UI Layout integration tips */}
                  {theme.tips && (
                    <div className="space-y-2">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Design Integration Tips</span>
                      <ul className="space-y-2 text-xs text-slate-400 bg-slate-950/20 p-4 border border-slate-900 rounded-xl">
                        {theme.tips.map((tip, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-purple-400 flex items-start justify-center shrink-0 mt-0.5">•</span>
                            <span className="leading-normal">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-2">
                  <Palette className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                  <p className="text-sm">Theme output is empty</p>
                  <p className="text-xs max-w-xs">Introduce your project description and click Generate to see fully structured style palettes returned safely via the JSON models configuration.</p>
                </div>
              )}
            </div>

            {theme && (
              <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-4 mt-6">
                * Strict schema structure satisfies JSON API schema rules. Palette and gradients can be integrated directly into Tailwind styles.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
