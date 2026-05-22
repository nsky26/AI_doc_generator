import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  Mail,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { ToolHeader } from "../components/shared/ToolHeader";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { useAuth } from "../contexts/auth";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise((r) => setTimeout(r, 600));
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "??";

  const memberSince = new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const tools = ["Chat", "Utility", "Utility", "Media", "Career", "Document", "Design"];
  const toolLabels = [
    "AI Chat Assistant",
    "Summarizer",
    "Tone Converter",
    "Caption Writer",
    "Resume Booster",
    "Certificate Writer",
    "Theme Suggestion",
  ];

  return (
    <div id="profile-page-root" className="space-y-6 max-w-3xl mx-auto px-1 py-2">
      <ToolHeader
        title="Workspace Profile"
        description="View your account details, review your tool usage, and manage your session."
        icon={<User className="w-6 h-6 text-white" />}
        colorClass="from-violet-500 to-indigo-600"
      />

      {/* Identity Card */}
      <Card variant="glass" className="p-6 md:p-8 animate-[fadeIn_0.4s_ease-out_forwards]">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25 text-2xl font-black text-white">
              {initials}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <span className="sr-only">Online</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-xl font-bold text-slate-100">
              {user?.fullName || "User"}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user?.email || "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                Member since {memberSince}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Sparkles className="w-3 h-3" />
              All 7 Tools Active
            </span>
          </div>
        </div>
      </Card>

      {/* Tools Coverage Card */}
      <Card variant="glass" className="p-6 md:p-8 animate-[fadeIn_0.5s_ease-out_forwards]">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5">
          Tool Coverage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-[10px] font-black shrink-0">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tool}</p>
                <p className="text-sm text-slate-200 font-medium truncate">{toolLabels[idx]}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-5 border-t border-slate-900 pt-4">
          * All tools are powered by the Gemini 2.5-flash API.
        </p>
      </Card>

      {/* Logout */}
      <Card variant="glass" className="p-6 animate-[fadeIn_0.6s_ease-out_forwards]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Session</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign out to return to the welcome screen.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            isLoading={loggingOut}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="shrink-0 cursor-pointer"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
