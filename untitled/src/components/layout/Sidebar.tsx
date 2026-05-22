import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, RefreshCw,
  Hash, Briefcase, Award, Palette, Sparkles, X, User,
} from "lucide-react";
import { useAuth } from "../../contexts/auth";

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { name: "Dashboard",          path: "/",                      icon: LayoutDashboard, badge: "Home"     },
  { name: "AI Chatbot",         path: "/chatbot",               icon: MessageSquare,   badge: "Chat"     },
  { name: "Text Summarizer",    path: "/summarizer",            icon: FileText,        badge: "Utility"  },
  { name: "Tone Converter",     path: "/tone-converter",        icon: RefreshCw,       badge: "Utility"  },
  { name: "Caption Generator",  path: "/caption-generator",     icon: Hash,            badge: "Media"    },
  { name: "Resume Booster",     path: "/resume-booster",        icon: Briefcase,       badge: "Career"   },
  { name: "Certificate Writer", path: "/certificate-generator", icon: Award,           badge: "Document" },
  { name: "Theme Suggestion",   path: "/theme-suggestions",     icon: Palette,         badge: "Design"   },
  { name: "Profile",            path: "/profile",               icon: User,            badge: "Account"  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className="w-64 h-full flex flex-col text-slate-100 shrink-0"
      style={{
        background: "rgba(5,7,20,0.97)",
        borderRight: "1px solid rgba(139,92,246,0.15)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}
      >
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-black tracking-tight bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent leading-none">
              AI DOC SUITE
            </p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">Powered by Gemini</p>
          </div>
        </Link>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[9px] font-bold text-slate-600 tracking-widest uppercase mb-2">
          Workspace
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "text-violet-200"
                  : "text-slate-500 hover:text-slate-100"
              }`}
              style={
                isActive
                  ? { background: "rgba(139,92,246,0.15)", borderLeft: "2px solid rgba(139,92,246,0.7)" }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-slate-600 group-hover:text-slate-300"} transition-colors`} />
                <span className="text-[13px]">{item.name}</span>
              </div>
              <span
                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                  isActive ? "text-violet-300" : "text-slate-600"
                }`}
                style={
                  isActive
                    ? { background: "rgba(139,92,246,0.15)" }
                    : { background: "rgba(255,255,255,0.03)" }
                }
              >
                {item.badge}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <Link
        to="/profile"
        onClick={onClose}
        className="p-4 flex items-center gap-3 cursor-pointer group transition-all"
        style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 group-hover:scale-105 transition-transform">
          {user?.fullName
            ? user.fullName.split(" ").map(w => w[0]).join("").toUpperCase()
            : "?"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-300 group-hover:text-violet-300 transition-colors truncate">
            {user?.fullName || "User"}
          </p>
          <p className="text-[10px] text-slate-600 truncate">{user?.email || ""}</p>
        </div>
      </Link>
    </aside>
  );
};
