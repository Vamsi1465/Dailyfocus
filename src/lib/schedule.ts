export type BlockType = 
  | 'morning' 
  | 'agency' 
  | 'trading' 
  | 'break' 
  | 'content' 
  | 'meeting' 
  | 'sleep'
  | string;

export interface TimeBlock {
  id: string;
  name: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  type: BlockType;
  tasks: string[];
  lockedCategories: BlockType[];
}

export const DAILY_SCHEDULE: TimeBlock[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine & Breakfast',
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: 'morning',
    tasks: [
      'Wake up and freshen up',
      'Healthy breakfast',
      'Review today\'s schedule',
      'Quick meditation or stretching'
    ],
    lockedCategories: ['agency', 'trading', 'content']
  },
  {
    id: 'agency-meeting',
    name: 'Agency Meeting',
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 0,
    type: 'meeting',
    tasks: [
      'Team sync call',
      'Review project updates',
      'Assign tasks',
      'Address blockers'
    ],
    lockedCategories: ['trading']
  },
  {
    id: 'deep-agency-work',
    name: 'Deep Agency Work',
    startHour: 11,
    startMinute: 0,
    endHour: 13,
    endMinute: 0,
    type: 'agency',
    tasks: [
      'Build automation workflows',
      'Improve existing systems',
      'Learn one new tool',
      'Complete client deliverables'
    ],
    lockedCategories: ['trading']
  },
  {
    id: 'lunch-break',
    name: 'Lunch Break',
    startHour: 13,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    type: 'break',
    tasks: [
      'Have a proper meal',
      'Short walk if possible',
      'Rest and recharge'
    ],
    lockedCategories: ['agency', 'trading', 'content', 'meeting']
  },
  {
    id: 'trading-learning',
    name: 'Trading Learning',
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    type: 'trading',
    tasks: [
      'Study trading strategy',
      'Backtest setups',
      'Take detailed notes',
      'Review market analysis'
    ],
    lockedCategories: ['agency']
  },
  {
    id: 'trading-practice',
    name: 'Trading Practice',
    startHour: 15,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    type: 'trading',
    tasks: [
      'Execute practice trades',
      'Journal each trade',
      'Review performance',
      'Note lessons learned'
    ],
    lockedCategories: ['agency']
  },
  {
    id: 'agency-outreach',
    name: 'Agency Outreach & Content',
    startHour: 16,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    type: 'content',
    tasks: [
      'Cold outreach to prospects',
      'Content creation',
      'Social media engagement',
      'Follow up on leads'
    ],
    lockedCategories: ['trading']
  },
  {
    id: 'evening-break',
    name: 'Break',
    startHour: 20,
    startMinute: 0,
    endHour: 20,
    endMinute: 30,
    type: 'break',
    tasks: [
      'Relax and unwind',
      'Light stretching',
      'Prepare for evening'
    ],
    lockedCategories: ['agency', 'trading', 'content', 'meeting']
  },
  {
    id: 'instagram-reels',
    name: 'Instagram Reels Creation',
    startHour: 20,
    startMinute: 30,
    endHour: 21,
    endMinute: 0,
    type: 'content',
    tasks: [
      'Create new reel content',
      'Edit and polish videos',
      'Post and engage',
      'Reply to comments'
    ],
    lockedCategories: ['trading']
  },
  {
    id: 'dinner',
    name: 'Dinner',
    startHour: 21,
    startMinute: 0,
    endHour: 22,
    endMinute: 0,
    type: 'break',
    tasks: [
      'Have dinner',
      'Family or personal time',
      'Light entertainment'
    ],
    lockedCategories: ['agency', 'trading', 'content', 'meeting']
  },
  {
    id: 'team-meeting',
    name: 'Team Meeting',
    startHour: 22,
    startMinute: 0,
    endHour: 23,
    endMinute: 0,
    type: 'meeting',
    tasks: [
      'Evening team sync',
      'Review day\'s progress',
      'Plan next day priorities',
      'Address urgent items'
    ],
    lockedCategories: ['trading']
  },
  {
    id: 'night-work',
    name: 'Night Work Session',
    startHour: 23,
    startMinute: 0,
    endHour: 2,
    endMinute: 0,
    type: 'agency',
    tasks: [
      'Agency work continuation',
      'Job preparation',
      'Tech exploration',
      'Content writing',
      'Learning new skills'
    ],
    lockedCategories: ['trading']
  },
  {
    id: 'sleep',
    name: 'Sleep Time',
    startHour: 2,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    type: 'sleep',
    tasks: [
      'Rest and recover',
      'Recharge for tomorrow'
    ],
    lockedCategories: ['agency', 'trading', 'content', 'meeting', 'morning']
  }
];

