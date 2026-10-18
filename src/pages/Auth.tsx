import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Mail, Sparkles, UserRound } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import "@/styles/auth.css";

type AuthMode = "signin" | "signup";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => searchParams.get("mode") === "signin" ? "signin" : "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const { session, loading, configured } = useAuth();
  const navigate = useNavigate();
  const requestedNext = searchParams.get("next") || "/workspace";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/workspace";

  useEffect(() => { if (!loading && session) navigate(next, { replace: true }); }, [loading, session, next, navigate]);

  const switchMode = (newMode: AuthMode) => { setMode(newMode); setFeedback(null); };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!supabase) return;

    setBusy(true);
    try {
      const emailRedirectTo = `${window.location.origin}/auth?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: mode === "signup"
          ? { shouldCreateUser: true, data: { full_name: name.trim() }, emailRedirectTo }
          : { shouldCreateUser: false, emailRedirectTo },
      });
      if (error) throw error;
      setFeedback({
        type: "success",
        text: mode === "signup"
          ? "Check your email for a secure link to confirm your address and open your workspace."
          : "If an account exists for that email, a secure sign-in link is on its way.",
      });
    } catch (error) {
      setFeedback({ type: "error", text: error instanceof Error ? error.message : "We couldn’t send that email. Please try again." });
    } finally { setBusy(false); }
  };

  return <main className="auth-page"><VideoBackground isLanding/><div className="auth-backdrop"/>
    <header className="auth-header"><Link to="/" className="auth-brand"><span className="auth-brand-icon"><img src="/cocreate-icon.png" alt=""/></span><span><strong>CoCreate<span>.AI</span></strong><small>YOUR CREATIVE SPACE</small></span></Link><Link to="/" className="auth-home-link"><ArrowLeft size={14}/> Back home</Link></header>
    <div className="auth-layout"><section className="auth-story"><div className="auth-story-kicker"><Sparkles size={14}/> A SPACE FOR YOUR IDEAS</div><h1>Good ideas grow<br/>when you <em>show up.</em></h1><p>Sign in to open your workspace and make room for what comes next.</p><div className="auth-promise"><span><Check size={14}/></span> Only signed-in users can open your workspace.</div></section>
      <section className="auth-card" aria-labelledby="auth-title">
        {!configured ? <div className="auth-config"><div className="auth-card-icon"><Mail size={19}/></div><h2 id="auth-title">Email sign-in needs setup</h2><p>Connect Supabase Auth to enable email confirmation and sign-in links. Set these public project values in your environment:</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_PUBLISHABLE_KEY</code><small>Enable Email authentication and configure SMTP in your Supabase project.</small></div> : <>
          <div className="auth-card-top"><div><span className="auth-card-label">YOUR CREATIVE SPACE</span><h2 id="auth-title">{mode === "signup" ? "Create your account" : "Welcome back"}</h2><p>{mode === "signup" ? "A few details, then check your inbox." : "We’ll email you a secure sign-in link."}</p></div><div className="auth-card-icon"><Mail size={18}/></div></div>
          <div className="auth-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Create account</button><button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>Sign in</button></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && <label className="auth-field"><span>Your name</span><div className="auth-input-wrap"><UserRound size={16}/><input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we call you?" required maxLength={80}/></div></label>}
            <label className="auth-field"><span>Email address</span><div className="auth-input-wrap"><Mail size={16}/><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
            <p className="auth-email-note">No password or security PIN needed. We’ll email you a secure link to confirm your address and sign in.</p>
            {feedback && <div className={`auth-feedback ${feedback.type}`} role="status">{feedback.text}</div>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Sending…" : mode === "signup" ? "Create account by email" : "Email me a sign-in link"}<ArrowRight size={16}/></button>
          </form>
          <p className="auth-privacy">By continuing, you agree to use CoCreate responsibly. Your AI messages are sent to an AI provider to generate responses.</p>
        </>}
      </section>
    </div>
    <footer className="auth-footer"><span>Human + AI, creating together.</span><span>© CoCreate.AI</span></footer>
  </main>;
}
