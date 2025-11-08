import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = "story" | "idea" | "tutor";

interface CoCreatePanelProps {
  mode: Mode;
}

const CoCreatePanel = ({ mode }: CoCreatePanelProps) => {
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCoCreate = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to co-create with AI",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-cocreate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: userInput,
            mode: mode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate AI response");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // Parse Gemini streaming response
          const lines = chunk.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                fullText += text;
                setAiResponse(fullText);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      toast({
        title: "Co-creation complete! ✨",
        description: "AI has contributed to your creation",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to connect with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const combinedText = `=== Your Input ===\n${userInput}\n\n=== AI Contribution ===\n${aiResponse}`;
    const blob = new Blob([combinedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cocreate-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Saved! 💾",
      description: "Your co-creation has been downloaded",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl">
      {/* User Input Panel */}
      <div className="glass-strong rounded-2xl p-6 space-y-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-gradient-to-b from-neon-cyan to-neon-purple rounded-full" />
          <h2 className="text-xl font-bold glow-text-cyan">Your Idea / Start Writing</h2>
        </div>
        
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Start typing your story, idea, or question here..."
          className="glass min-h-[300px] resize-none text-base border-glow-cyan focus:border-glow-purple transition-all duration-300 typing-cursor"
          disabled={isLoading}
        />

        <Button
          onClick={handleCoCreate}
          disabled={isLoading || !userInput.trim()}
          variant="hero"
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Co-Creating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Co-Create ✨
            </>
          )}
        </Button>
      </div>

      {/* AI Response Panel */}
      <div className="glass-strong rounded-2xl p-6 space-y-4 animate-fade-in animation-delay-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-gradient-to-b from-neon-purple to-neon-blue rounded-full" />
          <h2 className="text-xl font-bold glow-text-purple">AI Partner's Contribution</h2>
        </div>

        <div className="glass min-h-[300px] rounded-lg p-4 border border-glass-border/50 relative overflow-auto">
          {isLoading && !aiResponse && (
            <div className="absolute inset-0 flex items-center justify-center shimmer rounded-lg" />
          )}
          
          {aiResponse ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
          ) : (
            <p className="text-muted-foreground text-center mt-32">
              AI's creative contribution will appear here...
            </p>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={!aiResponse}
          variant="neon"
          size="lg"
          className="w-full"
        >
          <Download className="h-5 w-5" />
          Save Creation
        </Button>
      </div>
    </div>
  );
};

export default CoCreatePanel;
