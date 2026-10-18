import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, FileText, Lightbulb, Play, Sparkles, WandSparkles } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";
import "@/styles/v2-landing.css";

const offerings = [
  { icon: WandSparkles, number: "01", title: "Shape the thought", body: "Start with a rough idea. Refine it into a prompt that says what you really mean." },
  { icon: Lightbulb, number: "02", title: "Find what’s possible", body: "Explore fresh angles, make connections, and turn possibilities into next steps." },
  { icon: FileText, number: "03", title: "Make it yours", body: "Create alongside AI, keep your point of view, and leave with something you’re proud of." },
];
const highlights = [
  { title: "A good fit for every question", detail: "Each message is matched to the best response engine automatically." },
  { title: "One continuous conversation", detail: "Ask, write, analyze, and explore without switching workflows." },
];

export default function V2Landing() {
  const workspaceLink = import.meta.env.DEV ? "/workspace" : "/auth?next=%2Fworkspace";
  return <main className="v2-home"><VideoBackground isLanding/><div className="v2-home-shade"/>
    <header className="v2-home-nav"><Link className="v2-home-brand" to="/"><span className="v2-home-mark"><img src="/cocreate-icon.png" alt="" /></span><span><strong>CoCreate<span>.AI</span></strong><small>YOUR CREATIVE SPACE</small></span></Link><nav><a href="#approach">Our approach</a><a href="#modes">How it works</a><Link to="/v1">V1 experience</Link></nav>{!import.meta.env.DEV && <Link className="v2-home-signin" to="/auth?mode=signin&next=%2Fworkspace">Sign in</Link>}<Link className="v2-home-nav-cta" to={workspaceLink}>Open workspace <ArrowUpRight size={15}/></Link></header>
    <section className="v2-home-hero"><div className="v2-home-kicker"><span/> HUMAN IMAGINATION, MEET AI</div><h1>Your next idea<br/>is <em>closer than you think.</em></h1><p className="v2-home-lede">A calm, creative space to get unstuck, think things through, and make something that feels like you.</p><div className="v2-home-actions"><Link className="v2-home-primary" to={workspaceLink}>Start creating <ArrowRight size={16}/></Link><a className="v2-home-secondary" href="#approach"><span><Play size={13} fill="currentColor"/></span> See how it works</a></div><div className="v2-home-note"><span className="v2-note-stars">✳</span> No perfect prompts required. Just bring your curiosity.</div></section>
    <section id="approach" className="v2-home-approach"><div className="v2-home-section-heading"><div><span className="v2-home-label">A BETTER WAY TO BEGIN</span><h2>Think out loud.<br/><em>Make something real.</em></h2></div><p>Good work rarely arrives fully formed. CoCreate gives your ideas a thoughtful place to grow—with you in the driver's seat.</p></div><div className="v2-home-steps">{offerings.map(({icon:Icon,number,title,body})=><article className="v2-home-step" key={number}><div className="v2-step-top"><span className="v2-step-icon"><Icon size={17}/></span><span>{number}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="modes" className="v2-home-modes"><div className="v2-modes-copy"><span className="v2-home-label">ONE CHAT. THOUGHTFUL BY DESIGN.</span><h2>Good tools.<br/>No silos.</h2><p>Bring every kind of question to one continuous conversation. CoCreate adapts behind the scenes, so you can stay focused on what you’re thinking about.</p><Link to={workspaceLink}>Open the workspace <ArrowRight size={15}/></Link></div><div className="v2-modes-list">{highlights.map(({title,detail},i)=><Link to={workspaceLink} className="v2-mode-row" key={title}><span className="v2-home-mode-icon"><Sparkles size={17}/></span><span className="v2-mode-row-copy"><strong>{title}</strong><small>{detail}</small></span><span className="v2-mode-row-number">0{i+1}</span><ArrowUpRight className="v2-mode-row-arrow" size={16}/></Link>)}</div></section>
    <footer className="v2-home-footer"><Link className="v2-home-brand" to="/"><span className="v2-home-mark"><img src="/cocreate-icon.png" alt="" /></span><span><strong>CoCreate<span>.AI</span></strong></span></Link><span>Ideas are better when they’re yours.</span><Link to={workspaceLink}>Step inside <ArrowRight size={14}/></Link></footer>
    <a className="v2-home-scroll" href="#approach" aria-label="Scroll to learn more"><ArrowDown size={14}/></a>
  </main>;
}
