import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getDeviceId } from '@/lib/deviceId';

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  type: 'weekly' | 'monthly';
  period: string; // '2024-W05' or '2024-02'
  created_at: string;
}

export function useGoals(type: 'weekly' | 'monthly') {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const deviceId = getDeviceId();

  // Helper to get current period string
  const getCurrentPeriod = () => {
    const now = new Date();
    if (type === 'monthly') {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else {
      const start = new Date(now.getFullYear(), 0, 1);
      const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil(days / 7);
      return `${now.getFullYear()}-W${weekNumber}`;
    }
  };

  const currentPeriod = getCurrentPeriod();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    
    // We use deviceId instead of auth.uid()
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', deviceId)
      .eq('type', type)
      .eq('period', currentPeriod)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
      // Don't show toast on first load to avoid spam if DB not connected yet
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  }, [type, currentPeriod, deviceId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (title: string) => {
    const newGoal = {
      user_id: deviceId,
      title,
      type,
      period: currentPeriod,
      completed: false
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([newGoal])
      .select()
      .single();

    if (error) {
      toast({ title: "Failed to save", description: "Check API Key & Table permissions.", variant: "destructive" });
    } else if (data) {
      setGoals(prev => [...prev, data]);
      toast({ title: "Goal added" });
    }
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed } : g));

    const { error } = await supabase
      .from('goals')
      .update({ completed })
      .eq('id', id);

    if (error) {
       toast({ title: "Update failed", variant: "destructive" });
       fetchGoals();
    }
  };

  const updateGoal = async (id: string, title: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, title } : g));

    const { error } = await supabase
      .from('goals')
      .update({ title })
      .eq('id', id);

    if (error) {
        toast({ title: "Update failed", variant: "destructive" });
        fetchGoals();
    }
  };

  const deleteGoal = async (id: string) => {
    // Optimistic update
    setGoals(prev => prev.filter(g => g.id !== id));

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
        toast({ title: "Delete failed", variant: "destructive" });
        fetchGoals();
    }
  };

  return {
    goals,
    loading,
    addGoal,
    toggleGoal,
    updateGoal,
    deleteGoal,
    currentPeriod
  };
}
