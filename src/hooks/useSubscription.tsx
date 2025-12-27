import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getTierByProductId, SubscriptionTier, SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers';

interface SubscriptionState {
  tier: SubscriptionTier | null;
  status: string | null;
  isLoading: boolean;
  isValidating: boolean;
  isAdmin: boolean;
}

interface UseSubscriptionReturn extends SubscriptionState {
  refresh: () => Promise<void>;
  hasAIAccess: boolean;
  isPremium: boolean;
  isActive: boolean;
}

// Cache the subscription data globally to avoid multiple fetches
let globalCache: {
  tier: SubscriptionTier | null;
  status: string | null;
  isAdmin: boolean;
  timestamp: number;
} | null = null;

const CACHE_TTL = 60000; // 1 minute cache

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: globalCache?.tier ?? null,
    status: globalCache?.status ?? null,
    isLoading: !globalCache,
    isValidating: false,
    isAdmin: globalCache?.isAdmin ?? false,
  });

  // Check if user is admin
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return data === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [user]);

  // Load from local profile first (instant)
  const loadFromProfile = useCallback(async () => {
    if (!user) {
      setState({ tier: null, status: null, isLoading: false, isValidating: false, isAdmin: false });
      return;
    }

    try {
      // Check admin status first
      const isAdmin = await checkAdminStatus();
      
      // If admin, grant full access immediately
      if (isAdmin) {
        setState({
          tier: 'premium', // Admins get premium tier
          status: 'active',
          isLoading: false,
          isValidating: false,
          isAdmin: true,
        });
        globalCache = { tier: 'premium', status: 'active', isAdmin: true, timestamp: Date.now() };
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_plan')
        .eq('id', user.id)
        .single();

      if (profile) {
        const tier = profile.subscription_plan as SubscriptionTier | null;
        const status = profile.subscription_status;
        
        // Update state immediately with cached data
        setState(prev => ({
          ...prev,
          tier: tier,
          status: status,
          isLoading: false,
          isAdmin: false,
        }));

        // Update global cache
        globalCache = { tier, status, isAdmin: false, timestamp: Date.now() };
      }
    } catch (error) {
      console.error('Error loading profile subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, checkAdminStatus]);

  // Validate with Stripe in background (slower but accurate)
  const validateWithStripe = useCallback(async () => {
    if (!user) return;

    // Skip validation if user is admin
    if (state.isAdmin) return;

    // Skip validation if cache is fresh
    if (globalCache && Date.now() - globalCache.timestamp < CACHE_TTL) {
      return;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (!error && data) {
        const tier = data.product_id ? getTierByProductId(data.product_id) : 
                     (data.subscription_status === 'active' || data.subscription_status === 'trialing') ? 'basic' : null;
        const status = data.subscription_status || 'inactive';

        setState(prev => ({
          ...prev,
          tier,
          status,
          isValidating: false,
        }));

        // Update global cache
        globalCache = { tier, status, isAdmin: false, timestamp: Date.now() };
      }
    } catch (error) {
      console.error('Error validating subscription:', error);
    } finally {
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [user, state.isAdmin]);

  // Initial load
  useEffect(() => {
    if (user) {
      // If we have fresh cache, use it
      if (globalCache && Date.now() - globalCache.timestamp < CACHE_TTL) {
        setState({
          tier: globalCache.tier,
          status: globalCache.status,
          isLoading: false,
          isValidating: false,
          isAdmin: globalCache.isAdmin,
        });
        return;
      }

      // Load from profile first, then validate
      loadFromProfile().then(() => {
        validateWithStripe();
      });
    } else {
      setState({ tier: null, status: null, isLoading: false, isValidating: false, isAdmin: false });
      globalCache = null;
    }
  }, [user, loadFromProfile, validateWithStripe]);

  const refresh = useCallback(async () => {
    globalCache = null; // Clear cache to force refresh
    await loadFromProfile();
    await validateWithStripe();
  }, [loadFromProfile, validateWithStripe]);

  // Admin users always have full access
  const hasAIAccess = state.isAdmin || (state.tier ? SUBSCRIPTION_TIERS[state.tier]?.features.aiSummary ?? false : false);
  const isPremium = state.isAdmin || state.tier === 'premium';
  const isActive = state.isAdmin || state.status === 'active' || state.status === 'trialing';

  return {
    ...state,
    refresh,
    hasAIAccess,
    isPremium,
    isActive,
  };
}
