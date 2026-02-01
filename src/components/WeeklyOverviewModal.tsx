import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { DAILY_SCHEDULE, getBlockIndicatorClass } from '@/lib/schedule';
import { X, CheckCircle, XCircle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeeklyOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyOverviewModal({ isOpen, onClose }: WeeklyOverviewModalProps) {
  const { getWeeklyData } = useWeeklyStats();
  const weeklyData = getWeeklyData();
  
  // Only show work blocks (not sleep/break)
  const workBlocks = DAILY_SCHEDULE.filter(b => b.type !== 'sleep' && b.type !== 'break');

  const getDayName = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    
    if (dateStr === today) return 'Today';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (!isOpen) return null;

  // Calculate totals
  const totalCompleted = weeklyData.reduce((sum, d) => sum + d.completedBlocks.length, 0);
  const totalSkipped = weeklyData.reduce((sum, d) => sum + d.skippedBlocks.length, 0);
  const totalPossible = workBlocks.length * 7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80">
      <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full mx-4 alert-enter max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Weekly Overview</h2>
            <p className="text-sm text-muted-foreground">Past 7 days performance</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-timer-active">{totalCompleted}</div>
            <div className="text-sm text-muted-foreground">Blocks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-timer-urgent">{totalSkipped}</div>
            <div className="text-sm text-muted-foreground">Blocks Skipped</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">
              {totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-sm font-medium text-muted-foreground sticky left-0 bg-card">
                    Block
                  </th>
                  {weeklyData.map((day, index) => (
                    <th key={day.date} className="px-2 py-2 text-center min-w-[60px]">
                      <div className="text-sm font-medium text-foreground">{getDayName(day.date, index)}</div>
                      <div className="text-xs text-muted-foreground">{getDateDisplay(day.date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workBlocks.map((block) => (
                  <tr key={block.id} className="border-t border-border">
                    <td className="py-3 pr-4 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", getBlockIndicatorClass(block.type))} />
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {block.name}
                        </span>
                      </div>
                    </td>
                    {weeklyData.map((day) => {
                      const isCompleted = day.completedBlocks.includes(block.id);
                      const isSkipped = day.skippedBlocks.includes(block.id);
                      
                      return (
                        <td key={`${block.id}-${day.date}`} className="px-2 py-3 text-center">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-timer-active mx-auto" />
                          ) : isSkipped ? (
                            <XCircle className="w-5 h-5 text-timer-urgent mx-auto" />
                          ) : (
                            <Minus className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCompleted === 0 && totalSkipped === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data yet. Complete or skip blocks to see your progress.</p>
              <p className="text-sm mt-2">Mark blocks as complete using the task checkboxes.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-timer-active" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-timer-urgent" />
            <span>Skipped</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-muted-foreground/30" />
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
