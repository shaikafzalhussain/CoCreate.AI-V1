import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  // Open routes only in the temporary Vite/Arena preview. Production builds always enforce auth.
  if (import.meta.env.DEV) return <>{children}</>;
  if (loading) return <div className="auth-loading"><span className="auth-spinner"/> Checking your session…</div>;
  if (!session) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
}
