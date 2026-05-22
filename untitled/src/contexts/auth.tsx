import React, { createContext, useContext, useState, useCallback, useEffect, useId } from "react";
import { Navigate } from "react-router-dom";
import type { AuthState, AuthUser } from "../types";

const STORAGE_KEY = "ai_toolkit_auth_state";

const loadAuthState = (): AuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return { isAuthenticated: false, user: null };
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  requestId: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuthState);
  const requestId = useId();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const user: AuthUser = { email, fullName: email.split("@")[0] };
    setState({ isAuthenticated: true, user });
  }, []);

  const signup = useCallback(async (fullName: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const user: AuthUser = { email, fullName };
    setState({ isAuthenticated: true, user });
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, requestId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}

//
// Route guard — redirects unauthenticated visitors to /login
//
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

//
// Guest guard — redirects authenticated visitors to / (dashboard)
//
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
