import React, { useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";
import { useAuth } from "../contexts/auth";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fullNameId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signup(fullName, email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s += 1;
    if (password.length >= 10) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return Math.min(s, 4);
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor =
    pwStrength <= 1 ? "bg-rose-500"
    : pwStrength === 2 ? "bg-amber-500"
    : pwStrength === 3 ? "bg-emerald-500"
    : "bg-violet-500";

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-slate-950 overflow-hidden relative">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] animate-[fadeIn_2s_ease-out_forwards]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-[fadeIn_2.4s_ease-out_forwards]" />
      </div>

      {/* Signup Card — slides up onto stage */}
      <div
        id="auth-signup-card"
        className="relative z-10 w-full max-w-md mx-4 animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.30,1)_forwards]"
      >
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30 mb-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Join the AI Document Generator workspace and start building today.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-[fadeIn_0.3s_forwards]"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor={fullNameId} className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                Full Name
              </label>
              <input
                id={fullNameId}
                type="text"
                placeholder="Your Full Name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (error) setError(null); }}
                disabled={isLoading}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                disabled={isLoading}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                  disabled={isLoading}
                  className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-0 p-0"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1 animate-[fadeIn_0.2s_forwards]">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${(pwStrength / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{strengthLabel} password</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-confirm-pw" className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-pw"
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); if (error) setError(null); }}
                  disabled={isLoading}
                  className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-0 p-0"
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {confirmPw && password === confirmPw && (
                  <div className="absolute right-11 top-1/2 -translate-y-1/2 text-emerald-400 animate-[fadeIn_0.2s_forwards]">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl py-3 shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <p className="text-center text-xs text-slate-500 pt-1">
            Already have an account?&nbsp;
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
