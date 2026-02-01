import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeBlock, formatTime } from '@/lib/schedule';

interface AlertState {
  isVisible: boolean;
  type: 'start' | 'end';
  block: TimeBlock | null;
  nextBlock: TimeBlock | null;
  message: string;
}


export type SoundType = 'beep' | 'chime' | 'electronic';
const SOUND_STORAGE_KEY = 'daily-focus-sound-type';

interface AlertState {
  isVisible: boolean;
  type: 'start' | 'end';
  block: TimeBlock | null;
  nextBlock: TimeBlock | null;
  message: string;
}

export function useAlerts(
  currentBlock: TimeBlock | null,
  nextBlock: TimeBlock | null,
  isBlockTransition: boolean,
  hasActivePiP: boolean = false
) {
  const [alert, setAlert] = useState<AlertState>({
    isVisible: false,
    type: 'start',
    block: null,
    nextBlock: null,
    message: ''
  });
  
  const [soundType, setSoundType] = useState<SoundType>('beep');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasShownStartAlert = useRef<string | null>(null);
  const notificationPermission = useRef<NotificationPermission>('default');

  // Load sound preference
  useEffect(() => {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    if (saved && ['beep', 'chime', 'electronic'].includes(saved)) {
        setSoundType(saved as SoundType);
    }
  }, []);

  const changeSoundType = useCallback((type: SoundType) => {
      setSoundType(type);
      localStorage.setItem(SOUND_STORAGE_KEY, type);
      // Play preview
      playAlertSound(type);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermission.current = permission;
      });
    }
  }, []);

  const activeOscillators = useRef<any[]>([]);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio Context lazily
  const getAudioContext = () => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      return audioContextRef.current;
  };

  const stopAlarm = useCallback(() => {
      if (loopIntervalRef.current) {
          clearInterval(loopIntervalRef.current);
          loopIntervalRef.current = null;
      }
      
      activeOscillators.current.forEach(node => {
          try {
              node.stop();
              node.disconnect();
          } catch (e) { /* ignore */ }
      });
      activeOscillators.current = [];
  }, []);

  const playAlertSound = useCallback((type: SoundType = soundType, isLooping = false) => {
      // Logic: Play sound if Tab is Visible OR PiP is Active.
      // If Tab is Hidden (background) AND No PiP -> Mute.
      const isVisible = !document.hidden;
      const shouldPlay = isVisible || hasActivePiP;

      if (!shouldPlay) {
          console.log('Alarm suppressed: Tab hidden and no PiP.');
          return; 
      }

      try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        stopAlarm(); // Stop any previous sounds

        const now = ctx.currentTime;
        // Increase duration for non-looping, or use interval for looping
        // For simplicity, we'll make the "Loop" just a long repetition sequence or actual WebAudio loop
        // The user requested "Long alarm". We will repeat the pattern for 10 seconds or until stopped.
        
        const playPattern = (startTime: number) => {
            if (type === 'beep') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(800, startTime);
                osc.type = 'sine';
                
                // Increased volume
                gain.gain.setValueAtTime(0.8, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                
                osc.start(startTime);
                osc.stop(startTime + 0.5);
                activeOscillators.current.push(osc);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.setValueAtTime(1000, startTime + 0.2);
                osc2.type = 'sine';
                
                // Increased volume
                gain2.gain.setValueAtTime(0.8, startTime + 0.2);
                gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.7);
                
                osc2.start(startTime + 0.2);
                osc2.stop(startTime + 0.7);
                activeOscillators.current.push(osc2);

            } else if (type === 'chime') {
                 // Harmonic Chime
                 const frequencies = [523.25, 659.25, 783.99]; // C Major
                 frequencies.forEach((freq, i) => {
                     const osc = ctx.createOscillator();
                     const gain = ctx.createGain();
                     osc.connect(gain);
                     gain.connect(ctx.destination);
                     osc.frequency.setValueAtTime(freq, startTime + (i * 0.1));
                     osc.type = 'triangle';
                     
                     // Increased volume
                     gain.gain.setValueAtTime(0.6, startTime + (i * 0.1));
                     gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.0);
                     
                     osc.start(startTime + (i * 0.1));
                     osc.stop(startTime + 3.0);
                     activeOscillators.current.push(osc);
                 });

            } else if (type === 'electronic') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(440, startTime);
                osc.frequency.linearRampToValueAtTime(880, startTime + 0.1);
                osc.type = 'square';
                
                // Increased volume
                gain.gain.setValueAtTime(0.5, startTime);
                gain.gain.linearRampToValueAtTime(0, startTime + 0.2);
                
                osc.start(startTime);
                osc.stop(startTime + 0.2);
                activeOscillators.current.push(osc);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.setValueAtTime(880, startTime + 0.15);
                osc2.frequency.linearRampToValueAtTime(1760, startTime + 0.25);
                osc2.type = 'square';
                
                // Increased volume
                gain2.gain.setValueAtTime(0.5, startTime + 0.15);
                gain2.gain.linearRampToValueAtTime(0, startTime + 0.35);
                
                osc2.start(startTime + 0.15);
                osc2.stop(startTime + 0.35);
                activeOscillators.current.push(osc2);
            }
        };

        // If looping (for actual alarm), using setInterval for continuous loop
        if (isLooping) {
            playPattern(now); // Play immediate first
            
            // Loop every 2 seconds
            const id = setInterval(() => {
                 // Re-check visibility in loop just to be safe (optional, but good for robust mute)
                 if (document.hidden && !hasActivePiP) {
                     // Maybe stop? For now just continue pattern to match simple requirement
                 }
                 playPattern(getAudioContext().currentTime);
            }, 2000);
            
            loopIntervalRef.current = id;
        } else {
            // Just once for preview
            playPattern(now);
        }

      } catch (e) {
        console.log('Audio not supported', e);
      }
  }, [soundType, stopAlarm, hasActivePiP]);


  const showNotification = useCallback((title: string, body: string) => {
    if (notificationPermission.current === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          requireInteraction: true
        });
      } catch (e) {
        console.log('Notification error', e);
      }
    }
  }, []);

  const playSound = useCallback(() => {
      playAlertSound(soundType, true); // Play with looping
  }, [playAlertSound, soundType]);

  const dismissAlert = useCallback(() => {
    stopAlarm();
    setAlert(prev => ({ ...prev, isVisible: false }));
  }, [stopAlarm]);

  // Show alert on block transition
  useEffect(() => {
    if (isBlockTransition && currentBlock && hasShownStartAlert.current !== currentBlock.id) {
      const timeStr = formatTime(currentBlock.startHour, currentBlock.startMinute);
      const message = `It's ${timeStr}. Start ${currentBlock.name} now.`;
      
      // Skip alarm for sleep blocks
      if (currentBlock.type?.toLowerCase() !== 'sleep') {
        playSound();
      }
      showNotification('Time Block Started', message);
      
      setAlert({
        isVisible: true,
        type: 'start',
        block: currentBlock,
        nextBlock: nextBlock,
        message
      });
      
      hasShownStartAlert.current = currentBlock.id;
    }
  }, [isBlockTransition, currentBlock, nextBlock, playSound, showNotification]);

  // Check for block end (when remaining time is very low)
  useEffect(() => {
    if (!currentBlock) return;
    
    const checkBlockEnd = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const endMinutes = currentBlock.endHour * 60 + currentBlock.endMinute;
      
      // Check if we're at exactly the end minute
      if (currentMinutes === endMinutes && now.getSeconds() === 0) {
        const message = `${currentBlock.name} is complete. Next: ${nextBlock?.name || 'None'}`;
        
        // Skip alarm for sleep blocks
        if (currentBlock.type?.toLowerCase() !== 'sleep') {
          playSound();
        }
        showNotification('Block Complete', message);
      }
    };
    
    const interval = setInterval(checkBlockEnd, 1000);
    return () => clearInterval(interval);
  }, [currentBlock, nextBlock, playSound, showNotification]);

  return {
    alert,
    dismissAlert,
    playSound,
    soundType,
    changeSoundType
  };
}
