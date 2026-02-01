import { useState, useEffect, useCallback } from 'react';

interface DailyReviewData {
  date: string;
  followedSchedule: boolean | null;
  skippedBlocks: string[];
  improvement: string;
  submittedAt: string | null;
}

const STORAGE_KEY = 'daily-execution-reviews';

export function useDailyReview() {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewData, setReviewData] = useState<DailyReviewData>({
    date: new Date().toISOString().split('T')[0],
    followedSchedule: null,
    skippedBlocks: [],
    improvement: '',
    submittedAt: null
  });
  const [hasTriggeredToday, setHasTriggeredToday] = useState(false);

  // Check if it's 11 PM and trigger review
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 0 && !hasTriggeredToday) {
        const todayDate = now.toISOString().split('T')[0];
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (stored) {
          try {
            const reviews: DailyReviewData[] = JSON.parse(stored);
            const todayReview = reviews.find(r => r.date === todayDate);
            
            if (!todayReview?.submittedAt) {
              setIsOpen(true);
              setHasTriggeredToday(true);
            }
          } catch (e) {
            setIsOpen(true);
            setHasTriggeredToday(true);
          }
        } else {
          setIsOpen(true);
          setHasTriggeredToday(true);
        }
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [hasTriggeredToday]);

  const openReview = useCallback(() => {
    setReviewData({
      date: new Date().toISOString().split('T')[0],
      followedSchedule: null,
      skippedBlocks: [],
      improvement: '',
      submittedAt: null
    });
    setIsOpen(true);
  }, []);

  const closeReview = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateReview = useCallback((updates: Partial<DailyReviewData>) => {
    setReviewData(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSkippedBlock = useCallback((blockId: string) => {
    setReviewData(prev => {
      const skipped = prev.skippedBlocks.includes(blockId)
        ? prev.skippedBlocks.filter(id => id !== blockId)
        : [...prev.skippedBlocks, blockId];
      return { ...prev, skippedBlocks: skipped };
    });
  }, []);

  const submitReview = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let reviews: DailyReviewData[] = [];
    
    if (stored) {
      try {
        reviews = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing reviews', e);
      }
    }
    
    const finalReview = {
      ...reviewData,
      submittedAt: new Date().toISOString()
    };
    
    // Update or add review
    const existingIndex = reviews.findIndex(r => r.date === finalReview.date);
    if (existingIndex >= 0) {
      reviews[existingIndex] = finalReview;
    } else {
      reviews.push(finalReview);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    setIsOpen(false);
  }, [reviewData]);

  const getReviewHistory = useCallback((): DailyReviewData[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }, []);

  return {
    isOpen,
    reviewData,
    openReview,
    closeReview,
    updateReview,
    toggleSkippedBlock,
    submitReview,
    getReviewHistory
  };
}
