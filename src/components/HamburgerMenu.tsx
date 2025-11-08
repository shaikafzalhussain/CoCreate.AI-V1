import { useState } from "react";
import { Menu, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHistoryItem {
  id: string;
  timestamp: number;
  mode: string;
  preview: string;
}

interface HamburgerMenuProps {
  onNewChat: () => void;
  chatHistory: ChatHistoryItem[];
  onDeleteChat: (id: string) => void;
  onLoadChat: (id: string) => void;
}

const HamburgerMenu = ({ onNewChat, chatHistory, onDeleteChat, onLoadChat }: HamburgerMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleNewChat = () => {
    onNewChat();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-glass-bg/50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="glass-strong border-glass-border w-80">
        <SheetHeader>
          <SheetTitle className="text-foreground">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleNewChat}
            variant="neon"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Chat History</h3>
            <ScrollArea className="h-[500px] rounded-lg border border-glass-border/30 p-2">
              {chatHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No chat history yet</p>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className="glass rounded-lg p-3 hover:bg-glass-bg/60 transition-all cursor-pointer group"
                      onClick={() => {
                        onLoadChat(chat.id);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neon-cyan font-semibold mb-1">{chat.mode} Mode</p>
                          <p className="text-xs text-muted-foreground truncate">{chat.preview}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
