import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  className?: string;
}

export function DateRangeFilter({ 
  value, 
  onChange, 
  className = ''
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleQuickSelect = (type: string) => {
    const now = new Date();
    let range: DateRange | undefined;

    switch (type) {
      case 'current-year':
        range = {
          from: startOfYear(now),
          to: endOfYear(now)
        };
        break;
      case 'current-month':
        range = {
          from: startOfMonth(now),
          to: endOfMonth(now)
        };
        break;
      case 'all':
        range = undefined;
        break;
      default:
        range = undefined;
    }

    onChange(range);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (!value?.from) {
      return 'Todos os períodos';
    }

    if (!value.to) {
      return format(value.from, "dd/MM/yyyy", { locale: ptBR });
    }

    // Check if it's a full year
    const fromYear = value.from.getFullYear();
    const toYear = value.to.getFullYear();
    const isFullYear = 
      value.from.getMonth() === 0 && 
      value.from.getDate() === 1 && 
      value.to.getMonth() === 11 && 
      value.to.getDate() === 31;

    if (isFullYear && fromYear === toYear) {
      return `Ano ${fromYear}`;
    }

    if (isFullYear && fromYear !== toYear) {
      return `${fromYear} - ${toYear}`;
    }

    // Check if it's a full month
    const isFullMonth = 
      value.from.getDate() === 1 && 
      value.to.getDate() === endOfMonth(value.to).getDate() &&
      value.from.getMonth() === value.to.getMonth() &&
      value.from.getFullYear() === value.to.getFullYear();

    if (isFullMonth) {
      return format(value.from, "MMMM yyyy", { locale: ptBR });
    }

    return `${format(value.from, "dd/MM/yy", { locale: ptBR })} - ${format(value.to, "dd/MM/yy", { locale: ptBR })}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[220px] h-11 justify-start text-left font-normal rounded-xl",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{getDisplayLabel()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover" align="start">
        <div className="p-3 space-y-3">
          {/* Quick Options */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('current-month')}
              className="text-xs"
            >
              Mês Atual
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('current-year')}
              className="text-xs"
            >
              Ano {currentYear}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('all')}
              className="text-xs"
            >
              Todos
            </Button>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-2 text-center">
              Selecione o período desejado:
            </p>
            <Calendar
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={1}
              locale={ptBR}
              className="pointer-events-auto"
              disabled={(date) => date > new Date()}
            />
          </div>

          {value?.from && (
            <div className="border-t pt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Aplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange(undefined)}
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to filter data by date range
export function filterByDateRange<T extends { period_year: number }>(
  data: T[],
  dateRange: DateRange | undefined
): T[] {
  if (!dateRange?.from) {
    return data;
  }

  const fromYear = dateRange.from.getFullYear();
  const toYear = dateRange.to?.getFullYear() || fromYear;

  return data.filter(item => {
    return item.period_year >= fromYear && item.period_year <= toYear;
  });
}

// Helper to convert DateRange to year-based query params
export function getYearRangeFromDateRange(dateRange: DateRange | undefined): { min?: number; max?: number } {
  if (!dateRange?.from) {
    return {};
  }

  const fromYear = dateRange.from.getFullYear();
  const toYear = dateRange.to?.getFullYear() || fromYear;

  return { min: fromYear, max: toYear };
}
