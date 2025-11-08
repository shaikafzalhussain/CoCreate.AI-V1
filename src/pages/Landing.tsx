import { useNavigate } from "react-router-dom";
import VideoBackground from "@/components/VideoBackground";
import { Button } from "@/components/ui/button";
import "@/styles/landing.css";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import React, { useEffect, useState } from "react";

// AnimatedName component for letter-by-letter animation
function AnimatedName({ name }: { name: string }) {
  return (
    <span className="inline-block">
      {name.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block animate-name-letter border border-cyan-400 rounded shadow-cyan-400/60 text-cyan-200 mx-[1px] px-[2px]"
          style={{
            animationDelay: `${i * 0.07}s`,
            textShadow: "0 0 8px #00e0ff, 0 0 16px #00e0ff80"
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

function AnimatedTypewriterName({ name }: { name: string }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setIndex(0);
  }, [name]);

  useEffect(() => {
    if (index < name.length) {
      const timeout = setTimeout(() => {
        setDisplayed(name.slice(0, index + 1));
        setIndex(index + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [index, name]);

  return (
    <span className="font-semibold text-cyan-300 border-b-2 border-cyan-400 shadow-cyan-400/60 text-lg" style={{textShadow: "0 0 8px #00e0ff80"}}>
      {displayed}
    </span>
  );
}

const Landing = () => {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const stats = [
    { value: 89, label: "faster creative output", symbol: "%" },
    { value: 70, label: "clearer prompt-to-result accuracy", symbol: "%" },
    { value: 50, label: "prompts refined by AI partners", symbol: "K+" },
    { value: 200, label: "creators and learners", symbol: "+" }
  ];

  const features = [
    {
      icon: "🪄",
      title: "Refine Your Prompt",
      description: "Transform vague thoughts into perfect prompts for better AI results."
    },
    {
      icon: "💡",
      title: "Idea Mode",
      description: "Brainstorm new concepts with AI that understands your intent."
    },
    {
      icon: "✍️",
      title: "Story Mode",
      description: "Co-write stories and creative pieces with an adaptive AI partner."
    },
    {
      icon: "📚",
      title: "Tutor Mode",
      description: "Learn any concept at your pace with AI-guided explanations."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background with increased brightness */}
      <VideoBackground isLanding={true} />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-black/30 z-30">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-white">CoCreate.AI</span>
              <span className="text-xs text-white/70">Human + AI: Creating Together.</span>
            </div>
          </div>
          <div className="space-x-6 flex items-center">
            <button className="text-white hover:text-cyan-400" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="text-white hover:text-cyan-400" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact</button>
            <Button 
              className="ml-4 bg-black text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 relative group"
              onClick={() => navigate('/app')}
              style={{
                boxShadow: '0 0 10px rgba(0, 230, 255, 0.3)',
              }}
            >
              <span className="relative z-10">Get Started for Free →</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 group-hover:opacity-75 transition-opacity opacity-0" />
              <div className="absolute inset-0 rounded-full animate-glow" 
                style={{
                  background: 'linear-gradient(90deg, rgba(0,230,255,0.1) 0%, rgba(0,230,255,0.2) 50%, rgba(0,230,255,0.1) 100%)',
                  filter: 'blur(8px)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            </Button>
          </div>
          
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 0.3;
              }
              50% {
                opacity: 0.8;
              }
            }
            @keyframes glow {
              0%, 100% {
                box-shadow: 0 0 15px rgba(0, 230, 255, 0.3);
              }
              50% {
                box-shadow: 0 0 30px rgba(0, 230, 255, 0.5);
              }
            }
          `}</style>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-32 pb-20">
          <motion.div 
            className="text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-cyan-400 font-medium text-xl">
              Human + AI: Co-Creation for the Future
            </h2>
            <h1 className="text-5xl md:text-6xl font-bold text-white space-y-2 leading-tight">
              Create smarter.
              <br />
              Think deeper.
              <br />
              Build faster.
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              CoCreate.AI empowers you to collaborate with AI — not just use it.
              Refine your prompts, sharpen your creativity, and bring your ideas to life effortlessly.
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-8 mt-24 max-w-5xl mx-auto">
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-5xl font-bold" style={{ color: '#00E6FF' }}>89%</h3>
                <p className="text-white/80 text-sm">faster creative output</p>
              </motion.div>
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-5xl font-bold" style={{ color: '#00E6FF' }}>70%</h3>
                <p className="text-white/80 text-sm">clearer prompt-to-result accuracy</p>
              </motion.div>
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-5xl font-bold" style={{ color: '#00E6FF' }}>50K+</h3>
                <p className="text-white/80 text-sm">prompts refined by AI partners</p>
              </motion.div>
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-5xl font-bold" style={{ color: '#00E6FF' }}>200+</h3>
                <p className="text-white/80 text-sm">creators and learners</p>
              </motion.div>
            </div>

          </motion.div>

          {/* Features Grid (hero feature highlights) */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                variants={fadeIn}
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* About Section */}
          <section id="about" className="mt-24 py-16">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              {/* === UPDATED CODE BLOCK: Replaced placeholder with logo image === */}
              <motion.div 
                className="rounded-xl p-6 flex justify-center items-center" // Added flex classes for centering
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }}
              >
                <img 
                  src={logo} // Use the imported logo asset
                  alt="CoCreate.AI Logo: Human and AI merged profile" 
                  className="w-full max-w-xs h-auto p-4 md:p-8 rounded-xl backdrop-blur-md bg-black/40 border border-cyan-600/10 shadow-lg shadow-cyan-900/50 transition-all duration-500 hover:scale-[1.02]"
                />
              </motion.div>
              {/* ================================================================ */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-6 bg-black/40 border border-cyan-600/10 rounded-xl">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-violet-500 mb-4">About CoCreate.AI</h2>
                <p className="text-white/80 leading-relaxed">CoCreate.AI is built on the idea that humans and AI thrive together. Inspired by the theme “Human + AI: Co-Creation for the Future,” this platform empowers users to collaborate with artificial intelligence — to think creatively, write effectively, and learn continuously. It bridges the gap between human imagination and AI precision, ensuring that technology enhances creativity instead of replacing it.</p>
              </motion.div>
            </div>
          </section>

          {/* Detailed Features Section */}
          <section id="features" className="mt-8 py-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-4">Features that Empower Human + AI Collaboration</h2>
              <p className="text-white/70 mb-6">Every interaction in CoCreate.AI is designed to help humans and AI create together.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: '✨', title: 'Refine Your Prompt', desc: 'Turn unclear thoughts into powerful prompts that deliver precise AI results.' },
                  { icon: '💬', title: 'Conversation Mode', desc: 'Chat naturally — CoCreate remembers your context and adapts.' },
                  { icon: '💡', title: 'Idea Mode', desc: 'Brainstorm and plan your next big thing with AI-powered insights.' },
                  { icon: '✍️', title: 'Story Mode', desc: 'Co-write stories, scripts, or blogs where AI expands your creativity.' },
                  { icon: '📚', title: 'Tutor Mode', desc: 'Learn any topic at your own pace with clear AI explanations.' },
                  { icon: '⚡', title: 'Real-Time Feedback', desc: 'Get refined suggestions and instant performance insights on your prompts.' }
                ].map((f, i) => (
                  <motion.div key={i} className="p-6 rounded-xl bg-black/30 border border-cyan-600/5 hover:translate-y-[-6px] transition-transform group" whileHover={{ scale: 1.02 }}>
                    <div className="text-3xl mb-3">{f.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
                    <p className="text-white/70">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="mt-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="text-left">
                  <AnimatedTypewriterName name="Shaik Afzal Hussain" />
                  <p className="text-white/70">Bangalore • +91 7702994407</p>
                </div>
                <div className="flex items-center gap-6 justify-center">
                  <a 
                    href="https://linkedin.com/in/afzal-hussain1" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:scale-110 transition-transform"
                    aria-label="LinkedIn Profile"
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <rect width="40" height="40" rx="4" fill="currentColor"/>
                      <path d="M11 16.3h3.8V29H11V16.3zM12.9 10C14.2 10 15.3 11.1 15.3 12.4c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4C10.5 11.1 11.6 10 12.9 10" fill="black"/>
                      <path d="M17.3 16.3h3.6v1.7h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.5 4.4 5.7v6.6h-3.8v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.9h-3.8V16.3h.3z" fill="black"/>
                    </svg>
                  </a>
                  <a 
                    href="https://github.com/shaikafzalhussain" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:scale-110 transition-transform"
                    aria-label="GitHub Profile"
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <path fillRule="evenodd" clipRule="evenodd" d="M20 0C8.95 0 0 8.95 0 20c0 8.85 5.725 16.325 13.675 18.975 1 0.175 1.375-0.425 1.375-0.95 0-0.475-0.025-2.05-0.025-3.725-5.575 1.2-6.75-2.375-6.75-2.375-0.9-2.3-2.225-2.9-2.225-2.9-1.825-1.25 0.15-1.225 0.15-1.225 2.025 0.15 3.1 2.075 3.1 2.075 1.8 3.075 4.725 2.2 5.875 1.675 0.175-1.3 0.7-2.2 1.275-2.7-4.45-0.5-9.125-2.225-9.125-9.875 0-2.175 0.775-3.975 2.075-5.375-0.225-0.5-0.9-2.55 0.175-5.325 0 0 1.7-0.525 5.575 2.075 1.625-0.45 3.35-0.675 5.075-0.675 1.725 0 3.45 0.225 5.075 0.675 3.875-2.6 5.575-2.075 5.575-2.075 1.075 2.775 0.4 4.825 0.175 5.325 1.3 1.4 2.075 3.2 2.075 5.375 0 7.675-4.675 9.375-9.15 9.85 0.7 0.6 1.375 1.825 1.375 3.7 0 2.7-0.025 4.85-0.025 5.525 0 0.525 0.375 1.15 1.375 0.95C34.275 36.325 40 28.85 40 20 40 8.95 31.05 0 20 0z" fill="currentColor"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <span className="text-white/60">Made with ❤️ by Shaik Afzal Hussain</span>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Landing;