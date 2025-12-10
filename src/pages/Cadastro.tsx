import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useImportPlan } from '@/hooks/useImportPlan';
import { Loader2, Plus, User, Users, Baby, Upload, FileSpreadsheet, FileText, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PLAN_TYPES = [
  { 
    id: 'individual', 
    label: 'Individual', 
    description: 'Plano pessoal para você',
    icon: User,
    color: 'bg-blue-500/10 border-blue-500/30 text-blue-600'
  },
  { 
    id: 'familiar', 
    label: 'Familiar', 
    description: 'Plano para o casal/família',
    icon: Users,
    color: 'bg-pink-500/10 border-pink-500/30 text-pink-600'
  },
  { 
    id: 'filho', 
    label: 'Filho(a)', 
    description: 'Plano para um filho',
    icon: Baby,
    color: 'bg-amber-500/10 border-amber-500/30 text-amber-600'
  },
];

interface ImportedGoal {
  year: number;
  age: number;
  area: LifeArea;
  goalText: string;
}

export default function Cadastro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { importFile } = useImportPlan();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [title, setTitle] = useState('Meu Plano de Vida');
  const [motto, setMotto] = useState('');
  const [planType, setPlanType] = useState('individual');
  const [memberName, setMemberName] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startAge, setStartAge] = useState(30);
  const [yearsToAdd, setYearsToAdd] = useState(5);
  
  // Import state
  const [importedGoals, setImportedGoals] = useState<ImportedGoal[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [useImportedData, setUseImportedData] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate member name for family/child plans
    if ((planType === 'familiar' || planType === 'filho') && !memberName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: planType === 'filho' 
          ? 'Informe o nome do filho para este plano.' 
          : 'Informe o nome do membro da família para este plano.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create the life plan
      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id: user.id,
          title,
          motto,
          plan_type: planType,
          member_name: memberName.trim() || null,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create goals - either from import or blank
      let goalsToInsert = [];
      
      if (useImportedData && importedGoals.length > 0) {
        // Use imported goals
        goalsToInsert = importedGoals.map(goal => ({
          life_plan_id: plan.id,
          user_id: user.id,
          period_year: goal.year,
          age: goal.age,
          area: goal.area,
          goal_text: goal.goalText,
          is_completed: false,
        }));
      } else {
        // Create blank goals for each year and area
        for (let i = 0; i < yearsToAdd; i++) {
          const year = startYear + i;
          const age = startAge + i;
          for (const area of LIFE_AREAS) {
            goalsToInsert.push({
              life_plan_id: plan.id,
              user_id: user.id,
              period_year: year,
              age,
              area: area.id,
              goal_text: '',
              is_completed: false,
            });
          }
        }
      }

      const { error: goalsError } = await supabase
        .from('life_goals')
        .insert(goalsToInsert);

      if (goalsError) throw goalsError;

      toast({
        title: 'Plano criado com sucesso!',
        description: useImportedData 
          ? `${importedGoals.length} metas importadas com sucesso.`
          : 'Agora você pode adicionar suas metas.',
      });

      navigate(`/consulta/${plan.id}`);
    } catch (error: any) {
      toast({
        title: 'Erro ao criar plano',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportedGoals([]);
    setImportWarnings([]);

    try {
      const result = await importFile(file);

      if (result.success) {
        setImportedGoals(result.goals);
        setImportWarnings(result.warnings);
        setUseImportedData(true);

        // Update start year and age based on imported data
        if (result.goals.length > 0) {
          const years = result.goals.map(g => g.year);
          const ages = result.goals.map(g => g.age);
          setStartYear(Math.min(...years));
          setStartAge(Math.min(...ages));
          
          const uniqueYears = [...new Set(years)];
          setYearsToAdd(uniqueYears.length);
        }

        toast({
          title: 'Arquivo importado!',
          description: `${result.goals.length} metas encontradas.`,
        });
      } else {
        toast({
          title: 'Erro na importação',
          description: result.errors[0] || 'Não foi possível importar o arquivo.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImport = () => {
    setImportedGoals([]);
    setImportWarnings([]);
    setUseImportedData(false);
  };

  const selectedPlanType = PLAN_TYPES.find(p => p.id === planType);

  // Group imported goals by area for display
  const importedByArea = importedGoals.reduce((acc, goal) => {
    if (!acc[goal.area]) acc[goal.area] = [];
    acc[goal.area].push(goal);
    return acc;
  }, {} as Record<string, ImportedGoal[]>);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Novo Plano de Vida</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crie um novo plano e defina suas metas para as 7 áreas da vida
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Informações do Plano</CardTitle>
            <CardDescription className="text-sm">
              Preencha os dados básicos do seu plano de vida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4 sm:space-y-6">
              {/* Plan Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de Plano</Label>
                <RadioGroup
                  value={planType}
                  onValueChange={setPlanType}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {PLAN_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = planType === type.id;
                    return (
                      <div key={type.id}>
                        <RadioGroupItem
                          value={type.id}
                          id={type.id}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={type.id}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            isSelected 
                              ? type.color + " border-current shadow-md" 
                              : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                          )}
                        >
                          <Icon className={cn(
                            "w-6 h-6",
                            isSelected ? "" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "font-medium text-sm",
                            isSelected ? "" : "text-foreground"
                          )}>
                            {type.label}
                          </span>
                          <span className={cn(
                            "text-xs text-center",
                            isSelected ? "opacity-80" : "text-muted-foreground"
                          )}>
                            {type.description}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Member Name (for familiar/filho) */}
              {(planType === 'familiar' || planType === 'filho') && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="memberName" className="text-sm">
                    {planType === 'filho' ? 'Nome do Filho(a)' : 'Nome do Membro'}
                  </Label>
                  <Input
                    id="memberName"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder={planType === 'filho' ? 'Ex: Maria' : 'Ex: João e Maria'}
                    required
                    className="h-11 sm:h-10"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Título do Plano</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Meu Plano de Vida 2024-2029"
                  required
                  className="h-11 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motto" className="text-sm">Lema / Frase motivacional (opcional)</Label>
                <Input
                  id="motto"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ex: Aprender a ter as coisas no tempo certo"
                  className="h-11 sm:h-10"
                />
              </div>

              {/* Import Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Importar plano existente (opcional)</Label>
                  {useImportedData && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={clearImport}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>

                {!useImportedData ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-import"
                    />
                    <label htmlFor="file-import" className="cursor-pointer">
                      {importing ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Processando arquivo...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Clique para importar arquivo
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Suporta Excel (.xlsx, .xls) ou PDF
                          </span>
                          <div className="flex gap-2 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileSpreadsheet className="w-4 h-4" />
                              Excel
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              PDF
                            </div>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Import success message */}
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {importedGoals.length} metas importadas de {Object.keys(importedByArea).length} áreas
                      </span>
                    </div>

                    {/* Warnings */}
                    {importWarnings.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Avisos</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {importWarnings.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Summary by area */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LIFE_AREAS.map(area => {
                        const count = importedByArea[area.id]?.length || 0;
                        return (
                          <div 
                            key={area.id}
                            className={cn(
                              "p-2 rounded-lg text-center text-xs",
                              count > 0 
                                ? `bg-area-${area.id} text-foreground` 
                                : "bg-muted/50 text-muted-foreground"
                            )}
                          >
                            <div className="font-medium">{area.label}</div>
                            <div>{count} metas</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Year/Age settings - only show if NOT using imported data */}
              {!useImportedData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startYear" className="text-sm">Ano inicial</Label>
                    <Input
                      id="startYear"
                      type="number"
                      value={startYear}
                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                      required
                      className="h-11 sm:h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startAge" className="text-sm">Idade inicial</Label>
                    <Input
                      id="startAge"
                      type="number"
                      value={startAge}
                      onChange={(e) => setStartAge(parseInt(e.target.value))}
                      required
                      className="h-11 sm:h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsToAdd" className="text-sm">Quantidade de anos</Label>
                    <Input
                      id="yearsToAdd"
                      type="number"
                      value={yearsToAdd}
                      onChange={(e) => setYearsToAdd(parseInt(e.target.value))}
                      min={1}
                      max={20}
                      required
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Áreas que serão criadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {LIFE_AREAS.map((area) => (
                    <span
                      key={area.id}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-area-${area.id} text-foreground`}
                    >
                      {area.label}
                    </span>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-11 sm:h-10" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar Plano de Vida
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
