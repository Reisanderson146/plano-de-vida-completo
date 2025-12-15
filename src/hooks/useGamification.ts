import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserStreak {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_goals_completed: number;
  total_points: number;
  level: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  earned_at: string;
  points: number;
}

const ACHIEVEMENTS = {
  FIRST_GOAL: { name: 'Primeira Meta', description: 'Completou sua primeira meta!', points: 10 },
  STREAK_3: { name: 'Consistência', description: '3 dias seguidos completando metas', points: 25 },
  STREAK_7: { name: 'Semana Perfeita', description: '7 dias seguidos completando metas', points: 50 },
  STREAK_30: { name: 'Mês Dedicado', description: '30 dias seguidos completando metas', points: 200 },
  GOALS_10: { name: 'Determinado', description: 'Completou 10 metas', points: 30 },
  GOALS_50: { name: 'Focado', description: 'Completou 50 metas', points: 100 },
  GOALS_100: { name: 'Conquistador', description: 'Completou 100 metas', points: 250 },
  LEVEL_5: { name: 'Evoluindo', description: 'Alcançou nível 5', points: 50 },
  LEVEL_10: { name: 'Experiente', description: 'Alcançou nível 10', points: 150 },
};

const POINTS_PER_GOAL = 10;
const POINTS_PER_LEVEL = 100;

export function useGamification() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    if (!user) return;
    
    try {
      // Load or create user streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakError) throw streakError;

      if (!streakData) {
        // Create initial streak record
        const { data: newStreak, error: createError } = await supabase
          .from('user_streaks')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setStreak(newStreak);
      } else {
        setStreak(streakData);
      }

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordGoalCompletion = async () => {
    if (!user || !streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = streak.last_activity_date;
    
    let newStreak = streak.current_streak;
    let isNewStreakDay = false;

    if (!lastActivity) {
      newStreak = 1;
      isNewStreakDay = true;
    } else if (lastActivity === today) {
      // Already recorded today, just add points
    } else {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = streak.current_streak + 1;
        isNewStreakDay = true;
      } else if (diffDays > 1) {
        newStreak = 1;
        isNewStreakDay = true;
      }
    }

    const newTotalGoals = streak.total_goals_completed + 1;
    const newPoints = streak.total_points + POINTS_PER_GOAL;
    const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;
    const newLongestStreak = Math.max(streak.longest_streak, newStreak);

    try {
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          total_goals_completed: newTotalGoals,
          total_points: newPoints,
          level: newLevel,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setStreak({
        ...streak,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        total_goals_completed: newTotalGoals,
        total_points: newPoints,
        level: newLevel,
      });

      // Check and award achievements
      await checkAchievements(newTotalGoals, newStreak, newLevel);

    } catch (error) {
      console.error('Error recording goal completion:', error);
    }
  };

  const checkAchievements = async (totalGoals: number, currentStreak: number, level: number) => {
    if (!user) return;

    const achievementsToCheck = [
      { type: 'FIRST_GOAL', condition: totalGoals === 1 },
      { type: 'GOALS_10', condition: totalGoals >= 10 },
      { type: 'GOALS_50', condition: totalGoals >= 50 },
      { type: 'GOALS_100', condition: totalGoals >= 100 },
      { type: 'STREAK_3', condition: currentStreak >= 3 },
      { type: 'STREAK_7', condition: currentStreak >= 7 },
      { type: 'STREAK_30', condition: currentStreak >= 30 },
      { type: 'LEVEL_5', condition: level >= 5 },
      { type: 'LEVEL_10', condition: level >= 10 },
    ];

    for (const check of achievementsToCheck) {
      if (check.condition && !achievements.find(a => a.achievement_type === check.type)) {
        const achievement = ACHIEVEMENTS[check.type as keyof typeof ACHIEVEMENTS];
        
        try {
          const { data, error } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_type: check.type,
              achievement_name: achievement.name,
              description: achievement.description,
              points: achievement.points,
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            setAchievements(prev => [data, ...prev]);
            toast.success(`🏆 Nova conquista: ${achievement.name}!`, {
              description: achievement.description,
            });
          }
        } catch (error) {
          console.error('Error awarding achievement:', error);
        }
      }
    }
  };

  return {
    streak,
    achievements,
    loading,
    recordGoalCompletion,
    refetch: loadGamificationData,
  };
}
