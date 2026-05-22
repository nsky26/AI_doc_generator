import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  autoResize = false,
  className = "",
  id,
  ...props
}) => {
  const textareaId = id || `textarea_${React.useId()}`;
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [props.value, autoResize]);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold text-slate-300 tracking-wide uppercase px-0.5">
          {label}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={textareaId}
        className={`w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none min-h-[120px] ${
          error ? "border-rose-500/85 focus:ring-rose-500/10 focus:border-rose-500/85" : ""
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-rose-400 px-1 mt-0.5">{error}</p>
      ) : null}
    </div>
  );
};
