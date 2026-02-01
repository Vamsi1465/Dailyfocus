import { TimeBlock, formatTime } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

interface MiniTimerProps {
  hours: number;
  minutes: number;
  seconds: number;
  currentBlock: TimeBlock | null;
  nextBlock: TimeBlock | null;
  onCompleteBlock?: () => void;
}

export function MiniTimer({ 
  hours, 
  minutes, 
  seconds, 
  currentBlock, 
  nextBlock,
  onCompleteBlock 
}: MiniTimerProps) {
  
  if (!currentBlock) {
    return (
      <div className="flex items-center justify-center h-full bg-background p-6 text-center">
        <p className="text-muted-foreground">No active block</p>
      </div>
    );
  }

  // Determine color based on time remaining (simple logic used in main timer)
  const isUrgent = hours === 0 && minutes < 5;
  const isWarning = hours === 0 && minutes < 15 && !isUrgent;
  
  const timerColorClass = isUrgent 
    ? "text-red-500" 
    : isWarning 
      ? "text-amber-500" 
      : "text-primary";

  return (
    <div className="flex flex-col h-full bg-background p-4 border-t-4 border-primary/50 relative overflow-hidden">
      {/* Background glow */}
       <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center space-y-2 z-10">
        <div className={cn("text-5xl font-mono font-bold tracking-tighter tabular-nums", timerColorClass)}>
            {hours > 0 && <span className="opacity-50">{hours}:</span>}
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        
        <div className="text-center space-y-1">
            <h2 className="font-semibold text-lg line-clamp-1">{currentBlock.name}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {currentBlock.type}
            </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="truncate max-w-[100px]">
                Next: {nextBlock?.name || "Done"}
            </span>
        </div>
        
        {onCompleteBlock && (
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-green-500" onClick={onCompleteBlock} title="Complete Block">
                <CheckCircle className="w-4 h-4" />
            </Button>
        )}
      </div>
    </div>
  );
}
