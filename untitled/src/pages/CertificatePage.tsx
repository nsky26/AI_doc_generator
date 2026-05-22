import React, { useState } from "react";
import { Award, Copy, Download, RefreshCw, Sparkles, Check, Info } from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { Input } from "../components/shared/Input";
import { Loader } from "../components/shared/Loader";
import { CopyButton } from "../components/shared/CopyButton";
import { generateCertificateContent } from "../services/gemini";
import { downloadTextFile } from "../utils/helpers";
import { SAMPLE_CERTIFICATES } from "../utils/prompts";

export default function CertificatePage() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!name.trim() || !course.trim() || !duration.trim()) {
      setError("Please fill out Name, Course/Role, and Duration first.");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const citationText = await generateCertificateContent(name, course, duration);
      setGeneratedText(citationText);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to generate certificate text. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (index: number) => {
    const sample = SAMPLE_CERTIFICATES[index];
    setName(sample.recipientName);
    setCourse(sample.courseTitle);
    setDuration(sample.duration);
    setError(null);
  };

  const handleDownload = () => {
    if (!generatedText) return;
    const cleanFilename = `${name.toLowerCase().replace(/\s+/g, "-")}-certificate-citation.txt`;
    
    const formattedFileContent = `========================================================
CERTIFICATE OF COMPLETION ACTION CITATION
========================================================

Recipient Name: ${name}
Course/Role:    ${course}
Duration:       ${duration}

--------------------------------------------------------
OFFICIAL CITATION STATEMENT:
--------------------------------------------------------
${generatedText}

--------------------------------------------------------
    Drafted via AI Document Generator Suite
    Date: ${new Date().toLocaleDateString()}
========================================================`;

    downloadTextFile(formattedFileContent, cleanFilename);
  };

  const handleClear = () => {
    setName("");
    setCourse("");
    setDuration("");
    setGeneratedText("");
    setError(null);
  };

  return (
    <div id="certificate-generator-page" className="space-y-6 max-w-5xl mx-auto px-1 py-2">
      <ToolHeader
        title="Certificate Content Writer"
        description="Generate formal, professional award citations and completion paragraphs in the exact wording required for corporate and educational certificate ceremonies."
        categoryBadge="Document"
        icon={<Award className="w-6 h-6 text-white" />}
        colorClass="from-amber-500 to-yellow-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Form Settings Panel */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Award Metadata Details</span>
            <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => loadSample(0)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Demo 1
                </button>
                <button
                  type="button"
                  onClick={() => loadSample(1)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Demo 2
                </button>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              id="cert-name-input"
              label="Recipient Full Name"
              placeholder="E.g. J. Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />

            <Input
              id="cert-course-input"
              label="Course / Role / Recognition Title"
              placeholder="E.g. Full-Stack Development Bootcamp"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />

            <Input
              id="cert-duration-input"
              label="Duration / Terms"
              placeholder="E.g. 4 Days (May 2026) or 100 Hours"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900/40">
            {(name || course || duration) && (
              <Button variant="ghost" onClick={handleClear} className="h-10 cursor-pointer">
                Reset
              </Button>
            )}
            <Button
              variant="gradient"
              onClick={handleGenerate}
              isLoading={isLoading}
              disabled={!name.trim() || !course.trim() || !duration.trim() || isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 hover:shadow-yellow-500/10 h-10 cursor-pointer font-bold"
            >
              Write Paragraph
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </Card>

        {/* Right Preview Certificate Display Panel */}
        <Card variant="glass" className="p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Certificate Styled Preview</span>
              </h2>
              {generatedText && (
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" onClick={handleDownload} className="p-1 px-2.5 h-8 text-[11px] hover:bg-slate-800 border border-slate-850 text-amber-400 cursor-pointer">
                    <Download className="w-3 h-3" />
                    TXT
                  </Button>
                  <CopyButton text={generatedText} className="bg-slate-900 border-slate-800 h-8" label="Copy Text" />
                </div>
              )}
            </div>

            {isLoading ? (
              <Loader message="Formulating certificate vocabulary..." className="py-20" />
            ) : generatedText ? (
              <div className="animate-fadeIn space-y-4">
                
                {/* Simulated Premium Border Frame Box to look like a physical Certificate paper */}
                <div className="relative border-4 border-double border-amber-500/35 bg-slate-950/75 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                  {/* Watermark Logo Seal representation in background */}
                  <div className="absolute opacity-[0.02] text-amber-500 transform pointer-events-none select-none">
                    <Award className="w-48 h-48" />
                  </div>

                  <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest border-b border-amber-500/20 pb-1">
                    Award Citation of Completion
                  </span>
                  
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider">This citation officially certifies</p>
                    <p className="text-lg font-black text-slate-100 tracking-tight">{name}</p>
                  </div>

                  <p className="text-[12px] text-slate-300 italic max-w-md font-sans leading-relaxed selection:bg-amber-500/10 select-text relative z-10">
                    "{generatedText}"
                  </p>

                  <div className="grid grid-cols-2 gap-8 pt-4 w-full text-[10px] text-slate-500 border-t border-slate-900">
                    <div>
                      <p className="font-semibold text-slate-400 border-b border-slate-800/80 pb-0.5 mx-4">{course}</p>
                      <p className="text-[9px] mt-0.5 uppercase tracking-wide">Milestone Study</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400 border-b border-slate-800/80 pb-0.5 mx-4">{duration}</p>
                      <p className="text-[9px] mt-0.5 uppercase tracking-wide">Tenure Held</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-2">
                <Award className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                <p className="text-sm">Certificate displays is empty</p>
                <p className="text-xs max-w-xs">Fill recipient parameters and press 'Write Paragraph' to view. Citation content conforms fully to educational ceremony standards.</p>
              </div>
            )}
          </div>

          {generatedText && (
            <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-4 mt-6">
              * Official layout styling contains standard parameters. Click on the 'TXT' button to download a customized citation certificate note.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
