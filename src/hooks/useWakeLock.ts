import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported] = useState(() => 'wakeLock' in navigator);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      
      lock.addEventListener('release', () => {
        setWakeLock(null);
      });
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }, [wakeLock]);

  // Re-request wake lock if visibility changes (browser often breaks lock on hide)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        // Optionally auto-request if it was previously active, 
        // but for this app we'll just expose the request function.
        // Or better: ensure we have it if we want it.
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock]);

  return {
    isSupported,
    wakeLock,
    requestWakeLock,
    releaseWakeLock
  };
}
