import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useExportLifePlan } from '@/hooks/useExportLifePlan';
import { LifeArea } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Goal {
  id: string;
  period_year: number;
  age: number;
  area: LifeArea;
  goal_text: string;
  is_completed: boolean;
}

interface LifePlan {
  id: string;
  title: string;
  motto: string | null;
}

interface AreaConfig {
  id: LifeArea;
  label: string;
  color: string;
}

interface ExportPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: LifePlan;
  goals: Goal[];
  areaConfigs: AreaConfig[];
}

export function ExportPlanDialog({ open, onOpenChange, plan, goals, areaConfigs }: ExportPlanDialogProps) {
  const { exportToPDF, getUniqueYears } = useExportLifePlan();
  const { toast } = useToast();
  
  const years = getUniqueYears(goals);
  const [exportType, setExportType] = useState<'all' | 'selected'>('all');
  const [selectedYears, setSelectedYears] = useState<number[]>(years);

  const handleYearToggle = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    setSelectedYears(years);
  };

  const handleSelectNone = () => {
    setSelectedYears([]);
  };

  const handleExport = () => {
    const yearsToExport = exportType === 'all' ? undefined : selectedYears;
    
    if (exportType === 'selected' && selectedYears.length === 0) {
      toast({
        title: 'Selecione ao menos um período',
        description: 'Escolha os anos que deseja exportar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportToPDF({ plan, goals, areaConfigs, selectedYears: yearsToExport });

      toast({
        title: 'Exportação concluída!',
        description: 'Seu plano foi exportado em PDF.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Download className="w-4 h-4" />
            Exportar Plano
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecione os períodos para exportar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
          {/* Format Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Formato: PDF</span>
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Períodos</Label>
            <RadioGroup value={exportType} onValueChange={(v) => setExportType(v as 'all' | 'selected')} className="space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer text-sm">
                  Todos ({years.length})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer text-sm">
                  Selecionar
                </Label>
              </div>
            </RadioGroup>

            {/* Year Checkboxes */}
            {exportType === 'selected' && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {selectedYears.length}/{years.length}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={handleSelectAll}>
                      Todos
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={handleSelectNone}>
                      Nenhum
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto p-1.5 border rounded-lg bg-muted/30">
                  {years.map(year => {
                    const yearGoals = goals.filter(g => g.period_year === year);
                    const age = yearGoals[0]?.age || 0;
                    
                    return (
                      <label
                        key={year}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded cursor-pointer transition-all text-center",
                          selectedYears.includes(year)
                            ? "bg-primary/15 border border-primary/30"
                            : "bg-background border border-border hover:border-muted-foreground/50"
                        )}
                      >
                        <Checkbox
                          checked={selectedYears.includes(year)}
                          onCheckedChange={() => handleYearToggle(year)}
                          className="sr-only"
                        />
                        <span className="font-medium text-xs">{year}</span>
                        <span className="text-[9px] text-muted-foreground">{age}a</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}