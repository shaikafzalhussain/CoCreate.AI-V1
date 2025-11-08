import { useState, useEffect, useRef } from "react";
import { Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Mode = "story" | "idea" | "tutor";

interface AnimatedInputProps {
  mode: Mode;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const placeholderTexts = {
  story: "What kind of story pulls you in? ✍️",
  idea: "Got a vision? Let's shape it! 💡",
  tutor: "What do you want to master today? 📚",
};

const AnimatedInput = ({ mode, value, onChange, onSubmit, onFileUpload, isLoading }: AnimatedInputProps) => {
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullPlaceholder = placeholderTexts[mode];

  useEffect(() => {
    setDisplayedPlaceholder("");
    setCurrentIndex(0);
  }, [mode]);

  useEffect(() => {
    if (currentIndex < fullPlaceholder.length) {
      const timeout = setTimeout(() => {
        setDisplayedPlaceholder(fullPlaceholder.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullPlaceholder]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-strong rounded-2xl p-6 space-y-4 animate-fade-in">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={displayedPlaceholder}
            className="glass min-h-[120px] resize-none text-base border-glow-cyan focus:border-glow-purple transition-all duration-300 pr-24"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-9 w-9 hover:bg-neon-cyan/20"
            >
              <Paperclip className="h-5 w-5 text-neon-cyan" />
            </Button>
            <Button
              variant="hero"
              size="icon"
              onClick={onSubmit}
              disabled={isLoading || !value.trim()}
              className="h-9 w-9"
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedInput;
