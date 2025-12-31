// Subscription tier configuration
// Basic: R$ 9,99/mês - 1 plano individual
// Familiar: R$ 19,90/mês - 1 individual + 1 familiar (com tudo incluso)
// Premium: R$ 29,99/mês - 1 individual + 1 familiar + 3 filhos + IA

export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price: 9.99,
    priceId: 'price_1SeiENRX3OjZbCrQIIbjMVMv',
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
  familiar: {
    name: 'Familiar',
    price: 19.90,
    priceId: 'price_familiar_1990', // TODO: Replace with real Stripe price ID
    productId: 'prod_familiar', // TODO: Replace with real Stripe product ID
    limits: {
      individual: 0,
      familiar: 1,
      filho: 3,
      total: 4,
    },
    features: {
      aiSummary: true,
      emailReminders: true,
      pdfExport: true,
      cloudStorage: true,
    },
  },
  premium: {
    name: 'Premium',
    price: 29.99,
    priceId: 'price_1ShLBERX3OjZbCrQFUF993DL',
    productId: 'prod_TeeUMyrZLlnteX',
    limits: {
      individual: 1,
      familiar: 1,
      filho: 3,
      total: 5,
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
  if (productId === SUBSCRIPTION_TIERS.familiar.productId) return 'familiar';
  if (productId === SUBSCRIPTION_TIERS.premium.productId) return 'premium';
  
  // Fallback: if we have an unknown product, assume it's basic for now
  return 'basic';
}

export function getPlanLimits(tier: SubscriptionTier | null, isAdmin: boolean = false) {
  // Admins have unlimited access
  if (isAdmin) {
    return { individual: 999, familiar: 999, filho: 999, total: 999 };
  }
  if (!tier) return { individual: 0, familiar: 0, filho: 0, total: 0 };
  return SUBSCRIPTION_TIERS[tier].limits;
}

export function canCreatePlanType(
  tier: SubscriptionTier | null,
  planType: string,
  currentCounts: { individual: number; familiar: number; filho: number },
  isAdmin: boolean = false
): { allowed: boolean; reason?: string } {
  // Admins can create any plan type without restrictions
  if (isAdmin) {
    return { allowed: true };
  }

  if (!tier) {
    return { allowed: false, reason: 'Você precisa de uma assinatura para criar planos.' };
  }

  const limits = SUBSCRIPTION_TIERS[tier].limits;
  
  if (planType === 'individual') {
    if (currentCounts.individual >= limits.individual) {
      return { 
        allowed: false, 
        reason: tier === 'basic' 
          ? 'Seu plano Basic permite apenas 1 plano individual. Faça upgrade para o Familiar!'
          : 'Você já atingiu o limite de planos individuais.'
      };
    }
  }
  
  if (planType === 'familiar') {
    if (limits.familiar === 0) {
      return { 
        allowed: false, 
        reason: 'Planos familiares são exclusivos dos Planos Familiar e Premium. Faça upgrade!'
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
        ? 'Seu plano Basic permite apenas 1 plano. Faça upgrade para o Familiar!'
        : 'Você já atingiu o limite total de planos.'
    };
  }

  return { allowed: true };
}

export function hasAIAccess(tier: SubscriptionTier | null, isAdmin: boolean = false): boolean {
  // Admins always have AI access
  if (isAdmin) return true;
  if (!tier) return false;
  return SUBSCRIPTION_TIERS[tier].features.aiSummary;
}
