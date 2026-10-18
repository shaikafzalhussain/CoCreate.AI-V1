import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { ArrowDown, ArrowUp, Check, Clipboard, Command, Compass, Menu, MessageSquare, LogOut, Plus, Sparkles, WandSparkles, X } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";
import "@/styles/v2.css";

type Message = { role: "user" | "assistant"; content: string; reasoningTokens?: number };
type Session = { id: string; title: string; updated: number; messages: Message[] };
const STORAGE_KEY = "cocreate-v2-sessions";
const initialSessions = (userId: string | undefined): Session[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${userId || "guest"}`) || "[]");
    return Array.isArray(saved) ? saved.map(({ id, title, updated, messages }) => ({ id, title, updated, messages })) : [];
  } catch { return []; }
};

async function readOpenRouterStream(response: Response, onUpdate?: (text: string, reasoningTokens?: number) => void) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorBody: { message?: unknown; error?: unknown } = {};
    try { errorBody = JSON.parse(errorText); } catch { /* non-JSON proxy error */ }
    const nestedError = typeof errorBody.error === "object" && errorBody.error !== null && "message" in errorBody.error ? String((errorBody.error as { message?: unknown }).message || "") : "";
    const detail = typeof errorBody.message === "string" ? errorBody.message : typeof errorBody.error === "string" ? errorBody.error : nestedError;
    throw new Error(detail || `AI endpoint returned HTTP ${response.status}. Check the server function and API key settings.`);
  }
  if (!response.headers.get("content-type")?.includes("text/event-stream")) {
    throw new Error("The OpenRouter streaming endpoint is not running in this local preview. Configure the server-side API route to enable responses.");
  }
  if (!response.body) throw new Error("This browser does not support streamed responses.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let reasoningTokens: number | undefined;
  const consumeEvent = (event: string) => {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
    if (!data || data === "[DONE]") return;
    const chunk = JSON.parse(data) as { error?: { message?: string }; choices?: { delta?: { content?: string } }[]; usage?: { completionTokensDetails?: { reasoningTokens?: number } } };
    if (chunk.error) throw new Error(chunk.error.message || "The model could not complete this request.");
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) answer += content;
    const tokenCount = chunk.usage?.completionTokensDetails?.reasoningTokens;
    if (typeof tokenCount === "number") reasoningTokens = tokenCount;
    if (content || typeof tokenCount === "number") onUpdate?.(answer, reasoningTokens);
  };
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";
    for (const event of events) consumeEvent(event);
    if (done) break;
  }
  if (buffer.trim()) consumeEvent(buffer);
  if (!answer) throw new Error("The AI returned an empty response. Please try again.");
  return { answer, reasoningTokens };
}

export default function V2() {
  const { session } = useAuth();
  const historyStorageKey = `${STORAGE_KEY}:${session?.user.id || "guest"}`;
  const [sessions, setSessions] = useState<Session[]>(() => initialSessions(session?.user.id));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const active = sessions.find((s) => s.id === activeId) ?? null;
  useEffect(() => { localStorage.setItem(historyStorageKey, JSON.stringify(sessions)); }, [sessions, historyStorageKey]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 6000); return () => clearTimeout(timer); }, [notice]);

  const updateSession = (id: string, fn: (session: Session) => Session) => setSessions((all) => all.map((s) => s.id === id ? fn(s) : s));
  const newSession = () => { setActiveId(null); setDraft(""); setSidebarOpen(false); };
  const signOut = async () => {
    const { error } = await supabase!.auth.signOut();
    if (error) setNotice(error.message);
    else navigate("/", { replace: true });
  };
  const send = async (text = draft) => {
    const content = text.trim();
    if (!content || busy) return;
    setDraft(""); setBusy(true); setNotice("");
    let id = activeId;
    const previousMessages = active?.messages ?? [];
    if (!id) {
      id = crypto.randomUUID();
      const session: Session = { id, title: content.slice(0, 42), updated: Date.now(), messages: [] };
      setActiveId(id); setSessions((all) => [session, ...all]);
    }
    const outgoing: Message[] = [...previousMessages, { role: "user", content }];
    updateSession(id, (s) => ({ ...s, messages: outgoing, updated: Date.now() }));
    try {
      const response = await fetch("/api/openrouter", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` }, body: JSON.stringify({ purpose: "chat", messages: [{ role: "system", content: "You are CoCreate, a helpful, thoughtful general-purpose AI assistant. Be clear, accurate, and direct. Adapt to what the user needs, ask a clarifying question when useful, and structure longer answers for readability." }, ...outgoing.map((m) => ({ role: m.role, content: m.content }))], temperature: 0.7, max_tokens: 1200, stream: true }) });
      const { answer, reasoningTokens } = await readOpenRouterStream(response, (partial, tokens) => updateSession(id, (s) => ({ ...s, messages: [...outgoing, { role: "assistant", content: partial, reasoningTokens: tokens }], updated: Date.now() })));
      updateSession(id, (s) => ({ ...s, messages: [...outgoing, { role: "assistant", content: answer, reasoningTokens }], updated: Date.now() }));
    } catch (error) {
      updateSession(id, (s) => ({ ...s, messages: previousMessages, updated: Date.now() }));
      setDraft(content);
      setNotice(error instanceof Error && error.message.includes("Failed to fetch") ? "AI isn’t connected yet. Add OPENROUTER_API_KEY to the server environment to enable responses." : error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  };
  const refinePrompt = async () => {
    const content = draft.trim();
    if (!content || busy) return;
    setBusy(true); setIsRefining(true); setNotice("");
    try {
      const response = await fetch("/api/openrouter", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` }, body: JSON.stringify({ purpose: "refine", messages: [{ role: "system", content: "Improve the user's rough prompt so it is clear, specific, and useful. Preserve the original intent and voice. Return only the revised prompt, without quotes or commentary." }, { role: "user", content }], temperature: 0.4, max_tokens: 800, stream: true }) });
      const { answer } = await readOpenRouterStream(response);
      setDraft(answer.trim());
      setNotice("Prompt refined. Review or edit it, then click ↑ to send.");
    } catch (error) {
      setNotice(error instanceof Error && error.message.includes("Failed to fetch") ? "Prompt refinement is not connected. Configure OPENROUTER_REFINE_API_KEY on the server." : error instanceof Error ? error.message : "Could not refine the prompt. Please try again.");
    } finally { setIsRefining(false); setBusy(false); }
  };
  const removeSession = (id: string) => { setSessions((all) => all.filter((s) => s.id !== id)); if (activeId === id) setActiveId(null); };
  const grouped = useMemo(() => { const now = new Date(); const today = sessions.filter((s) => new Date(s.updated).toDateString() === now.toDateString()); const older = sessions.filter((s) => new Date(s.updated).toDateString() !== now.toDateString()); return [{ label: "Today", items: today }, { label: "Earlier", items: older }].filter((g) => g.items.length); }, [sessions]);

  return <main className="v2-shell"><VideoBackground isLanding /> <div className="v2-shade" />
    <aside className={`v2-sidebar ${sidebarOpen ? "is-open" : ""}`}>
      <div className="v2-brand"><Link className="v2-brand-home" to="/" aria-label="CoCreate.AI home"><span className="v2-mark"><img src="/cocreate-icon.png" alt="" /></span><span><strong>CoCreate<span>.AI</span></strong><small>YOUR CREATIVE SPACE</small></span></Link><button className="v2-icon-button sidebar-close" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <button className="v2-new-chat" onClick={newSession}><Plus size={17}/> New chat <span>⌘ K</span></button>
      <div className="v2-side-label">RECENT CHATS</div>
      <nav className="v2-history">{grouped.length ? grouped.map((group) => <section key={group.label}><div className="v2-side-label v2-group-label">{group.label}</div>{group.items.map((s) => <div className={`v2-history-item ${s.id === activeId ? "active" : ""}`} key={s.id}><button onClick={() => { setActiveId(s.id); setSidebarOpen(false); }}><MessageSquare size={15}/><span>{s.title}</span></button><button className="v2-delete" aria-label={`Delete ${s.title}`} onClick={() => removeSession(s.id)}><X size={14}/></button></div>)}</section>) : <p className="v2-empty-history">Your conversations will appear here.</p>}</nav>
      <div className="v2-side-bottom"><Link to="/" className="v2-back-link"><Compass size={16}/> CoCreate home</Link>{session ? <div className="v2-profile"><div className="v2-avatar">{(session.user.user_metadata?.full_name || session.user.email || "C").slice(0, 1).toUpperCase()}</div><div><strong>{session.user.user_metadata?.full_name || session.user.email || "Your workspace"}</strong><small>Signed in</small></div><button className="v2-icon-button" title="Sign out" aria-label="Sign out" onClick={() => void signOut()}><LogOut size={16}/></button></div> : <div className="v2-profile"><div className="v2-avatar">C</div><div><strong>Preview access</strong><small>Sign-in enabled after Vercel</small></div></div>}</div>
    </aside>
    {sidebarOpen && <button className="v2-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <section className="v2-main"><header className="v2-topbar"><div className="v2-top-left"><button className="v2-icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><span className="v2-breadcrumb">CoCreate <span>/</span> <b>{active ? active.title : "New chat"}</b></span></div><div className="v2-top-right"><span className="v2-secure"><span/> {import.meta.env.DEV ? "Preview mode · sign-in off until Vercel" : "Ready for your next question"}</span><button className="v2-shortcut" title="Keyboard shortcut"><Command size={13}/> K</button></div></header>
      <div className={`v2-content ${active ? "has-chat" : ""}`}>
        {!active ? <div className="v2-welcome"><div className="v2-eyebrow"><span className="v2-eyebrow-line"/> YOUR AI, YOUR WAY</div><h1>What’s on<br/>your <em>mind?</em></h1><p className="v2-intro">Ask anything, explore an idea, or just start somewhere. We’ll figure it out together.</p>
          <div className="v2-auto-route"><span><Sparkles size={13}/></span> One chat, automatically matched to your question</div>
          <div className="v2-compose-wrap"><div className="v2-compose"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message CoCreate…" rows={3} aria-label="Message CoCreate"/><div className="v2-compose-tools"><span className="v2-compose-hint">One conversation for whatever you have in mind.</span><div className="v2-actions"><button className="v2-refine" disabled={!draft.trim() || busy} onClick={() => void refinePrompt()}><WandSparkles size={15}/> {isRefining ? "Refining…" : "Refine"}</button><button className="v2-send" disabled={!draft.trim() || busy} onClick={() => void send()} aria-label="Send message">{busy ? <span className="v2-spinner"/> : <ArrowUp size={17}/>}</button></div></div></div><div className="v2-compose-foot"><span>Click ↑ to send</span><span>↵ New line</span></div></div>
          <div className="v2-suggestions"><span>GET THE CONVERSATION STARTED</span>{["Help me think through an idea", "Explain something in simple terms", "Help me write a first draft"].map((s) => <button key={s} onClick={() => setDraft(s)}>{s}<ArrowDown size={12}/></button>)}</div>
          <div className="v2-disclaimer">AI can make mistakes. Your judgment makes the difference.</div>
        </div> : <><div className="v2-chat-head"><span className="v2-chat-icon"><Sparkles size={17}/></span><div><small>CoCreate assistant</small><h2>{active.title}</h2></div><button className="v2-icon-button" onClick={newSession} title="New chat"><Plus size={18}/></button></div><div className="v2-messages">{active.messages.map((m, i) => <article className={`v2-message ${m.role}`} key={`${active.id}-${i}`}><div className="v2-message-avatar">{m.role === "assistant" ? <Sparkles size={15}/> : "Y"}</div><div className="v2-message-body"><span className="v2-message-name">{m.role === "assistant" ? "CoCreate" : "You"}</span>{m.content ? <p>{m.content}</p> : m.role === "assistant" && busy ? <div className="v2-thinking"><i/><i/><i/> Thinking it through</div> : null}{m.reasoningTokens !== undefined && <small className="v2-token-usage">Reasoning tokens · {m.reasoningTokens}</small>}{m.role === "assistant" && m.content && <button className="v2-copy" onClick={() => { void navigator.clipboard?.writeText(m.content); setCopied(i); setTimeout(() => setCopied(null), 1500); }}>{copied === i ? <Check size={13}/> : <Clipboard size={13}/>} {copied === i ? "Copied" : "Copy"}</button>}</div></article>)}{busy && active.messages[active.messages.length - 1]?.role !== "assistant" && <article className="v2-message assistant"><div className="v2-message-avatar"><Sparkles size={15}/></div><div className="v2-message-body"><span className="v2-message-name">CoCreate</span><div className="v2-thinking"><i/><i/><i/> Thinking it through</div></div></article>}<div ref={bottomRef}/></div><div className="v2-chat-compose"><div className="v2-compose"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message CoCreate…" rows={2}/><div className="v2-compose-tools"><span className="v2-compose-hint">CoCreate adapts to each message</span><div className="v2-actions"><button className="v2-refine" disabled={!draft.trim() || busy} onClick={() => void refinePrompt()}><WandSparkles size={15}/> {isRefining ? "Refining…" : "Refine"}</button><button className="v2-send" disabled={!draft.trim() || busy} onClick={() => void send()} aria-label="Send message">{busy ? <span className="v2-spinner"/> : <ArrowUp size={17}/>}</button></div></div></div><div className="v2-disclaimer">AI can make mistakes. Your judgment makes the difference.</div></div></>}
      </div>{notice && <div className="v2-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
    </section>
  </main>;
}
