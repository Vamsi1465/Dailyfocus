import { TimeBlock, getBlockIndicatorClass, formatTime } from '@/lib/schedule';
import { X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlockAlertModalProps {
  isVisible: boolean;
  type: 'start' | 'end';
  block: TimeBlock | null;
  nextBlock: TimeBlock | null;
  message: string;
  onDismiss: () => void;
}

export function BlockAlertModal({
  isVisible,
  type,
  block,
  nextBlock,
  message,
  onDismiss
}: BlockAlertModalProps) {
  if (!isVisible || !block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center alert-overlay">
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full mx-4 alert-enter overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${getBlockIndicatorClass(block.type)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-white animate-bounce" />
              <span className="font-semibold text-white text-lg">
                {type === 'start' ? 'Time to Start' : 'Block Complete'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {block.name}
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {message}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{formatTime(block.startHour, block.startMinute)}</span>
            <span>→</span>
            <span>{formatTime(block.endHour, block.endMinute)}</span>
          </div>

          {nextBlock && type === 'end' && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Coming up next:</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${getBlockIndicatorClass(nextBlock.type)}`} />
                <span className="font-medium text-foreground">{nextBlock.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <Button
            onClick={onDismiss}
            className="w-full"
            size="lg"
          >
            {type === 'start' ? "Let's Go!" : 'Got It'}
          </Button>
        </div>
      </div>
    </div>
  );
}
