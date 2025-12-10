import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YearFilterProps {
  value: string;
  onChange: (value: string) => void;
  availableYears?: number[];
  className?: string;
}

export function YearFilter({ 
  value, 
  onChange, 
  availableYears = [], 
  className = ''
}: YearFilterProps) {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'single' | 'range'>('single');
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [yearPickerBase, setYearPickerBase] = useState(Math.floor(currentYear / 12) * 12);

  // Generate years for the picker (12 years at a time)
  const pickerYears = Array.from({ length: 12 }, (_, i) => yearPickerBase + i);

  const handleQuickSelect = (type: string) => {
    onChange(type);
    setRangeStart(null);
    setRangeEnd(null);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    if (filterType === 'single') {
      onChange(year.toString());
      setIsOpen(false);
    } else {
      // Range mode
      if (rangeStart === null) {
        // First selection
        setRangeStart(year);
        setRangeEnd(null);
      } else if (rangeEnd === null) {
        // Second selection - set range end
        setRangeEnd(year);
      } else {
        // Both are set, start over
        setRangeStart(year);
        setRangeEnd(null);
      }
    }
  };

  const applyRangeFilter = () => {
    if (rangeStart !== null && rangeEnd !== null) {
      const minYear = Math.min(rangeStart, rangeEnd);
      const maxYear = Math.max(rangeStart, rangeEnd);
      onChange(`${minYear}-${maxYear}`);
      setIsOpen(false);
    }
  };

  const isYearInRange = (year: number) => {
    if (filterType === 'range' && rangeStart !== null && rangeEnd !== null) {
      return year >= Math.min(rangeStart, rangeEnd) && year <= Math.max(rangeStart, rangeEnd);
    }
    return false;
  };

  const isYearSelected = (year: number) => {
    if (filterType === 'single') {
      return value === year.toString();
    }
    return year === rangeStart || year === rangeEnd;
  };

  // Reset range when switching modes
  const handleFilterTypeChange = (type: 'single' | 'range') => {
    setFilterType(type);
    if (type === 'single') {
      setRangeStart(null);
      setRangeEnd(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[200px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          {getFilterLabel(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Quick Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={value === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickSelect('current')}
              className="text-xs"
            >
              Ano Atual ({currentYear})
            </Button>
            <Button
              variant={value === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickSelect('all')}
              className="text-xs"
            >
              Todos os Anos
            </Button>
          </div>

          <div className="border-t pt-3">
            {/* Filter Type Toggle */}
            <div className="flex gap-2 mb-3">
              <Button
                variant={filterType === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterTypeChange('single')}
                className="flex-1 text-xs"
              >
                Ano Único
              </Button>
              <Button
                variant={filterType === 'range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterTypeChange('range')}
                className="flex-1 text-xs"
              >
                Intervalo
              </Button>
            </div>

            {/* Year Picker Header */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setYearPickerBase(yearPickerBase - 12)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {yearPickerBase} - {yearPickerBase + 11}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setYearPickerBase(yearPickerBase + 12)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Year Grid */}
            <div className="grid grid-cols-4 gap-1">
              {pickerYears.map((year) => {
                const isAvailable = availableYears.length === 0 || availableYears.includes(year);
                const isSelected = isYearSelected(year);
                const isInRange = isYearInRange(year);

                return (
                  <Button
                    key={year}
                    variant={isSelected ? 'default' : isInRange ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleYearSelect(year)}
                    disabled={!isAvailable && availableYears.length > 0}
                    className={cn(
                      "h-9 text-xs",
                      year === currentYear && !isSelected && "border border-primary",
                      !isAvailable && availableYears.length > 0 && "opacity-30"
                    )}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>

            {/* Range Selection Info */}
            {filterType === 'range' && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  {rangeStart !== null && rangeEnd !== null
                    ? `${Math.min(rangeStart, rangeEnd)} até ${Math.max(rangeStart, rangeEnd)}`
                    : rangeStart !== null
                      ? `${rangeStart} → Selecione o ano final`
                      : 'Selecione o ano inicial'}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={applyRangeFilter}
                  disabled={rangeStart === null || rangeEnd === null}
                >
                  Aplicar Intervalo
                </Button>
              </div>
            )}
          </div>

          {/* Available Years Quick Access */}
          {availableYears.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">Anos com metas:</p>
              <div className="flex flex-wrap gap-1">
                {availableYears.slice(0, 8).map(year => (
                  <Button
                    key={year}
                    variant={value === year.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickSelect(year.toString())}
                    className="h-7 text-xs px-2"
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to get year range based on filter
export function getYearRange(filter: string): { min?: number; max?: number } {
  const currentYear = new Date().getFullYear();
  
  // Check if it's a range (e.g., "2024-2027")
  if (filter.includes('-') && filter !== 'all') {
    const parts = filter.split('-');
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end)) {
        return { min: Math.min(start, end), max: Math.max(start, end) };
      }
    }
  }
  
  // Check if it's a specific year
  const specificYear = parseInt(filter);
  if (!isNaN(specificYear) && filter.length === 4) {
    return { min: specificYear, max: specificYear };
  }
  
  switch (filter) {
    case 'current':
      return { min: currentYear, max: currentYear };
    case 'all':
    default:
      return {};
  }
}

// Helper function to get filter display label
export function getFilterLabel(filter: string): string {
  const currentYear = new Date().getFullYear();
  
  if (!filter) {
    return 'Selecione o período';
  }
  
  // Check if it's a range (e.g., "2024-2027")
  if (filter.includes('-') && filter !== 'all') {
    const parts = filter.split('-');
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end)) {
        return `${Math.min(start, end)} - ${Math.max(start, end)}`;
      }
    }
  }
  
  // Check if it's a specific year
  const specificYear = parseInt(filter);
  if (!isNaN(specificYear) && filter.length === 4) {
    return `${specificYear}`;
  }
  
  switch (filter) {
    case 'current':
      return `${currentYear}`;
    case 'all':
      return 'Todos os anos';
    default:
      return filter;
  }
}
