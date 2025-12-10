import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export interface YearFilterOption {
  value: string;
  label: string;
}

// Standard year filter options
export const YEAR_FILTER_OPTIONS: YearFilterOption[] = [
  { value: 'current', label: 'Ano Atual' },
  { value: 'all', label: 'Todos os Anos' },
  { value: '1-3', label: '1 a 3 Anos' },
  { value: '4-6', label: '4 a 6 Anos' },
  { value: '7-10', label: '7 a 10 Anos' },
];

interface YearFilterProps {
  value: string;
  onChange: (value: string) => void;
  availableYears?: number[];
  className?: string;
  showSpecificYears?: boolean;
}

export function YearFilter({ 
  value, 
  onChange, 
  availableYears = [], 
  className = '',
  showSpecificYears = true 
}: YearFilterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full sm:w-[200px] ${className}`}>
        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
        <SelectValue placeholder="Filtrar período" />
      </SelectTrigger>
      <SelectContent>
        {YEAR_FILTER_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.value === 'current' && ` (${currentYear})`}
          </SelectItem>
        ))}
        {/* Individual years */}
        {showSpecificYears && availableYears.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium border-t mt-1 pt-2">
              Anos Específicos
            </div>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}

// Helper function to get year range based on filter
export function getYearRange(filter: string): { min?: number; max?: number } {
  const currentYear = new Date().getFullYear();
  
  // Check if it's a specific year
  const specificYear = parseInt(filter);
  if (!isNaN(specificYear)) {
    return { min: specificYear, max: specificYear };
  }
  
  switch (filter) {
    case 'current':
      return { min: currentYear, max: currentYear };
    case '1-3':
      return { min: currentYear, max: currentYear + 2 };
    case '4-6':
      return { min: currentYear + 3, max: currentYear + 5 };
    case '7-10':
      return { min: currentYear + 6, max: currentYear + 9 };
    case 'all':
    default:
      return {};
  }
}

// Helper function to get filter display label
export function getFilterLabel(filter: string): string {
  const currentYear = new Date().getFullYear();
  
  // Check if it's a specific year
  const specificYear = parseInt(filter);
  if (!isNaN(specificYear)) {
    return `${specificYear}`;
  }
  
  switch (filter) {
    case 'current':
      return `${currentYear}`;
    case '1-3':
      return `${currentYear} - ${currentYear + 2}`;
    case '4-6':
      return `${currentYear + 3} - ${currentYear + 5}`;
    case '7-10':
      return `${currentYear + 6} - ${currentYear + 9}`;
    case 'all':
      return 'Todos os anos';
    default:
      return filter;
  }
}
