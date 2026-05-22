import React, { useState, useId } from "react";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "../../utils/copy";

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = "",
  label,
}) => {
  const generatedId = useId();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      id={`copy_btn_${generatedId}`}
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700/50 disabled:opacity-40 disabled:pointer-events-none"
      } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {label ? <span>{copied ? "Copied!" : label}</span> : <span>{copied ? "Copied" : "Copy"}</span>}
    </button>
  );
};
