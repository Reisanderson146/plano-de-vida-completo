import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useExportLifePlan } from '@/hooks/useExportLifePlan';
import { LifeArea, LIFE_AREAS, AREA_HEX_COLORS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const { exportToPDF, exportToExcel, getUniqueYears } = useExportLifePlan();
  const { toast } = useToast();
  
  const years = getUniqueYears(goals);
  const [exportType, setExportType] = useState<'all' | 'selected'>('all');
  const [selectedYears, setSelectedYears] = useState<number[]>(years);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');

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
      if (format === 'pdf') {
        exportToPDF({ plan, goals, areaConfigs, selectedYears: yearsToExport });
      } else {
        exportToExcel({ plan, goals, areaConfigs, selectedYears: yearsToExport });
      }

      toast({
        title: 'Exportação concluída!',
        description: `Seu plano foi exportado em ${format.toUpperCase()}.`,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Plano de Vida
          </DialogTitle>
          <DialogDescription>
            Escolha o formato e os períodos para exportar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'pdf' | 'excel')} className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="pdf" id="pdf" className="sr-only" />
                <Label
                  htmlFor="pdf"
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    format === 'pdf' 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <FileText className="w-5 h-5" />
                  PDF
                </Label>
              </div>
              <div>
                <RadioGroupItem value="excel" id="excel" className="sr-only" />
                <Label
                  htmlFor="excel"
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    format === 'excel' 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Excel
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Period Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Períodos</Label>
            <RadioGroup value={exportType} onValueChange={(v) => setExportType(v as 'all' | 'selected')} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">
                  Exportar todos os anos ({years.length} períodos)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer">
                  Selecionar períodos específicos
                </Label>
              </div>
            </RadioGroup>

            {/* Year Checkboxes */}
            {exportType === 'selected' && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {selectedYears.length} de {years.length} selecionados
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={handleSelectAll}>
                      Todos
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={handleSelectNone}>
                      Nenhum
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
                  {years.map(year => {
                    const yearGoals = goals.filter(g => g.period_year === year);
                    const age = yearGoals[0]?.age || 0;
                    const completed = yearGoals.filter(g => g.is_completed).length;
                    const total = yearGoals.filter(g => g.goal_text.trim()).length;
                    
                    return (
                      <label
                        key={year}
                        className={cn(
                          "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all text-center",
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
                        <span className="font-semibold text-sm">{year}</span>
                        <span className="text-[10px] text-muted-foreground">{age} anos</span>
                        <span className="text-[10px] text-muted-foreground">{completed}/{total}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
