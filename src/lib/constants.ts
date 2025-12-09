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
