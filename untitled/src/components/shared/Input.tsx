import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  className = "",
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || `input_${generatedId}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 tracking-wide uppercase px-0.5">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 ${
            leftIcon ? "pl-11" : ""
          } ${error ? "border-rose-500/80 focus:ring-rose-500/10 focus:border-rose-500/80" : ""} ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-400 px-1 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 px-1 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
