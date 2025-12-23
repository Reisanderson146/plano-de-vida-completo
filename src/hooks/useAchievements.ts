import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserStreak } from './useUserStreak';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  points: number;
  requirement: number;
  isUnlocked: boolean;
  progress: number;
  earnedAt?: string;
}

const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_goal', name: 'Primeira Meta', description: 'Complete sua primeira meta', icon: '🌟', type: 'goals', points: 10, requirement: 1 },
  { id: 'focused', name: 'Focado', description: 'Complete 10 metas', icon: '🎯', type: 'goals', points: 50, requirement: 10 },
  { id: 'determined', name: 'Determinado', description: 'Complete 50 metas', icon: '💪', type: 'goals', points: 200, requirement: 50 },
  { id: 'champion', name: 'Campeão', description: 'Complete 100 metas', icon: '🏆', type: 'goals', points: 500, requirement: 100 },
  { id: 'streak_7', name: 'Constante', description: 'Mantenha um streak de 7 dias', icon: '🔥', type: 'streak', points: 100, requirement: 7 },
  { id: 'streak_30', name: 'Imparável', description: 'Mantenha um streak de 30 dias', icon: '⚡', type: 'streak', points: 300, requirement: 30 },
  { id: 'level_5', name: 'Evoluindo', description: 'Alcance o nível 5', icon: '📈', type: 'level', points: 150, requirement: 5 },
  { id: 'level_10', name: 'Experiente', description: 'Alcance o nível 10', icon: '🎖️', type: 'level', points: 300, requirement: 10 },
];

export function useAchievements() {
  const { user } = useAuth();
  const { streak } = useUserStreak();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch earned achievements
      const { data: earned, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Map definitions with earned status and progress
      const mappedAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
        const earnedItem = earned?.find((e) => e.achievement_name === def.id);
        let progress = 0;

        if (streak) {
          switch (def.type) {
            case 'goals':
              progress = streak.total_goals_completed;
              break;
            case 'streak':
              progress = streak.longest_streak;
              break;
            case 'level':
              progress = streak.level;
              break;
          }
        }

        return {
          ...def,
          isUnlocked: !!earnedItem,
          progress: Math.min(progress, def.requirement),
          earnedAt: earnedItem?.earned_at,
        };
      });

      setAchievements(mappedAchievements);

      // Check for new achievements to unlock
      await checkAndUnlockAchievements(mappedAchievements, earned || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user, streak]);

  const checkAndUnlockAchievements = async (
    currentAchievements: Achievement[],
    earnedFromDb: any[]
  ) => {
    if (!user || !streak) return;

    const toUnlock = currentAchievements.filter((a) => {
      if (a.isUnlocked) return false;
      return a.progress >= a.requirement;
    });

    for (const achievement of toUnlock) {
      try {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_name: achievement.id,
          achievement_type: achievement.type,
          description: achievement.description,
          points: achievement.points,
        });
      } catch (error) {
        console.error('Error unlocking achievement:', error);
      }
    }

    if (toUnlock.length > 0) {
      fetchAchievements();
    }
  };

  useEffect(() => {
    if (streak) {
      fetchAchievements();
    }
  }, [fetchAchievements, streak]);

  const totalPoints = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return {
    achievements,
    loading,
    totalPoints,
    unlockedCount,
    totalAchievements: achievements.length,
    refetch: fetchAchievements,
  };
}
