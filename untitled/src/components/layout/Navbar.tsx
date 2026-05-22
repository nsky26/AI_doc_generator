import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Sparkles, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/auth";

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(w => w[0]).join("").toUpperCase()
    : "?";

  return (
    <header
      className="h-14 flex items-center justify-between px-5 z-20 shrink-0 sticky top-0"
      style={{
        background: "rgba(3,5,15,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
      }}
    >
      {/* Left — hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-wide bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent hidden sm:block">
            AI Document Suite
          </span>
        </div>
      </div>

      {/* Right — user menu */}
      {isAuthenticated && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(139,92,246,0.2)" }}
            aria-expanded={dropdownOpen}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
              {initials}
            </div>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline max-w-[140px] truncate">
              {user?.fullName || "User"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 hidden sm:inline ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
              style={{ background: "rgba(8,10,25,0.95)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(20px)" }}
            >
              <div className="p-3 space-y-0.5" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
                <p className="text-xs font-bold text-slate-100 truncate">{user?.fullName || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || ""}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
