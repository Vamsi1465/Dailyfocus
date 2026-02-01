import { useState, useEffect, useCallback } from 'react';
import { TimeBlock, DAILY_SCHEDULE as DEFAULT_SCHEDULE } from '@/lib/schedule';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/lib/deviceId';
import { useToast } from '@/hooks/use-toast';

export function useCustomSchedule() {
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const deviceId = getDeviceId();

  const fetchSchedule = useCallback(async () => {
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', deviceId)
      .order('start_hour', { ascending: true })
      .order('start_minute', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
      // Fallback to default if error (or offline)
      if (schedule.length === 0) setSchedule(DEFAULT_SCHEDULE);
    } else {
      if (data && data.length > 0) {
        // Map DB fields to local TimeBlock model if needed (DB is snake_case)
        const mapped: TimeBlock[] = data.map(d => ({
            id: d.id,
            name: d.name,
            startHour: d.start_hour,
            startMinute: d.start_minute,
            endHour: d.end_hour,
            endMinute: d.end_minute,
            type: d.type,
            lockedCategories: d.locked_categories,
            tasks: d.tasks || [] 
        }));
        setSchedule(mapped);
      } else {
        // First time user? Saving default schedule to DB is optional but helpful
        setSchedule(DEFAULT_SCHEDULE);
      }
    }
    setIsLoaded(true);
  }, [deviceId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const updateBlock = useCallback(async (blockId: string, updates: Partial<TimeBlock>) => {
    // Optimistic Update
    setSchedule(prev => prev.map(block => block.id === blockId ? { ...block, ...updates } : block));

    // Convert camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.startHour !== undefined) dbUpdates.start_hour = updates.startHour;
    if (updates.startMinute !== undefined) dbUpdates.start_minute = updates.startMinute;
    if (updates.endHour !== undefined) dbUpdates.end_hour = updates.endHour;
    if (updates.endMinute !== undefined) dbUpdates.end_minute = updates.endMinute;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.lockedCategories !== undefined) dbUpdates.locked_categories = updates.lockedCategories;
    if (updates.tasks !== undefined) dbUpdates.tasks = updates.tasks;

    const { error } = await supabase
      .from('time_blocks')
      .update(dbUpdates)
      .eq('id', blockId);

    if (error) {
        toast({ title: "Failed to save block update", variant: "destructive" });
        fetchSchedule(); // Revert
    }
  }, [toast, fetchSchedule]);

  const updateBlockTime = useCallback((
    blockId: string, 
    startHour: number, 
    startMinute: number, 
    endHour: number, 
    endMinute: number
  ) => {
    updateBlock(blockId, { startHour, startMinute, endHour, endMinute });
  }, [updateBlock]);

  const resetToDefault = useCallback(async () => {
    // Delete all blocks for this user
    await supabase.from('time_blocks').delete().eq('user_id', deviceId);
    
    // In a real app we might re-insert defaults, but for now just setting local state
    // Ideally we re-insert the DEFAULT_SCHEDULE into the DB
    
    // Let's just set local state for responsiveness and clear DB
    setSchedule(DEFAULT_SCHEDULE);
    
    // Optional: Re-populate DB with defaults
    const dbBlocks = DEFAULT_SCHEDULE.map(b => ({
       user_id: deviceId,
       name: b.name,
       start_hour: b.startHour,
       start_minute: b.startMinute,
       end_hour: b.endHour,
       end_minute: b.endMinute,
       type: b.type,
       locked_categories: b.lockedCategories,
       tasks: b.tasks
    }));
    await supabase.from('time_blocks').insert(dbBlocks);

  }, [deviceId]);

  const saveSchedule = useCallback(async (newSchedule: TimeBlock[]) => {
    // This might be heavy - replacing all. Better to use individual adds/updates.
    // Use for bulk reordering or resets.
    setSchedule(newSchedule);
    
    // Simple Sync: Delete all and re-insert (safe for small schedules)
    await supabase.from('time_blocks').delete().eq('user_id', deviceId);
    
    const dbBlocks = newSchedule.map(b => ({
       user_id: deviceId,
       name: b.name,
       start_hour: b.startHour,
       start_minute: b.startMinute,
       end_hour: b.endHour,
       end_minute: b.endMinute,
       type: b.type,
       locked_categories: b.lockedCategories,
       tasks: b.tasks
    }));
    
    const { error } = await supabase.from('time_blocks').insert(dbBlocks);
    if (error) toast({ title: "Error saving schedule", variant: "destructive" });

  }, [deviceId, toast]);

  const addBlock = useCallback(async (block: TimeBlock) => {
    // Optimistic - add and sort by time
    setSchedule(prev => {
      const newSchedule = [...prev, block];
      // Sort by start time (hour, then minute)
      return newSchedule.sort((a, b) => {
        if (a.startHour !== b.startHour) {
          return a.startHour - b.startHour;
        }
        return a.startMinute - b.startMinute;
      });
    });

    const dbBlock = {
        // id: block.id, // Let DB generate ID or use block.id? Usually DB.
        // If we want to use the local ID, ensure it is UUID. The default schedule uses strings '1', '2'.
        // Better to let DB generate UUID or ensure local IDs are UUIDs.
        // For simplicity, let's omit ID and let DB gen, but that breaks mapping back to local 'id'.
        // So we should probably generate a UUID locally for the new block.
       user_id: deviceId,
       name: block.name,
       start_hour: block.startHour,
       start_minute: block.startMinute,
       end_hour: block.endHour,
       end_minute: block.endMinute,
       type: block.type,
       locked_categories: block.lockedCategories,
       tasks: block.tasks
    };

    const { data, error } = await supabase
       .from('time_blocks')
       .insert([dbBlock])
       .select()
       .single();

    if (error) {
        toast({ title: "Failed to add block", variant: "destructive" });
        fetchSchedule(); // Revert
    } else if (data) {
        // Update local with real DB ID
        setSchedule(prev => prev.map(b => b.id === block.id ? { ...b, id: data.id } : b));
    }
  }, [deviceId, toast, fetchSchedule]);

  const removeBlock = useCallback(async (blockId: string) => {
    setSchedule(prev => prev.filter(b => b.id !== blockId));
    
    const { error } = await supabase.from('time_blocks').delete().eq('id', blockId);
    if (error) {
        toast({ title: "Failed to delete block", variant: "destructive" });
        fetchSchedule();
    }
  }, [fetchSchedule, toast]);

  return {
    schedule,
    isLoaded,
    updateBlock,
    updateBlockTime,
    addBlock,
    removeBlock,
    resetToDefault,
    saveSchedule
  };
}
