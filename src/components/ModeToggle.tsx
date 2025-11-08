import { Button } from "@/components/ui/button";
import { BookOpen, Lightbulb, GraduationCap } from "lucide-react";

type Mode = "story" | "idea" | "tutor";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  const modes = [
    { id: "story" as Mode, icon: BookOpen, label: "Story Mode", desc: "Creative writing" },
    { id: "idea" as Mode, icon: Lightbulb, label: "Idea Mode", desc: "Brainstorming" },
    { id: "tutor" as Mode, icon: GraduationCap, label: "Tutor Mode", desc: "Learning" },
  ];

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {modes.map((m) => {
        const Icon = m.icon;
        return (
          <Button
            key={m.id}
            variant={mode === m.id ? "hero" : "neon"}
            size="sm"
            onClick={() => onModeChange(m.id)}
            className="flex-col h-auto py-3 px-4 gap-1 min-w-[120px]"
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-semibold">{m.label}</span>
            <span className="text-[10px] opacity-70">{m.desc}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
