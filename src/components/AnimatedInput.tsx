import { useState, useEffect, useRef } from "react";
import { Paperclip, Sparkles, X, ArrowRight } from "lucide-react";
import { Sparkles as MagicWand } from "lucide-react";
import { refinePrompt } from "@/lib/refinePrompt";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Mode = "story" | "idea" | "tutor";

interface UploadedFile {
  file: File;
  url: string;
  name: string;
}

interface AnimatedInputProps {
  mode: Mode;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFileUpload: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
  isLoading: boolean;
  isConversationMode?: boolean;
}

const placeholderTexts = {
  story: "What kind of story pulls you in? ✍️",
  idea: "Got a vision? Let's shape it! 💡",
  tutor: "What do you want to master today? 📚",
};

// Read API keys from Vite environment variables or localStorage
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || "";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openrouter_api_key') || "";

const AnimatedInput = ({
  mode,
  value,
  onChange,
  onSubmit,
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  isLoading,
  isConversationMode = false,
}: AnimatedInputProps) => {
  const [refining, setRefining] = useState(false);
  const [refined, setRefined] = useState(false);
  const [refineNote, setRefineNote] = useState("");
  // Keyboard shortcut: Cmd+R / Ctrl+R
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleRefine();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleRefine = async () => {
    if (!value.trim()) {
      setRefineNote("Nothing to refine!");
      setTimeout(() => setRefineNote(""), 2000);
      return;
    }
    setRefining(true);
    setRefineNote("");
    try {
      setRefineNote("Refining prompt...");
      const newPrompt = await refinePrompt(value, GEMINI_API_KEY);
      
      // Only update if the prompt actually changed
      if (newPrompt !== value) {
        onChange(newPrompt);
        setRefining(false);
        setRefined(true);
        // Show which AI model refined the prompt
        const model = OPENROUTER_API_KEY ? "Claude-3" : (GEMINI_API_KEY ? "Gemini" : "AI");
        setRefineNote(`Prompt refined by ${model} ✨`);
        setTimeout(() => setRefined(false), 1200);
      } else {
        setRefining(false);
        setRefineNote("Prompt already optimized ✓");
        setTimeout(() => setRefineNote(""), 2000);
      }
    } catch (error) {
      console.error('Prompt refinement error:', error);
      setRefining(false);
      setRefineNote("Could not refine prompt. Please try again.");
    }
  };
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullPlaceholder = placeholderTexts[mode];

  useEffect(() => {
    if (!isConversationMode) {
      setDisplayedPlaceholder("");
      setCurrentIndex(0);
    }
  }, [mode, isConversationMode]);

  useEffect(() => {
    if (!isConversationMode && currentIndex < fullPlaceholder.length) {
      const timeout = setTimeout(() => {
        setDisplayedPlaceholder(fullPlaceholder.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else if (isConversationMode) {
      setDisplayedPlaceholder(fullPlaceholder);
    }
  }, [currentIndex, fullPlaceholder, isConversationMode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles: UploadedFile[] = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      onFileUpload([...uploadedFiles, ...newFiles]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`w-full ${isConversationMode ? "max-w-4xl mx-auto" : "max-w-4xl mx-auto"}`}>
      <div className={`glass-strong rounded-2xl p-6 space-y-4 animate-fade-in ${isConversationMode ? "sticky bottom-4" : ""}`}>
        {/* File Previews */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="relative group">
                {uploadedFile.file.type.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      src={uploadedFile.url}
                      alt={uploadedFile.name}
                      className="h-20 w-20 object-cover rounded-lg border border-glass-border/50"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveFile(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/80 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative glass rounded-lg p-2 pr-6 border border-glass-border/50">
                    <p className="text-xs truncate max-w-[120px]">{uploadedFile.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveFile(index)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/80 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConversationMode ? fullPlaceholder : displayedPlaceholder}
            className="glass min-h-[120px] resize-none text-base border-glow-cyan focus:border-glow-purple transition-all duration-300 pr-24"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-9 w-9 hover:bg-neon-cyan/20"
              title="Attach File"
              aria-label="Attach File"
            >
              <span title="Attach File" className="pointer-events-auto">
                <Paperclip className="h-5 w-5 text-neon-cyan" />
              </span>
            </Button>
            {/* Refine Prompt Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefine}
              disabled={isLoading || refining}
              className={`h-9 w-9 relative group ${refining ? "animate-pulse" : ""}`}
              title="Refine Prompt"
              aria-label="Refine Prompt"
            >
              <span title="Refine Prompt" className="pointer-events-auto">
                <MagicWand className={`h-5 w-5 ${refining ? "text-neon-cyan animate-pulse" : "text-neon-purple group-hover:text-neon-cyan"}`} />
              </span>
              {refining && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-violet-400/30 animate-pulse pointer-events-none" />
              )}
            </Button>
            <Button
              variant="hero"
              size="icon"
              onClick={onSubmit}
              disabled={isLoading || (!value.trim() && uploadedFiles.length === 0)}
              className="h-9 w-9"
              title="Send"
              aria-label="Send"
            >
              <span title="Send" className="pointer-events-auto">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
        {/* Refine Note/Feedback */}
        {refineNote && (
          <div className={`text-xs text-center mt-2 transition-opacity duration-500 ${refined ? "opacity-100" : "opacity-80"}`}>
            {refineNote}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedInput;
