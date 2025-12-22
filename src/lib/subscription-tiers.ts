// Subscription tier configuration
// Basic: R$ 9,99/mês - 1 plano individual
// Premium: R$ 29,99/mês - 1 individual + 1 familiar + 2 filhos + IA

export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price: 9.99,
    priceId: 'price_1SeiENRX3OjZbCrQIIbjMVMv', // Existing price
    productId: 'prod_Tbw6ZCYRIgPNee',
    limits: {
      individual: 1,
      familiar: 0,
      filho: 0,
      total: 1,
    },
    features: {
      aiSummary: false,
      emailReminders: true,
      pdfExport: true,
      cloudStorage: true,
    },
  },
  premium: {
    name: 'Premium',
    price: 29.99,
    // IMPORTANT: Create this price in Stripe Dashboard
    // Product: "Plano Premium" - R$ 29,99/mês recurring
    priceId: 'price_premium_2999', // Replace with actual price ID after creation
    productId: 'prod_premium', // Replace with actual product ID after creation
    limits: {
      individual: 1,
      familiar: 1,
      filho: 2,
      total: 4,
    },
    features: {
      aiSummary: true,
      emailReminders: true,
      pdfExport: true,
      cloudStorage: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function getTierByProductId(productId: string | null): SubscriptionTier | null {
  if (!productId) return null;
  
  if (productId === SUBSCRIPTION_TIERS.basic.productId) return 'basic';
  if (productId === SUBSCRIPTION_TIERS.premium.productId) return 'premium';
  
  // Fallback: if we have an unknown product, assume it's basic for now
  return 'basic';
}

export function getPlanLimits(tier: SubscriptionTier | null) {
  if (!tier) return { individual: 0, familiar: 0, filho: 0, total: 0 };
  return SUBSCRIPTION_TIERS[tier].limits;
}

export function canCreatePlanType(
  tier: SubscriptionTier | null,
  planType: string,
  currentCounts: { individual: number; familiar: number; filho: number }
): { allowed: boolean; reason?: string } {
  if (!tier) {
    return { allowed: false, reason: 'Você precisa de uma assinatura para criar planos.' };
  }

  const limits = SUBSCRIPTION_TIERS[tier].limits;
  
  if (planType === 'individual') {
    if (currentCounts.individual >= limits.individual) {
      return { 
        allowed: false, 
        reason: tier === 'basic' 
          ? 'Seu plano Basic permite apenas 1 plano individual. Faça upgrade para o Premium!'
          : 'Você já atingiu o limite de planos individuais.'
      };
    }
  }
  
  if (planType === 'familiar') {
    if (limits.familiar === 0) {
      return { 
        allowed: false, 
        reason: 'Planos familiares são exclusivos do Plano Premium. Faça upgrade!'
      };
    }
    if (currentCounts.familiar >= limits.familiar) {
      return { allowed: false, reason: 'Você já atingiu o limite de planos familiares.' };
    }
  }
  
  if (planType === 'filho') {
    if (limits.filho === 0) {
      return { 
        allowed: false, 
        reason: 'Planos para filhos são exclusivos do Plano Premium. Faça upgrade!'
      };
    }
    if (currentCounts.filho >= limits.filho) {
      return { allowed: false, reason: 'Você já atingiu o limite de planos para filhos.' };
    }
  }

  const totalPlans = currentCounts.individual + currentCounts.familiar + currentCounts.filho;
  if (totalPlans >= limits.total) {
    return { 
      allowed: false, 
      reason: tier === 'basic'
        ? 'Seu plano Basic permite apenas 1 plano. Faça upgrade para o Premium!'
        : 'Você já atingiu o limite total de planos.'
    };
  }

  return { allowed: true };
}

export function hasAIAccess(tier: SubscriptionTier | null): boolean {
  if (!tier) return false;
  return SUBSCRIPTION_TIERS[tier].features.aiSummary;
}
