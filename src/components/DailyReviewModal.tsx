import { useDailyReview } from '@/hooks/useDailyReview';
import { DAILY_SCHEDULE } from '@/lib/schedule';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyReviewModal({ isOpen, onClose }: DailyReviewModalProps) {
  const {
    reviewData,
    updateReview,
    toggleSkippedBlock,
    submitReview
  } = useDailyReview();

  if (!isOpen) return null;

  const workBlocks = DAILY_SCHEDULE.filter(b => 
    b.type !== 'sleep' && b.type !== 'break'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-3xl shadow-2xl max-w-xl w-full mx-4 alert-enter max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between flex-shrink-0 bg-white/5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Daily Review</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-10 overflow-y-auto flex-1 scrollbar-thin">
          {/* Question 1: Did you follow the schedule? */}
          <div className="space-y-4">
            <p className="font-semibold text-lg text-foreground">
              Did you follow today's schedule?
            </p>
            <div className="flex gap-4">
              <Button
                variant={reviewData.followedSchedule === true ? "default" : "outline"}
                className={cn(
                  "flex-1 h-14 text-base rounded-xl transition-all duration-300",
                  reviewData.followedSchedule === true ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-transparent hover:bg-white/5"
                )}
                onClick={() => updateReview({ followedSchedule: true })}
              >
                <CheckCircle className="w-5 h-5 mr-3" />
                Yes, completely
              </Button>
              <Button
                variant={reviewData.followedSchedule === false ? "default" : "outline"}
                className={cn(
                  "flex-1 h-14 text-base rounded-xl transition-all duration-300",
                  reviewData.followedSchedule === false ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20" : "bg-transparent hover:bg-white/5"
                )}
                onClick={() => updateReview({ followedSchedule: false })}
              >
                <XCircle className="w-5 h-5 mr-3" />
                No, missed some
              </Button>
            </div>
          </div>

          {/* Question 2: Which blocks were skipped? */}
          <div className="space-y-4">
            <p className="font-semibold text-lg text-foreground">
              Which blocks were missed or incomplete?
            </p>
            <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin pr-2">
              {workBlocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => toggleSkippedBlock(block.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 text-left group",
                    reviewData.skippedBlocks.includes(block.id)
                      ? "border-destructive/50 bg-destructive/10 shadow-sm"
                      : "border-border/40 bg-white/5 hover:bg-white/10 hover:border-primary/30"
                  )}
                >
                  <span className={cn(
                    "font-medium transition-colors",
                    reviewData.skippedBlocks.includes(block.id)
                      ? "text-destructive"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {block.name}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    reviewData.skippedBlocks.includes(block.id)
                      ? "border-destructive bg-destructive text-white"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}>
                    {reviewData.skippedBlocks.includes(block.id) && <X className="w-3 h-3" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: One improvement for tomorrow */}
          <div className="space-y-4">
            <p className="font-semibold text-lg text-foreground">
              One improvement for tomorrow:
            </p>
            <Textarea
              value={reviewData.improvement}
              onChange={(e) => updateReview({ improvement: e.target.value })}
              placeholder="What's one thing you can do better tomorrow?"
              className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50 rounded-xl resize-none text-base p-4"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-border/50 flex-shrink-0 bg-white/5">
          <Button
            onClick={submitReview}
            className="w-full h-12 text-base rounded-xl font-medium shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
            size="lg"
            disabled={reviewData.followedSchedule === null}
          >
            Complete Daily Review
          </Button>
        </div>
      </div>
    </div>
  );
}
