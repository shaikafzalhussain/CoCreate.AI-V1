import { useState } from "react";
import VideoBackground from "@/components/VideoBackground";
import ModeToggle from "@/components/ModeToggle";
import CoCreatePanel from "@/components/CoCreatePanel";

type Mode = "story" | "idea" | "tutor";

const Index = () => {
  const [mode, setMode] = useState<Mode>("story");

  return (
    <div className="min-h-screen flex flex-col">
      <VideoBackground />
      
      {/* Navigation */}
      <nav className="glass-strong border-b border-glass-border/30 sticky top-0 z-10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center pulse-glow">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-text-cyan">CoCreate.AI</h1>
              <p className="text-xs text-muted-foreground">Human + AI: Creating Together.</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-sm text-muted-foreground italic">Build with AI, not for AI.</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center gap-8">
        {/* Mode Toggle */}
        <div className="w-full max-w-7xl">
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>

        {/* Co-Create Panels */}
        <CoCreatePanel mode={mode} />
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-glass-border/30 py-4 mt-auto backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built for <span className="text-neon-purple font-semibold">Vibeathon 2025</span> by{" "}
            <span className="text-neon-cyan font-semibold">Shaik Afzal Hussain</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
