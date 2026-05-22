import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { AuthGuard, GuestGuard } from "../contexts/auth";
import { SpaceBackground } from "../components/shared/SpaceBackground";

// Pages
import Dashboard from "../pages/Dashboard";
import ChatbotPage from "../pages/ChatbotPage";
import SummarizerPage from "../pages/SummarizerPage";
import ToneConverterPage from "../pages/ToneConverterPage";
import CaptionGeneratorPage from "../pages/CaptionGeneratorPage";
import ResumeBoosterPage from "../pages/ResumeBoosterPage";
import CertificatePage from "../pages/CertificatePage";
import ThemeSuggestionPage from "../pages/ThemeSuggestionPage";
import DocumentGeneratorPage from "../pages/DocumentGeneratorPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ProfilePage from "../pages/ProfilePage";

// ── Auto-close sidebar on navigation ─────────────────────────────────────────
function RouteWatcher({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  useEffect(() => { onNavigate(); }, [location.pathname]);
  return null;
}

// ── Nebula colour blobs behind everything ─────────────────────────────────────
function NebulaBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="nebula-1 absolute -top-60 -left-60 w-[800px] h-[800px] rounded-full bg-violet-700/[0.13] blur-[180px]" />
      <div className="nebula-2 absolute top-1/2 -right-60 w-[700px] h-[700px] rounded-full bg-indigo-600/[0.10] blur-[160px]" />
      <div className="nebula-3 absolute -bottom-60 left-1/3 w-[700px] h-[700px] rounded-full bg-blue-800/[0.09] blur-[170px]" />
    </div>
  );
}

export const AppRoutes: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* Space canvas + nebula blobs — visible on every page */}
      <SpaceBackground />
      <NebulaBg />

      <div
        id="ai-app-layout-root"
        className="flex h-screen w-screen overflow-hidden font-sans text-slate-100 select-none"
        style={{ position: "relative", zIndex: 2 }}
      >
        <RouteWatcher onNavigate={() => setSidebarOpen(false)} />

        {/* ── Overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 animate-fadeIn"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar drawer ── */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <Navbar onMenuToggle={() => setSidebarOpen(v => !v)} />

          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <Routes>
              <Route path="/login"  element={<GuestGuard><LoginPage /></GuestGuard>} />
              <Route path="/signup" element={<GuestGuard><SignUpPage /></GuestGuard>} />

              <Route path="/"        element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/generate"  element={<AuthGuard><DocumentGeneratorPage /></AuthGuard>} />
              <Route path="/chatbot"   element={<AuthGuard><ChatbotPage /></AuthGuard>} />
              <Route path="/summarizer" element={<AuthGuard><SummarizerPage /></AuthGuard>} />
              <Route path="/tone-converter" element={<AuthGuard><ToneConverterPage /></AuthGuard>} />
              <Route path="/caption-generator" element={<AuthGuard><CaptionGeneratorPage /></AuthGuard>} />
              <Route path="/resume-booster" element={<AuthGuard><ResumeBoosterPage /></AuthGuard>} />
              <Route path="/certificate-generator" element={<AuthGuard><CertificatePage /></AuthGuard>} />
              <Route path="/theme-suggestions" element={<AuthGuard><ThemeSuggestionPage /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
              <Route path="*" element={<AuthGuard><Navigate to="/" replace /></AuthGuard>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};
