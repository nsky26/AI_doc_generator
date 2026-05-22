import React, { useId } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "border";
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  hoverable = false,
  className = "",
  id,
  ...props
}) => {
  const generatedId = useId();
  const cardId = id || `card_${generatedId}`;

  const baseStyle = "rounded-2xl border transition-all duration-300 overflow-hidden";
  
  const variants = {
    default: "bg-slate-900/80 border-slate-800 text-slate-100",
    glass: "backdrop-blur-md bg-slate-900/50 border-slate-800/60 shadow-xl shadow-black/10 text-slate-100",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/80 text-slate-100",
    border: "bg-transparent border-slate-700/60 text-slate-100",
  };

  const hoverStyle = hoverable
    ? "hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-950/10 hover:bg-slate-900/90"
    : "";

  return (
    <div
      id={cardId}
      className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
