import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/lib/deviceId';

interface BlockCompletion {
  blockId: string;
  blockName: string;
  date: string;
  completed: boolean;
  skipped: boolean;
}

interface DailyStats {
  date: string;
  completedBlocks: string[];
  skippedBlocks: string[];
}

export function useWeeklyStats() {
  const [stats, setStats] = useState<BlockCompletion[]>([]);
  const deviceId = getDeviceId();

  // Load stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const { data, error } = await supabase
            .from('block_completions')
            .select('*')
            .eq('user_id', deviceId)
            .gte('date', twoWeeksAgo.toISOString().split('T')[0]);

        if (error) {
            console.error('Error loading stats:', error);
        } else if (data) {
            const mapped: BlockCompletion[] = data.map(d => ({
                blockId: d.block_id, // Now using block_id from schema
                blockName: d.block_name,
                date: d.date,
                completed: d.status === 'completed', // Map status to boolean
                skipped: d.status === 'skipped'
            }));
            setStats(mapped);
        }
    };
    
    fetchStats();
  }, [deviceId]);

  const saveCompletion = async (completion: BlockCompletion) => {
      // Optimistic update
      setStats(prev => {
          const filtered = prev.filter(s => !(s.blockId === completion.blockId && s.date === completion.date));
          return [...filtered, completion];
      });

      const status = completion.skipped ? 'skipped' : 'completed';

      const { error } = await supabase
        .from('block_completions')
        .upsert({
            user_id: deviceId,
            block_id: completion.blockId,
            block_name: completion.blockName,
            date: completion.date,
            status: status,
            // completed_at is default now()
        }, { onConflict: 'user_id, block_id, date' });

      if (error) {
          console.error('Error saving completion:', error);
      }
  };

  const markBlockComplete = useCallback((blockId: string, blockName: string) => {
    const today = new Date().toISOString().split('T')[0];
    saveCompletion({
        blockId,
        blockName,
        date: today,
        completed: true,
        skipped: false
    });
  }, []);

  const markBlockSkipped = useCallback((blockId: string, blockName: string) => {
    const today = new Date().toISOString().split('T')[0];
    saveCompletion({
        blockId,
        blockName,
        date: today,
        completed: false,
        skipped: true
    });
  }, []);

  const getWeeklyData = useCallback((): DailyStats[] => {
    const result: DailyStats[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStats = stats.filter(s => s.date === dateStr);
      
      result.push({
        date: dateStr,
        completedBlocks: dayStats.filter(s => s.completed).map(s => s.blockId),
        skippedBlocks: dayStats.filter(s => s.skipped).map(s => s.blockId)
      });
    }
    
    return result;
  }, [stats]);

  const getBlockStats = useCallback((blockId: string) => {
    const weeklyData = getWeeklyData();
    const completed = weeklyData.filter(d => d.completedBlocks.includes(blockId)).length;
    const skipped = weeklyData.filter(d => d.skippedBlocks.includes(blockId)).length;
    
    return { completed, skipped, total: 7 };
  }, [getWeeklyData]);

  const undoCompletion = async (blockId: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Optimistic update
    setStats(prev => prev.filter(s => !(s.blockId === blockId && s.date === today)));

    const { error } = await supabase
        .from('block_completions')
        .delete()
        .match({
            user_id: deviceId,
            block_id: blockId,
            date: today
        });

    if (error) {
        console.error('Error undoing completion:', error);
    }
  };

  return {
    stats,
    markBlockComplete,
    markBlockSkipped,
    undoCompletion,
    getWeeklyData,
    getBlockStats
  };
}
