import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useTour() {
  const [showTour, setShowTour] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id && !hasChecked) {
      const tourCompleted = localStorage.getItem(`tour_completed_${user.id}`);
      if (!tourCompleted) {
        // Small delay to let the page load first
        const timer = setTimeout(() => {
          setShowTour(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
      setHasChecked(true);
    }
  }, [user?.id, hasChecked]);

  const completeTour = () => {
    setShowTour(false);
  };

  const restartTour = () => {
    setShowTour(true);
  };

  const resetTourForUser = () => {
    if (user?.id) {
      localStorage.removeItem(`tour_completed_${user.id}`);
      setShowTour(true);
    }
  };

  return {
    showTour,
    completeTour,
    restartTour,
    resetTourForUser
  };
}