export function timeToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return timeToMinutes(now.getHours(), now.getMinutes());
}

export function getBlockTimeInMinutes(block: TimeBlock, type: 'start' | 'end'): number {
  if (type === 'start') {
    return timeToMinutes(block.startHour, block.startMinute);
  }
  // Handle blocks that end after midnight
  let endMinutes = timeToMinutes(block.endHour, block.endMinute);
  if (block.endHour < block.startHour) {
    endMinutes += 24 * 60; // Add 24 hours
  }
  return endMinutes;
}

export function getCurrentBlock(): TimeBlock | null {
  const currentMinutes = getCurrentTimeInMinutes();
  
  for (const block of DAILY_SCHEDULE) {
    const startMinutes = getBlockTimeInMinutes(block, 'start');
    let endMinutes = getBlockTimeInMinutes(block, 'end');
    
    // Handle overnight blocks
    if (block.endHour < block.startHour) {
      // For blocks crossing midnight
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

export function getNextBlock(currentBlock: TimeBlock | null): TimeBlock | null {
  if (!currentBlock) return DAILY_SCHEDULE[0];
  
  const currentIndex = DAILY_SCHEDULE.findIndex(b => b.id === currentBlock.id);
  if (currentIndex === -1) return DAILY_SCHEDULE[0];
  
  const nextIndex = (currentIndex + 1) % DAILY_SCHEDULE.length;
  return DAILY_SCHEDULE[nextIndex];
}

export function getRemainingTime(block: TimeBlock): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  const now = new Date();
  const currentMinutes = getCurrentTimeInMinutes();
  const currentSeconds = now.getSeconds();
  
  let endMinutes = getBlockTimeInMinutes(block, 'end');
  
  // Handle overnight blocks
  if (block.endHour < block.startHour) {
    if (currentMinutes >= getBlockTimeInMinutes(block, 'start')) {
      endMinutes = timeToMinutes(block.endHour, block.endMinute) + 24 * 60;
    } else {
      endMinutes = timeToMinutes(block.endHour, block.endMinute);
    }
  }
  
  const remainingMinutes = endMinutes - currentMinutes - 1;
  const remainingSeconds = 60 - currentSeconds;
  
  const totalSeconds = remainingMinutes * 60 + remainingSeconds;
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds, totalSeconds: Math.max(0, totalSeconds) };
}

export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export function getBlockColor(type: BlockType): string {
  const colors: Record<string, string> = {
    morning: 'bg-block-morning',
    agency: 'bg-block-agency',
    trading: 'bg-block-trading',
    break: 'bg-block-break',
    content: 'bg-block-content',
    meeting: 'bg-block-meeting',
    sleep: 'bg-block-sleep'
  };
  return colors[type] || 'bg-primary/50';
}

export function getBlockIndicatorClass(type: BlockType): string {
  const classes: Record<string, string> = {
    morning: 'block-indicator-morning',
    agency: 'block-indicator-agency',
    trading: 'block-indicator-trading',
    break: 'block-indicator-break',
    content: 'block-indicator-content',
    meeting: 'block-indicator-meeting',
    sleep: 'block-indicator-sleep'
  };
  return classes[type] || 'bg-foreground'; 
}

export function isBlockLocked(currentBlock: TimeBlock | null, checkType: BlockType): boolean {
  if (!currentBlock) return false;
  return currentBlock.lockedCategories.includes(checkType);
}
