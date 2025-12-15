import { Sparkles, Brain, Heart, Users, Wallet, Briefcase, Dumbbell, LucideIcon } from 'lucide-react';

export const LIFE_AREAS = [
  { id: 'espiritual', label: 'Espiritual', color: 'area-espiritual' },
  { id: 'intelectual', label: 'Intelectual', color: 'area-intelectual' },
  { id: 'familiar', label: 'Familiar', color: 'area-familiar' },
  { id: 'social', label: 'Social', color: 'area-social' },
  { id: 'financeiro', label: 'Financeiro', color: 'area-financeiro' },
  { id: 'profissional', label: 'Profissional', color: 'area-profissional' },
  { id: 'saude', label: 'Saúde', color: 'area-saude' },
] as const;

export type LifeArea = typeof LIFE_AREAS[number]['id'];

export const AREA_COLORS: Record<LifeArea, string> = {
  espiritual: 'bg-area-espiritual',
  intelectual: 'bg-area-intelectual',
  familiar: 'bg-area-familiar',
  social: 'bg-area-social',
  financeiro: 'bg-area-financeiro',
  profissional: 'bg-area-profissional',
  saude: 'bg-area-saude',
};

export const AREA_BORDER_COLORS: Record<LifeArea, string> = {
  espiritual: 'border-area-espiritual',
  intelectual: 'border-area-intelectual',
  familiar: 'border-area-familiar',
  social: 'border-area-social',
  financeiro: 'border-area-financeiro',
  profissional: 'border-area-profissional',
  saude: 'border-area-saude',
};

// Hex colors for charts and visualizations
export const AREA_HEX_COLORS: Record<LifeArea, string> = {
  espiritual: '#8b5cf6',    // Purple
  intelectual: '#3b82f6',   // Blue
  familiar: '#ec4899',      // Pink
  social: '#f97316',        // Orange
  financeiro: '#22c55e',    // Green
  profissional: '#06b6d4',  // Cyan
  saude: '#ef4444',         // Red
};

// Icons for each life area
export const AREA_ICONS: Record<LifeArea, LucideIcon> = {
  espiritual: Sparkles,
  intelectual: Brain,
  familiar: Heart,
  social: Users,
  financeiro: Wallet,
  profissional: Briefcase,
  saude: Dumbbell,
};
