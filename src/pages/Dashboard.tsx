import { useState, useEffect } from 'react';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useAlerts } from '@/hooks/useAlerts';
import { useDailyReview } from '@/hooks/useDailyReview';
import { useCustomSchedule } from '@/hooks/useCustomSchedule';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { CountdownTimer } from '@/components/CountdownTimer';
import { CurrentBlockDisplay } from '@/components/CurrentBlockDisplay';
import { ScheduleTimeline } from '@/components/ScheduleTimeline';
import { TaskList } from '@/components/TaskList';
import { BlockAlertModal } from '@/components/BlockAlertModal';
import { DailyReviewModal } from '@/components/DailyReviewModal';
import { WeeklyOverviewModal } from '@/components/WeeklyOverviewModal';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { PomodoroModal } from '@/components/PomodoroModal';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Clock, ClipboardList, Moon, Settings, BarChart3, CheckCircle, XCircle, Target, PictureInPicture2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePiP } from '@/hooks/usePiP';
import { useWakeLock } from '@/hooks/useWakeLock';
import { MiniTimer } from '@/components/MiniTimer';
import { AppLayout } from '@/components/AppLayout';

const Dashboard = () => {
  const { isSupported: isPiPSupported, requestPiP, pipWindow, PiPContent } = usePiP();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  
  const { schedule, isLoaded } = useCustomSchedule();
  const { currentBlock, nextBlock, remainingTime, currentTime, isBlockTransition } = useCurrentTime(schedule);
  const { alert, dismissAlert } = useAlerts(currentBlock, nextBlock, isBlockTransition, !!pipWindow);
  const { isOpen: isReviewOpen, openReview, closeReview } = useDailyReview();
  const { stats, markBlockComplete, markBlockSkipped, undoCompletion } = useWeeklyStats();
  
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  // Request Wake Lock on mount to prevent throttling/sleep
  useEffect(() => {
    requestWakeLock();
    return () => {
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  const formattedCurrentTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Sleep state
  if (!currentBlock || currentBlock.type === 'sleep') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <NotificationPrompt />
        <div className="text-center max-w-md">
          <Moon className="w-16 h-16 text-block-sleep mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Rest Time</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You should be sleeping. Get proper rest to perform your best tomorrow.
          </p>
          <p className="text-muted-foreground">
            Schedule resumes at 9:00 AM
          </p>
        </div>
      </div>
    );
  }

  // Check if current block is a work block (not break/morning)
  const isWorkBlock = currentBlock.type !== 'break' && currentBlock.type !== 'morning';

  // Check if current block is already done
  const today = new Date().toISOString().split('T')[0];
  const completionStatus = currentBlock ? stats.find(s => s.blockId === currentBlock.id && s.date === today && (s.completed || s.skipped)) : null;

  return (
    <AppLayout>
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Gradient/Mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

      {/* Notification Prompt */}
      <NotificationPrompt />
      
      {/* Alert Modal */}
      <BlockAlertModal
        isVisible={alert.isVisible}
        type={alert.type}
        block={alert.block}
        nextBlock={alert.nextBlock}
        message={alert.message}
        onDismiss={dismissAlert}
      />

      {/* Daily Review Modal */}
      <DailyReviewModal isOpen={isReviewOpen} onClose={closeReview} />
      
      {/* Weekly Overview Modal */}
      <WeeklyOverviewModal isOpen={isWeeklyOpen} onClose={() => setIsWeeklyOpen(false)} />

      {/* Pomodoro Modal */}
      <PomodoroModal 
        isOpen={isPomodoroOpen} 
        onClose={() => setIsPomodoroOpen(false)}
        blockName={currentBlock.name}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">Daily Execution</h1>
                <p className="text-sm text-muted-foreground font-medium">{formattedCurrentTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWeeklyOpen(true)}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
                title="Weekly Overview"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={openReview}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Daily Review</span>
              </Button>
              
              <Link to="/settings">
                <Button variant="ghost" size="icon" title="Settings" className="hover:bg-primary/10 hover:text-primary">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Timer and Current Block */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timer Card */}
            <div className="glass rounded-3xl p-10 text-center animate-fade-in relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
               
               {completionStatus ? (
                   <div className="py-8 animate-fade-in">
                        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Block Completed!</h2>
                        <p className="text-muted-foreground text-lg mb-6">
                            Great job! You've finished <span className="text-foreground font-medium">"{currentBlock?.name}"</span>.
                        </p>
                        <div className="p-4 bg-muted/20 rounded-xl inline-block mb-6">
                             <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Up Next</p>
                             <p className="text-xl font-medium">{nextBlock ? nextBlock.name : "End of Day"}</p>
                             {nextBlock && <p className="text-sm opacity-70">Starts at {nextBlock.startHour > 12 ? nextBlock.startHour - 12 : nextBlock.startHour}:{nextBlock.startMinute.toString().padStart(2, '0')} {nextBlock.startHour >= 12 ? 'PM' : 'AM'}</p>}
                        </div>
                        
                        <div>
                            <Button 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => undoCompletion(currentBlock.id)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/><path d="M3 3v9h9"/></svg>
                                Resume Block
                            </Button>
                        </div>
                   </div>
               ) : (
                  <>
                    <CountdownTimer
                        hours={remainingTime.hours}
                        minutes={remainingTime.minutes}
                        seconds={remainingTime.seconds}
                        totalSeconds={remainingTime.totalSeconds}
                    />
        
                    {isPiPSupported && !pipWindow && (
                        <p className="text-xs text-muted-foreground mt-4 opacity-70">
                            Click the icon <PictureInPicture2 className="w-3 h-3 inline mx-1" /> in the top-right to pop out the timer.
                        </p>
                    )}
                  </>
               )}

               {/* PiP Button */}
               {isPiPSupported && !pipWindow && !completionStatus && (
                 <div className="absolute top-4 right-4 z-20">
                     <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => requestPiP(320, 180)}
                         title="Open Mini Player (Always on Top)"
                         className="text-muted-foreground hover:text-primary bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-sm"
                     >
                         <PictureInPicture2 className="w-5 h-5" />
                     </Button>
                 </div>
               )}
              
              {/* Pomodoro Button - Only for work blocks and if not completed */}
              {isWorkBlock && !completionStatus && (
                <div className="mt-8 pt-8 border-t border-border/50 flex justify-center">
                  <Button 
                    onClick={() => setIsPomodoroOpen(true)}
                    className="gap-2 rounded-full px-8 py-6 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                  >
                    <Target className="w-5 h-5" />
                    Start Pomodoro Focus
                  </Button>
                </div>
              )}
            </div>

            {/* Render Mini Player Portal */}
            <PiPContent>
                <MiniTimer 
                    hours={remainingTime.hours}
                    minutes={remainingTime.minutes}
                    seconds={remainingTime.seconds}
                    currentBlock={currentBlock}
                    nextBlock={nextBlock}
                    onCompleteBlock={() => markBlockComplete(currentBlock.id, currentBlock.name)}
                />
            </PiPContent>

            {/* Current Block Info */}
            <div className="glass rounded-3xl p-8 animate-slide-up delay-100">
              <CurrentBlockDisplay block={currentBlock} nextBlock={nextBlock} />
            </div>

            {/* Quick Actions for Block Tracking */}
            <div className="glass rounded-2xl p-6 animate-slide-up delay-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Block Status</span>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-timer-active/20 hover:bg-timer-active/10 hover:text-timer-active transition-colors"
                    onClick={() => markBlockComplete(currentBlock.id, currentBlock.name)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => markBlockSkipped(currentBlock.id, currentBlock.name)}
                  >
                    <XCircle className="w-4 h-4" />
                    Skip
                  </Button>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="glass rounded-3xl p-8 animate-slide-up delay-300">
              <TaskList block={currentBlock} currentBlock={currentBlock} />
            </div>
          </div>

          {/* Right Column - Schedule Timeline */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-28 animate-slide-up delay-100 h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              <ScheduleTimeline
                blocks={schedule}
                currentBlockId={currentBlock?.id || null}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
    </AppLayout>
  );
};

export default Dashboard;