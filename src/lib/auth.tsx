import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/lib/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) setSession(currentSession);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const value = useMemo(() => ({ session, loading, configured: Boolean(supabase) }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
