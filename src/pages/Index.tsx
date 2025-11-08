import { useState, useEffect, useRef } from "react";
import VideoBackground from "@/components/VideoBackground";
import "@/components/animations.css";
import ModeToggle from "@/components/ModeToggle";
import HamburgerMenu from "@/components/HamburgerMenu";
import AnimatedInput from "@/components/AnimatedInput";
import ChatMessage from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

type Mode = "story" | "idea" | "tutor";

interface UploadedFile {
  file: File;
  url: string;
  name: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  images?: Array<{ url: string; name: string }>;
  timestamp: number;
}

interface ChatHistoryItem {
  id: string;
  timestamp: number;
  mode: string;
  preview: string;
  messages: Message[];
}

const Index = () => {
  const [mode, setMode] = useState<Mode>("story");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [isConversationMode, setIsConversationMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingFromHistoryRef = useRef(false);
  const { toast } = useToast();

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cocreate-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatHistory(parsed);
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isConversationMode && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isConversationMode]);

  // Clear chat when mode changes - each mode should have its own fresh conversation
  useEffect(() => {
    // Skip clearing if we're loading from history
    if (isLoadingFromHistoryRef.current) {
      isLoadingFromHistoryRef.current = false;
      return;
    }
    
    // Clean up object URLs for uploaded files before clearing
    setUploadedFiles((prevFiles) => {
      prevFiles.forEach((f) => URL.revokeObjectURL(f.url));
      return [];
    });
    
    // Clear messages, input, and conversation state when mode changes
    setMessages([]);
    setUserInput("");
    setCurrentChatId("");
    setIsConversationMode(false);
  }, [mode]); // Only run when mode changes

  // Convert file to base64 for API
  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve({ data: base64, mimeType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    // Revoke object URLs to prevent memory leaks
    URL.revokeObjectURL(uploadedFiles[index].url);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() && uploadedFiles.length === 0) {
      toast({
        title: "Input required",
        description: "Please enter some text or upload a file to co-create with AI",
        variant: "destructive",
      });
      return;
    }

    // Switch to conversation mode on first submission
    if (!isConversationMode) {
      setIsConversationMode(true);
    }

    setIsLoading(true);

    // Add user message
    const userMessageImages = uploadedFiles.map((f) => ({
      url: f.url,
      name: f.name,
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      images: userMessageImages.length > 0 ? userMessageImages : undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]);

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: "ai",
      content: "",
      timestamp: Date.now() + 1,
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        filesToSend
          .filter((f) => f.file.type.startsWith("image/"))
          .map((f) => fileToBase64(f.file))
      );

      const hasImages = imageData.length > 0;
      
      // Use GPT-3.5-turbo for text (cheaper), GPT-4-turbo for images (supports vision)
      // GPT-3.5-turbo doesn't support images, so we need GPT-4-turbo for image input
      const model = hasImages ? "openai/gpt-4-turbo" : "openai/gpt-3.5-turbo";

      const systemPrompts = {
        story: "You are a creative storytelling assistant. Continue the user's story with vivid descriptions, engaging dialogue, and compelling narrative. Match their tone and style while adding creative elements.",
        idea: "You are an innovation brainstorming partner. Expand on the user's ideas with fresh perspectives, practical applications, and creative solutions. Think big but keep it actionable.",
        tutor: "You are a patient and knowledgeable educational assistant. Help explain concepts clearly, provide examples, and guide learning. Make complex topics accessible and engaging.",
      };

      const systemPrompt = systemPrompts[mode] || systemPrompts.story;

      // Build messages array for OpenRouter (similar to OpenAI format)
      const messages: any[] = [
        {
          role: "system",
          content: systemPrompt,
        },
      ];

      // Add user message with images if present
      // For GPT-4-turbo with images, use vision API format
      if (hasImages) {
        const userContent: any[] = [];
        // Add text first if present
        if (userInput) {
          userContent.push({
            type: "text",
            text: userInput || "Analyze this image",
          });
        }
        // Add images
        for (const img of imageData) {
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:${img.mimeType || "image/jpeg"};base64,${img.data}`,
            },
          });
        }
        messages.push({
          role: "user",
          content: userContent,
        });
      } else {
        // Text only - use simple format
        messages.push({
          role: "user",
          content: userInput || "Hello",
        });
      }

      // Use Vercel API route to proxy OpenRouter API calls (keeps API key secure)
      // In production, always use the API route. In development, try API route first,
      // then fall back to direct OpenRouter call if API route doesn't exist (for local dev)
      const isDev = import.meta.env.DEV;
      const apiUrl = isDev ? "http://localhost:8081/api/openrouter" : "/api/openrouter";
      const directApiUrl = "https://openrouter.ai/api/v1/chat/completions";
      
      // For local development, we can use VITE_OPENROUTER_API_KEY from .env.local
      // In production, always use the secure API route
      const useDirectApi = isDev && import.meta.env.VITE_OPENROUTER_API_KEY;
      
      // Check if API is configured
      if (isDev && !useDirectApi) {
        // Show helpful message when API is not configured
        const setupMessage = `🔧 **API Setup Required**\n\nTo use AI features, you need to configure an API key:\n\n1. Get a free API key from OpenRouter.ai\n2. Create a \`.env.local\` file in the project root\n3. Add: \`VITE_OPENROUTER_API_KEY=your_key_here\`\n4. Restart the dev server\n\nAlternatively, deploy to production where API routes are configured.`;
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: setupMessage } : msg
          )
        );
        setIsLoading(false);
        
        toast({
          title: "API Configuration Needed",
          description: "Please set up an OpenRouter API key to use AI features. See the chat for instructions.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Calling OpenRouter API", useDirectApi ? "directly" : "via proxy", "with GPT model:", model);

      // Try API route first (or use direct API in local dev if env var is set)
      let response: Response;
      
      if (useDirectApi) {
        // Local development: use OpenRouter directly with env var
        response = await fetch(directApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(useDirectApi && {
              "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "CoCreate.AI",
            }),
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.9,
            max_tokens: hasImages ? 500 : 800,
          }),
        });
      } else {
        // Production or dev without env var: use API route
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.9,
            max_tokens: hasImages ? 500 : 800,
          }),
        });
        
        // If API route returns 404 (not found), try direct API as fallback in dev
        if (!response.ok && response.status === 404 && isDev) {
          console.warn("API route not found (404), falling back to direct OpenRouter API");
          const directKey = import.meta.env.VITE_OPENROUTER_API_KEY;
          if (directKey) {
            response = await fetch(directApiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${directKey}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "CoCreate.AI",
              },
              body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.9,
                max_tokens: hasImages ? 500 : 800,
              }),
            });
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          url: apiUrl,
          error: errorText,
        });
        
        // If OpenRouter fails, try fallback model
        if (response.status === 404 || response.status === 400) {
          console.log("Retrying with fallback model: openai/gpt-3.5-turbo...");
          const fallbackResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-3.5-turbo",
              messages: messages,
              temperature: 0.9,
              max_tokens: 800, // Further reduced to ensure it fits credit limit
            }),
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            // Process fallback response (same as below)
            let fullText = "";
            if (fallbackData.choices && fallbackData.choices.length > 0) {
              fullText = fallbackData.choices[0].message?.content || "";
            }
            
            if (fullText.trim()) {
              // Simulate streaming
              const words = fullText.split(" ");
              let currentText = "";
              for (let i = 0; i < words.length; i++) {
                currentText += (i > 0 ? " " : "") + words[i];
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, content: currentText } : msg
                  )
                );
                if (i % 5 === 0) {
                  await new Promise((resolve) => setTimeout(resolve, 30));
                }
              }
              
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, content: fullText.trim() } : msg
                )
              );
              saveToHistory([userMessage, { ...aiMessage, content: fullText.trim() }]);
              
              // toast removed: Co-creation complete popup suppressed per user preference
              return; // Success with fallback
            }
          }
        }
        
        // Try to parse error for better message
        let errorMessage = `Failed to generate AI response: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          
          // Check for detailed error message
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error?.message) {
            errorMessage = errorJson.error.message;
          } else if (errorJson.error) {
            errorMessage = typeof errorJson.error === 'string' ? errorJson.error : JSON.stringify(errorJson.error);
          }
          
          // Check for details field
          if (errorJson.details) {
            errorMessage += ` - ${errorJson.details}`;
          }
          
          // Handle specific error cases
          if (errorMessage.includes("credits") || errorMessage.includes("tokens")) {
            errorMessage = "Your OpenRouter account has insufficient credits. Please visit https://openrouter.ai/settings/credits to add credits.";
          } else if (errorMessage.includes("API key") || errorMessage.includes("auth") || errorMessage.includes("credentials")) {
            errorMessage = "API key error: " + errorMessage + " Please check your OPENROUTER_API_KEY in Vercel environment variables and redeploy.";
          }
        } catch (e) {
          // Use default message
          console.error("Error parsing error response:", e);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("OpenRouter API Response:", responseData);

      // Extract text from response - OpenRouter uses OpenAI-compatible format
      let fullText = "";
      
      // Check for error in response
      if (responseData.error) {
        throw new Error(responseData.error.message || "OpenRouter API returned an error");
      }

      // OpenRouter response format: { choices: [{ message: { content: "..." } }] }
      if (responseData.choices && responseData.choices.length > 0) {
        const choice = responseData.choices[0];
        fullText = choice.message?.content || "";
        
        // Check for finish reason
        if (choice.finish_reason && choice.finish_reason !== "stop") {
          console.warn("Finish reason:", choice.finish_reason);
          if (choice.finish_reason === "content_filter") {
            throw new Error("Response was blocked for safety reasons. Please try a different prompt.");
          }
        }
      }

      // Fallback: try alternative response formats
      if (!fullText && responseData.text) {
        fullText = responseData.text;
      }
      if (!fullText && responseData.content) {
        fullText = responseData.content.text || responseData.content;
      }

      // Simulate streaming effect for better UX
      if (fullText) {
        const words = fullText.split(" ");
        let currentText = "";
        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? " " : "") + words[i];
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: currentText } : msg
            )
          );
          // Small delay for streaming effect (faster for better UX)
          if (i % 5 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 30));
          }
        }
      }

      if (fullText.trim()) {
        // Update final message with complete text
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: fullText.trim() } : msg
          )
        );
        saveToHistory([userMessage, { ...aiMessage, content: fullText.trim() }]);
      } else {
        // Remove empty AI message if no response
        setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
        console.error("Empty response from API. Full response:", responseData);
        throw new Error("No response from AI - The API returned empty content. Please check the browser console (F12) for details and try again.");
      }

      // toast removed: Co-creation complete popup suppressed per user preference
    } catch (error) {
      console.error("Error details:", error);
      // Remove failed AI message
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
      
      let errorMessage = "Failed to connect with AI. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Handle specific error cases
        if (error.message.includes("CORS") || error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("401") || error.message.includes("403")) {
          errorMessage = "API authentication failed. Please contact support.";
        } else if (error.message.includes("429")) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      toast({
        title: "Something went wrong",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = (newMessages: Message[]) => {
    const preview = newMessages[0]?.content?.slice(0, 50) + (newMessages[0]?.content?.length > 50 ? "..." : "") || "New chat";
    const newChat: ChatHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode,
      preview,
      messages: newMessages,
    };
    const updated = [newChat, ...chatHistory].slice(0, 50); // Keep last 50
    setChatHistory(updated);
    localStorage.setItem("cocreate-history", JSON.stringify(updated));
    setCurrentChatId(newChat.id);
  };

  const handleNewChat = () => {
    setUserInput("");
    setMessages([]);
    setUploadedFiles([]);
    setCurrentChatId("");
    setIsConversationMode(false);
    // Clean up object URLs
    uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
  };

  const handleDeleteChat = (id: string) => {
    const updated = chatHistory.filter((chat) => chat.id !== id);
    setChatHistory(updated);
    localStorage.setItem("cocreate-history", JSON.stringify(updated));
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleLoadChat = (id: string) => {
    const chat = chatHistory.find((c) => c.id === id);
    if (chat) {
      // Set flag to skip clearing when loading from history
      isLoadingFromHistoryRef.current = true;
      // Set mode first, then load messages
      setMode(chat.mode as Mode);
      setMessages(chat.messages);
      setCurrentChatId(id);
      setIsConversationMode(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <VideoBackground />

      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex justify-between items-center h-14 px-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="CoCreate.AI Logo" className="h-12 w-12" />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-foreground">CoCreate.AI</span>
              <span className="text-xs text-muted-foreground">Human + AI: Creating Together.</span>
            </div>
          </div>

          {/* Right side: tagline + hamburger */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Build with AI, not for AI.</span>
            <HamburgerMenu
              onNewChat={handleNewChat}
              chatHistory={chatHistory}
              onDeleteChat={handleDeleteChat}
              onLoadChat={handleLoadChat}
              onDeleteAllHistory={() => {
                setChatHistory([]);
                localStorage.removeItem("cocreate-history");
                setMessages([]);
                setUploadedFiles([]);
                setUserInput("");
                setCurrentChatId("");
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        {!isConversationMode ? (
          /* Landing View - Centered Search */
          <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[60vh]">
            {/* Mode Toggle */}
            <div className="w-full max-w-7xl">
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            {/* Animated Input - Centered */}
            <AnimatedInput
              mode={mode}
              value={userInput}
              onChange={setUserInput}
              onSubmit={handleSubmit}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              onRemoveFile={handleRemoveFile}
              isLoading={isLoading}
              isConversationMode={false}
            />
          </div>
        ) : (
          /* Conversation View - Chat Interface */
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
            {/* Mode Toggle - Compact */}
            <div className="mb-4">
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-6 mb-4 px-2 scroll-smooth"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Start a conversation with AI...</p>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    images={message.images}
                    isLoading={message.role === "ai" && isLoading && !message.content}
                    onEdit={
                      message.role === "user"
                        ? () => {
                            setUserInput(message.content);
                            setMessages((prev) => prev.filter((_, i) => i !== idx));
                          }
                        : undefined
                    }
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar - Bottom */}
            <AnimatedInput
              mode={mode}
              value={userInput}
              onChange={setUserInput}
              onSubmit={handleSubmit}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              onRemoveFile={handleRemoveFile}
              isLoading={isLoading}
              isConversationMode={true}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      {!isConversationMode && (
        <footer className="glass-strong border-t border-glass-border/30 py-4 mt-auto backdrop-blur-xl">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-foreground/70">
              Built for <span className="text-neon-purple font-semibold">Vibeathon 2025</span> by{" "}
              <span className="text-neon-cyan font-semibold">Shaik Afzal Hussain</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;

