import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getCurrentBlock as getDefaultCurrentBlock, 
  getNextBlock as getDefaultNextBlock, 
  getRemainingTime, 
  TimeBlock,
  timeToMinutes,
  getBlockTimeInMinutes
} from '@/lib/schedule';

interface UseCurrentTimeReturn {
  currentBlock: TimeBlock | null;
  nextBlock: TimeBlock | null;
  remainingTime: { hours: number; minutes: number; seconds: number; totalSeconds: number };
  currentTime: Date;
  isBlockTransition: boolean;
}

// Helper to get current block from custom schedule
function getCurrentBlockFromSchedule(schedule: TimeBlock[]): TimeBlock | null {
  const now = new Date();
  const currentMinutes = timeToMinutes(now.getHours(), now.getMinutes());
  
  for (const block of schedule) {
    const startMinutes = getBlockTimeInMinutes(block, 'start');
    const endMinutes = getBlockTimeInMinutes(block, 'end');
    
    // Handle overnight blocks
    if (block.endHour < block.startHour) {
      if (currentMinutes >= startMinutes || currentMinutes < timeToMinutes(block.endHour, block.endMinute)) {
        return block;
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return block;
      }
    }
  }
  
  return null;
}

function getNextBlockFromSchedule(schedule: TimeBlock[], currentBlock: TimeBlock | null): TimeBlock | null {
  if (!currentBlock) return schedule[0];
  
  const currentIndex = schedule.findIndex(b => b.id === currentBlock.id);
  if (currentIndex === -1) return schedule[0];
  
  const nextIndex = (currentIndex + 1) % schedule.length;
  return schedule[nextIndex];
}

export function useCurrentTime(customSchedule?: TimeBlock[]): UseCurrentTimeReturn {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentBlock, setCurrentBlock] = useState<TimeBlock | null>(null);
  const [isBlockTransition, setIsBlockTransition] = useState(false);
  const lastBlockId = useRef<string | null>(null);
  const schedule = customSchedule;

  const updateTime = useCallback(() => {
    setCurrentTime(new Date());
    const block = schedule 
      ? getCurrentBlockFromSchedule(schedule) 
      : getDefaultCurrentBlock();
    
    // Detect block transition
    if (block && block.id !== lastBlockId.current) {
      if (lastBlockId.current !== null) {
        setIsBlockTransition(true);
        setTimeout(() => setIsBlockTransition(false), 100);
      }
      lastBlockId.current = block.id;
    }
    
    setCurrentBlock(block);
  }, [schedule]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [updateTime]);

  const nextBlock = schedule 
    ? getNextBlockFromSchedule(schedule, currentBlock)
    : getDefaultNextBlock(currentBlock);
    
  const remainingTime = currentBlock 
    ? getRemainingTime(currentBlock) 
    : { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };

  return {
    currentBlock,
    nextBlock,
    remainingTime,
    currentTime,
    isBlockTransition
  };
}
