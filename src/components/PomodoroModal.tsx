import { usePomodoro } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, SkipForward, RotateCcw, Coffee, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockName: string;
}

export function PomodoroModal({ isOpen, onClose, blockName }: PomodoroModalProps) {
  const {
    state,
    formattedTime,
    completedToday,
    isRunning,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    skip,
    progress
  } = usePomodoro();

  if (!isOpen) return null;

  const stateConfig = {
    idle: {
      title: 'Ready to Focus',
      subtitle: 'Start a 25-minute deep work session',
      color: 'text-foreground',
      bgColor: 'bg-primary/10'
    },
    focus: {
      title: 'Deep Focus',
      subtitle: 'Stay concentrated on your work',
      color: 'text-timer-active',
      bgColor: 'bg-timer-active/10'
    },
    break: {
      title: 'Short Break',
      subtitle: 'Rest and recharge (5 min)',
      color: 'text-timer-warning',
      bgColor: 'bg-timer-warning/10'
    },
    longBreak: {
      title: 'Long Break',
      subtitle: 'Great work! Take a longer rest (15 min)',
      color: 'text-block-break',
      bgColor: 'bg-block-break/10'
    }
  };

  const config = stateConfig[state];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 alert-enter overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Pomodoro Focus</h2>
            <p className="text-sm text-muted-foreground truncate max-w-[250px]">{blockName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Timer Display */}
        <div className={cn("px-6 py-10 text-center", config.bgColor)}>
          <div className="mb-4">
            {state === 'focus' && <Target className={cn("w-8 h-8 mx-auto", config.color)} />}
            {(state === 'break' || state === 'longBreak') && <Coffee className={cn("w-8 h-8 mx-auto", config.color)} />}
          </div>
          
          <h3 className={cn("text-lg font-medium mb-1", config.color)}>
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {config.subtitle}
          </p>

          <div className={cn("timer-display text-timer-lg mb-6", config.color)}>
            {formattedTime}
          </div>

          {/* Progress bar */}
          {state !== 'idle' && (
            <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-6">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 rounded-full",
                  state === 'focus' ? 'bg-timer-active' :
                  state === 'break' ? 'bg-timer-warning' : 'bg-block-break'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {state === 'idle' ? (
              <>
                <Button size="lg" onClick={startFocus} className="gap-2">
                  <Play className="w-5 h-5" />
                  Start Focus (25 min)
                </Button>
              </>
            ) : (
              <>
                {isRunning ? (
                  <Button size="lg" variant="outline" onClick={pause} className="gap-2">
                    <Pause className="w-5 h-5" />
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={resume} className="gap-2">
                    <Play className="w-5 h-5" />
                    Resume
                  </Button>
                )}
                
                <Button size="lg" variant="outline" onClick={skip} className="gap-2">
                  <SkipForward className="w-5 h-5" />
                  Skip
                </Button>
                
                <Button size="lg" variant="ghost" onClick={stop}>
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      i < (completedToday % 4) || (completedToday > 0 && completedToday % 4 === 0 && i < 4)
                        ? "bg-timer-active" 
                        : "bg-border"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {completedToday % 4}/4 to long break
              </span>
            </div>
            
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{completedToday}</span>
              <span className="text-sm text-muted-foreground ml-1">
                🍅 today
              </span>
            </div>
          </div>
          
          {state === 'idle' && completedToday > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                {completedToday * 25} minutes of focused work today!
              </p>
            </div>
          )}

          {/* Quick break buttons when idle */}
          {state === 'idle' && (
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => startBreak(false)}
              >
                <Coffee className="w-4 h-4 mr-1" />
                5 min break
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => startBreak(true)}
              >
                <Coffee className="w-4 h-4 mr-1" />
                15 min break
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
