import { Copy, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import userLogo from "@/assets/user-logo.svg";
import aiLogo from "@/assets/ai-logo.svg";

type ChatMessageProps = {
  role: "user" | "ai";
  content: string;
  images?: Array<{ url: string; name: string }>;
  isLoading?: boolean;
  onEdit?: () => void;
};

const ChatMessage = ({ role, content, images, isLoading, onEdit }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

  return (
    <div className={`flex gap-4 ${isUser ? "justify-start" : "justify-end"} animate-fade-in`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-glow-cyan/50 bg-glass-bg/50 flex items-center justify-center">
            <img
              src={isUser ? userLogo : aiLogo}
              alt={isUser ? "User" : "AI"}
              className="h-full w-full object-contain p-1"
            />
          </div>
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? "items-start" : "items-end"}`}>
          <div
            className={`glass-strong rounded-2xl px-4 py-3 relative ${
              isUser
                ? "bg-glass-bg/60 border-glow-cyan/30 rounded-tl-none"
                : "bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border-glow-purple/30 rounded-tr-none"
            } border backdrop-blur-xl`}
          >
            {/* Images Preview */}
            {images && images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-20 w-20 object-cover rounded-lg border border-glass-border/50"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            {isLoading && !content ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            ) : (
              <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">{content}</p>
            )}
          </div>

          {/* Copy & Edit Buttons */}
          {content && !isLoading && (
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-7 w-7 opacity-70 hover:opacity-100"
                title={copied ? "Copied!" : "Copy"}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-neon-cyan" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              {/* Edit icon for user messages */}
              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-7 w-7 opacity-70 hover:opacity-100"
                  title="Edit message"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground hover:text-neon-cyan transition" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;


