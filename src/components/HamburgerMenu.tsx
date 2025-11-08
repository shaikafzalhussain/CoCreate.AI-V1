import { useState } from "react";
import { Menu, X, Plus, Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
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

type HamburgerMenuProps = {
  onNewChat: () => void;
  chatHistory: ChatHistoryItem[];
  onDeleteChat: (id: string) => void;
  onLoadChat: (id: string) => void;
  onDeleteAllHistory?: () => void;
};

const HamburgerMenu = ({ onNewChat, chatHistory, onDeleteChat, onLoadChat, onDeleteAllHistory }: HamburgerMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      onDeleteAllHistory && onDeleteAllHistory();
      setOpen(false);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-glass-bg/50 h-12 w-12 p-2">
          <Menu className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="glass-strong border-glass-border w-80">
        <SheetHeader>
          <SheetTitle className="text-foreground">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleDeleteAll}
            variant="destructive"
            className="w-full"
            disabled={chatHistory.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All History
          </Button>
          <Button
            onClick={handleNewChat}
            variant="neon"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Chat History</h3>
              <span className="text-xs text-muted-foreground">
                {chatHistory.length} {chatHistory.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>
            <ScrollArea className="h-[500px] rounded-lg border border-glass-border/30 p-2">
              {chatHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No chat history yet</p>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className="glass rounded-lg p-3 hover:bg-glass-bg/60 transition-all relative flex items-start justify-between gap-2 group border border-transparent hover:border-neon-cyan/30"
                    >
                      <div 
                        className="flex-1 min-w-0 cursor-pointer" 
                        onClick={() => {
                          onLoadChat(chat.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-neon-cyan font-semibold capitalize">{chat.mode} Mode</p>
                            <span className="text-[10px] text-muted-foreground/60">
                              {new Date(chat.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground/90 truncate group-hover:text-foreground transition-colors">
                          {chat.preview}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 hover:bg-destructive/20 transition-colors group relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (window.confirm('Are you sure you want to delete this chat?')) {
                            onDeleteChat(chat.id);
                          }
                        }}
                        title="Delete chat"
                      >
                        <Trash2 className="h-5 w-5 text-white/70 group-hover:text-red-400 transition-all duration-200 transform group-hover:scale-110" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Delete chat
                        </span>
                      </Button>
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
