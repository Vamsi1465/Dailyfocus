import React from 'react';

interface CountdownTimerProps {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function CountdownTimer({ hours, minutes, seconds, totalSeconds }: CountdownTimerProps) {
  // Determine timer state based on remaining time
  const getTimerState = () => {
    if (totalSeconds <= 60) return 'urgent'; // Last minute
    if (totalSeconds <= 300) return 'warning'; // Last 5 minutes
    return 'active';
  };

  const timerState = getTimerState();
  
  const timerColorClass = {
    active: 'text-timer-active',
    warning: 'text-timer-warning',
    urgent: 'text-timer-urgent'
  }[timerState];

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className={`timer-display text-8xl md:text-9xl font-light tracking-tighter tabular-nums transition-colors duration-500 ${timerColorClass} ${timerState === 'urgent' ? 'timer-pulse' : ''}`}>
        {hours > 0 && (
          <>
            <span>{formatNumber(hours)}</span>
            <span className="mx-2 opacity-50 font-thin">:</span>
          </>
        )}
        <span>{formatNumber(minutes)}</span>
        <span className="mx-2 opacity-50 font-thin pb-4">:</span>
        <span>{formatNumber(seconds)}</span>
      </div>
      <p className="mt-6 text-muted-foreground text-xl font-medium tracking-wide border px-4 py-1 rounded-full border-border/50 bg-background/30 backdrop-blur-sm">
        {timerState === 'urgent' ? '🔥 Final Sprint' : 
         timerState === 'warning' ? '⚠️ Wrapping Up' : 
         'Current Focus Session'}
      </p>
    </div>
  );
}
