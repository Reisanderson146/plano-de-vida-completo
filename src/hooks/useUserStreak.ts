import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_goals_completed: number;
  total_points: number;
  level: number;
}

export function useUserStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStreak(data);
        await updateStreakOnVisit(data);
      } else {
        // Create initial streak record
        const newStreak = {
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString().split('T')[0],
          total_goals_completed: 0,
          total_points: 0,
          level: 1,
        };

        const { data: created, error: createError } = await supabase
          .from('user_streaks')
          .insert(newStreak)
          .select()
          .single();

        if (createError) throw createError;
        setStreak(created);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStreakOnVisit = async (currentStreak: UserStreak) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = currentStreak.last_activity_date;

    if (lastActivity === today) {
      // Already visited today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newCurrentStreak = 1;
    let newLongestStreak = currentStreak.longest_streak;

    if (lastActivity === yesterdayStr) {
      // Consecutive day - increment streak
      newCurrentStreak = currentStreak.current_streak + 1;
      if (newCurrentStreak > currentStreak.longest_streak) {
        newLongestStreak = newCurrentStreak;
      }
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setStreak(data);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const incrementGoalsCompleted = async (points: number = 10) => {
    if (!user || !streak) return;

    try {
      const newTotal = streak.total_goals_completed + 1;
      const newPoints = streak.total_points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;

      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          total_goals_completed: newTotal,
          total_points: newPoints,
          level: newLevel,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setStreak(data);
    } catch (error) {
      console.error('Error incrementing goals:', error);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    loading,
    refetch: fetchStreak,
    incrementGoalsCompleted,
  };
}
