import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ResponseBoxesProps {
  userInput: string;
  aiResponse: string;
  isLoading: boolean;
}

const ResponseBoxes = ({ userInput, aiResponse, isLoading }: ResponseBoxesProps) => {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const copyToClipboard = async (text: string, isInput: boolean) => {
    await navigator.clipboard.writeText(text);
    if (isInput) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  if (!userInput && !aiResponse) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl animate-fade-in">
      {/* User Input Box */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-gradient-to-b from-neon-cyan to-neon-purple rounded-full" />
            <h2 className="text-lg font-bold glow-text-cyan">Your Input</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(userInput, true)}
            className="h-8 w-8"
            title={copiedInput ? "Copied!" : "Copy"}
          >
            {copiedInput ? (
              <Check className="h-4 w-4 text-neon-cyan" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="glass min-h-[200px] rounded-lg p-4 border border-glass-border/50">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{userInput}</p>
        </div>
      </div>

      {/* AI Output Box */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-gradient-to-b from-neon-purple to-neon-blue rounded-full" />
            <h2 className="text-lg font-bold glow-text-purple">AI Response</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(aiResponse, false)}
            disabled={!aiResponse}
            className="h-8 w-8"
            title={copiedOutput ? "Copied!" : "Copy"}
          >
            {copiedOutput ? (
              <Check className="h-4 w-4 text-neon-purple" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="glass min-h-[200px] rounded-lg p-4 border border-glass-border/50 relative">
          {isLoading && !aiResponse && (
            <div className="absolute inset-0 flex items-center justify-center shimmer rounded-lg" />
          )}
          {aiResponse ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
          ) : (
            <p className="text-muted-foreground text-center mt-20">
              {isLoading ? "AI is thinking..." : "AI response will appear here"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseBoxes;
