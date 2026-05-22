import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  message = "Generating AI insights...",
  className = "",
}) => {
  return (
    <div id="ai_loader_container" className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="relative flex items-center justify-center mb-4">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-violet-600/25 blur-xl rounded-full w-12 h-12 animate-pulse"></div>
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 relative z-10" />
      </div>
      
      <p className="text-sm font-medium text-slate-300 animate-pulse tracking-wide">
        {message}
      </p>
      
      <p className="text-xs text-slate-500 mt-1 max-w-xs">
        Gemini is drafting polished content. This takes just a moment.
      </p>
    </div>
  );
};
