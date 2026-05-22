import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/auth";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
