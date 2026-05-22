import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ToolHeaderProps {
  title: string;
  description: string;
  categoryBadge?: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  title,
  description,
  categoryBadge,
  icon,
  colorClass = "from-violet-500 to-indigo-500",
}) => {
  return (
    <div id={`tool-header-${title.toLowerCase().replace(/\s+/g, '-')}`} className="relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 md:p-8 mb-6">
      {/* Background radial gradient to look beautiful */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${colorClass} opacity-10 blur-[80px] pointer-events-none rounded-full`} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          {icon && (
            <div className={`hidden sm:flex items-center justify-center p-3.5 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
              {icon}
            </div>
          )}
          
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Link
                to="/"
                className="flex items-center text-xs text-slate-400 hover:text-slate-100 transition-colors mr-2 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-0.5 group-hover:-translate-x-0.5 transition-transform" />
                Workspace Dashboard
              </Link>
              
              {categoryBadge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {categoryBadge}
                </span>
              )}
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
