import { useState, useEffect } from "react";
import VideoBackground from "@/components/VideoBackground";
import ModeToggle from "@/components/ModeToggle";
import HamburgerMenu from "@/components/HamburgerMenu";
import AnimatedInput from "@/components/AnimatedInput";
import ResponseBoxes from "@/components/ResponseBoxes";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

type Mode = "story" | "idea" | "tutor";

interface ChatHistoryItem {
  id: string;
  timestamp: number;
  mode: string;
  preview: string;
  userInput: string;
  aiResponse: string;
}

const Index = () => {
  const [mode, setMode] = useState<Mode>("story");
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const { toast } = useToast();

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cocreate-history");
    if (saved) {
      setChatHistory(JSON.parse(saved));
    }
  }, []);

  // Save chat to history
  const saveToHistory = (input: string, response: string) => {
    const newChat: ChatHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode,
      preview: input.slice(0, 50) + (input.length > 50 ? "..." : ""),
      userInput: input,
      aiResponse: response,
    };
    const updated = [newChat, ...chatHistory].slice(0, 50); // Keep last 50
    setChatHistory(updated);
    localStorage.setItem("cocreate-history", JSON.stringify(updated));
    setCurrentChatId(newChat.id);
  };

  const handleSubmit = async () => {
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

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
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
              // Skip invalid JSON
            }
          }
        }
      }

      if (fullText) {
        saveToHistory(userInput, fullText);
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

  const handleNewChat = () => {
    setUserInput("");
    setAiResponse("");
    setCurrentChatId("");
  };

  const handleDeleteChat = (id: string) => {
    const updated = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(updated);
    localStorage.setItem("cocreate-history", JSON.stringify(updated));
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleLoadChat = (id: string) => {
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      setMode(chat.mode as Mode);
      setUserInput(chat.userInput);
      setAiResponse(chat.aiResponse);
      setCurrentChatId(id);
    }
  };

  const handleFileUpload = (file: File) => {
    toast({
      title: "File uploaded",
      description: `${file.name} is ready to discuss with AI`,
    });
    // Future: implement image analysis
  };

  return (
    <div className="min-h-screen flex flex-col">
      <VideoBackground />
      
      {/* Navigation */}
      <nav className="glass-strong border-b border-glass-border/30 sticky top-0 z-10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CoCreate.AI Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold glow-text-cyan">CoCreate.AI</h1>
              <p className="text-xs text-foreground/70">Human + AI: Creating Together.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-foreground/80 font-medium">
              Build with AI, not for AI.
            </span>
            <HamburgerMenu
              onNewChat={handleNewChat}
              chatHistory={chatHistory}
              onDeleteChat={handleDeleteChat}
              onLoadChat={handleLoadChat}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center gap-8">
        {/* Mode Toggle */}
        <div className="w-full max-w-7xl">
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>

        {/* Animated Input */}
        <AnimatedInput
          mode={mode}
          value={userInput}
          onChange={setUserInput}
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
        />

        {/* Response Boxes */}
        <ResponseBoxes
          userInput={userInput}
          aiResponse={aiResponse}
          isLoading={isLoading}
        />
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-glass-border/30 py-4 mt-auto backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-foreground/70">
            Built for <span className="text-neon-purple font-semibold">Vibeathon 2025</span> by{" "}
            <span className="text-neon-cyan font-semibold">Shaik Afzal Hussain</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
