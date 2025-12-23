import { cn } from '@/lib/utils';
import { Achievement } from '@/hooks/useAchievements';
import { Lock } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);

  return (
    <div
      className={cn(
        "relative p-5 rounded-2xl border transition-all duration-300",
        achievement.isUnlocked
          ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/10"
          : "bg-muted/30 border-border/40 opacity-60"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto",
          achievement.isUnlocked
            ? "bg-gradient-to-br from-primary/20 to-primary/10"
            : "bg-muted/50"
        )}
      >
        {achievement.isUnlocked ? (
          achievement.icon
        ) : (
          <Lock className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className={cn(
          "font-semibold text-base mb-1",
          achievement.isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {achievement.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {achievement.description}
        </p>

        {/* Progress */}
        {!achievement.isUnlocked && (
          <div className="space-y-1.5">
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {achievement.progress}/{achievement.requirement}
            </p>
          </div>
        )}

        {/* Points */}
        <div className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium mt-2",
          achievement.isUnlocked
            ? "bg-success/20 text-success"
            : "bg-muted/50 text-muted-foreground"
        )}>
          {achievement.isUnlocked ? '✓' : ''} {achievement.points} pts
        </div>
      </div>

      {/* Unlocked indicator */}
      {achievement.isUnlocked && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg">
          <span className="text-sm">✓</span>
        </div>
      )}
    </div>
  );
}
