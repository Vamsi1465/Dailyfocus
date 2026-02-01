import { useState, useEffect, useCallback, useRef } from 'react';

type PomodoroState = 'idle' | 'focus' | 'break' | 'longBreak';

interface PomodoroSession {
  date: string;
  completedPomodoros: number;
  totalFocusMinutes: number;
}

const STORAGE_KEY = 'pomodoro-sessions';
const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const POMODOROS_BEFORE_LONG_BREAK = 4;

export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION);
  const [completedToday, setCompletedToday] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef<(() => void) | null>(null);

  // Load today's session
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const sessions: PomodoroSession[] = JSON.parse(stored);
        const todaySession = sessions.find(s => s.date === today);
        if (todaySession) {
          setCompletedToday(todaySession.completedPomodoros);
        }
      } catch (e) {
        console.error('Error loading pomodoro sessions', e);
      }
    }
  }, []);

  // Create audio function
  useEffect(() => {
    const playSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        
        // Play a pleasant chime
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          const startTime = audioContext.currentTime + index * 0.1;
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.8);
        });
      } catch (e) {
        console.log('Audio not supported', e);
      }
    };
    
    audioRef.current = playSound;
  }, []);

  const playSound = useCallback(() => {
    audioRef.current?.();
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) {
        console.log('Notification error', e);
      }
    }
  }, []);

  const saveSession = useCallback((completed: number) => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    let sessions: PomodoroSession[] = [];
    
    if (stored) {
      try {
        sessions = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing sessions', e);
      }
    }
    
    const existingIndex = sessions.findIndex(s => s.date === today);
    const session: PomodoroSession = {
      date: today,
      completedPomodoros: completed,
      totalFocusMinutes: completed * 25
    };
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    // Keep last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    sessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete
          playSound();
          
          if (state === 'focus') {
            const newCompleted = completedToday + 1;
            setCompletedToday(newCompleted);
            saveSession(newCompleted);
            
            // Determine break type
            const isLongBreak = newCompleted % POMODOROS_BEFORE_LONG_BREAK === 0;
            const nextState = isLongBreak ? 'longBreak' : 'break';
            const nextDuration = isLongBreak ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION;
            
            setState(nextState);
            showNotification(
              '🍅 Pomodoro Complete!', 
              isLongBreak ? 'Great work! Take a 15-minute break.' : 'Take a 5-minute break.'
            );
            
            return nextDuration;
          } else {
            // Break complete
            setState('idle');
            setIsRunning(false);
            showNotification('Break Over', 'Ready for another focus session?');
            return FOCUS_DURATION;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, state, completedToday, playSound, saveSession, showNotification]);

  const startFocus = useCallback(() => {
    setState('focus');
    setTimeRemaining(FOCUS_DURATION);
    setIsRunning(true);
  }, []);

  const startBreak = useCallback((isLong: boolean = false) => {
    setState(isLong ? 'longBreak' : 'break');
    setTimeRemaining(isLong ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setState('idle');
    setTimeRemaining(FOCUS_DURATION);
    setIsRunning(false);
  }, []);

  const skip = useCallback(() => {
    if (state === 'focus') {
      // Don't count skipped focus sessions
      setState('idle');
      setTimeRemaining(FOCUS_DURATION);
    } else {
      // Skip break
      setState('idle');
      setTimeRemaining(FOCUS_DURATION);
    }
    setIsRunning(false);
  }, [state]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    state,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    completedToday,
    isRunning,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    skip,
    progress: state === 'focus' 
      ? ((FOCUS_DURATION - timeRemaining) / FOCUS_DURATION) * 100
      : state === 'break'
      ? ((SHORT_BREAK_DURATION - timeRemaining) / SHORT_BREAK_DURATION) * 100
      : state === 'longBreak'
      ? ((LONG_BREAK_DURATION - timeRemaining) / LONG_BREAK_DURATION) * 100
      : 0
  };
}
