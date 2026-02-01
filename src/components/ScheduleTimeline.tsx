import { TimeBlock, formatTime, getBlockIndicatorClass } from '@/lib/schedule';
import { cn } from '@/lib/utils';

interface ScheduleTimelineProps {
  blocks: TimeBlock[];
  currentBlockId: string | null;
}

export function ScheduleTimeline({ blocks, currentBlockId }: ScheduleTimelineProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
        Today's Schedule
      </h3>
      <div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
        {blocks.map((block) => {
          const isActive = block.id === currentBlockId;
          
          return (
            <div
              key={block.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary/10 active-block-glow" 
                  : "hover:bg-secondary/50"
              )}
            >
              <div className={cn(
                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                getBlockIndicatorClass(block.type),
                isActive && "ring-2 ring-offset-2 ring-offset-background ring-primary"
              )} />
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {block.name}
                </p>
              </div>
              
              <span className={cn(
                "text-xs flex-shrink-0",
                isActive ? "text-foreground" : "text-muted-foreground/70"
              )}>
                {formatTime(block.startHour, block.startMinute)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
