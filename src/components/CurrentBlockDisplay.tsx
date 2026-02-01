import { TimeBlock, formatTime, getBlockIndicatorClass } from '@/lib/schedule';
import { ArrowRight, Clock } from 'lucide-react';

interface CurrentBlockDisplayProps {
  block: TimeBlock;
  nextBlock: TimeBlock | null;
}

export function CurrentBlockDisplay({ block, nextBlock }: CurrentBlockDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Current Block */}
      <div className="flex items-start gap-4">
        <div className={`w-3 h-3 rounded-full mt-2 ${getBlockIndicatorClass(block.type)}`} />
        <div className="flex-1">
          <h2 className="text-3xl font-semibold text-foreground mb-2">
            {block.name}
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {formatTime(block.startHour, block.startMinute)} – {formatTime(block.endHour, block.endMinute)}
            </span>
          </div>
        </div>
      </div>

      {/* Next Block Preview */}
      {nextBlock && (
        <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-lg">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Up next:</span>
          <div className={`w-2 h-2 rounded-full ${getBlockIndicatorClass(nextBlock.type)}`} />
          <span className="font-medium text-secondary-foreground">{nextBlock.name}</span>
          <span className="text-muted-foreground text-sm">
            at {formatTime(nextBlock.startHour, nextBlock.startMinute)}
          </span>
        </div>
      )}
    </div>
  );
}
