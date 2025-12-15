import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useImportPlan } from '@/hooks/useImportPlan';
import { Loader2, Plus, User, Users, Baby, Upload, FileSpreadsheet, FileText, FileType, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AreaCustomizationEditor, AreaConfig } from '@/components/life-plan/AreaCustomizationEditor';
import { usePlanAreaCustomizations } from '@/hooks/usePlanAreaCustomizations';
import { PlanPhotoUpload } from '@/components/life-plan/PlanPhotoUpload';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';

const PLAN_TYPES = [
  { 
    id: 'individual', 
    label: 'Individual', 
    description: 'Plano pessoal',
    icon: User,
    gradient: 'from-blue-500/15 to-blue-600/5',
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
  },
  { 
    id: 'familiar', 
    label: 'Familiar', 
    description: 'Plano para família',
    icon: Users,
    gradient: 'from-rose-500/15 to-rose-600/5',
    iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
  },
  { 
    id: 'filho', 
    label: 'Filho(a)', 
    description: 'Plano para filho',
    icon: Baby,
    gradient: 'from-amber-500/15 to-amber-600/5',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { importFile } = useImportPlan();
  const { saveAllCustomizations } = usePlanAreaCustomizations(undefined);
  const { errors, setFieldError, clearError, hasError, getError, clearAllErrors } = useFormValidation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [title, setTitle] = useState('');
  const [motto, setMotto] = useState('');
  const [planType, setPlanType] = useState('individual');
  const [memberName, setMemberName] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startAge, setStartAge] = useState(30);
  const [yearsToAdd, setYearsToAdd] = useState(5);
  
  const [importedGoals, setImportedGoals] = useState<ImportedGoal[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [useImportedData, setUseImportedData] = useState(false);

  const [areasOpen, setAreasOpen] = useState(false);
  const [areaConfigs, setAreaConfigs] = useState<AreaConfig[]>(
    LIFE_AREAS.map(a => ({ id: a.id, label: a.label, color: AREA_HEX_COLORS[a.id] }))
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);

  // Check subscription status on mount and handle checkout return
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          setIsSubscribed(false);
          return;
        }
        
        const subscribed = data?.subscribed || data?.subscription_status === 'active';
        setIsSubscribed(subscribed);

        // Handle return from checkout
        const checkoutStatus = searchParams.get('checkout');
        if (checkoutStatus === 'success') {
          // Clear the query param
          setSearchParams({});
          
          if (subscribed) {
            toast({
              title: 'Assinatura confirmada!',
              description: 'Você pode criar seu plano de vida agora.',
            });
          } else {
            // Maybe payment is still processing, wait a bit
            toast({
              title: 'Verificando pagamento...',
              description: 'Aguarde enquanto confirmamos sua assinatura.',
            });
            // Re-check after a delay
            setTimeout(async () => {
              const { data: retryData } = await supabase.functions.invoke('check-subscription');
              if (retryData?.subscribed || retryData?.subscription_status === 'active') {
                setIsSubscribed(true);
                toast({
                  title: 'Assinatura confirmada!',
                  description: 'Você pode criar seu plano de vida agora.',
                });
              }
            }, 3000);
          }
        } else if (checkoutStatus === 'cancelled') {
          setSearchParams({});
          toast({
            title: 'Pagamento cancelado',
            description: 'Você pode tentar novamente quando quiser.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [user, searchParams, setSearchParams, toast]);

  const validateTitle = async (titleToCheck: string): Promise<boolean> => {
    if (!titleToCheck.trim()) {
      setFieldError('title', 'O título é obrigatório');
      return false;
    }

    const { data: existingPlans, error } = await supabase
      .from('life_plans')
      .select('id, title')
      .eq('user_id', user!.id)
      .ilike('title', titleToCheck.trim());

    if (error) {
      console.error('Error checking title:', error);
      return true;
    }

    if (existingPlans && existingPlans.length > 0) {
      setFieldError('title', 'Já existe um plano com este nome. Escolha um nome diferente.');
      return false;
    }

    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    clearAllErrors();

    // Check subscription first
    if (!isSubscribed) {
      setPendingCreate(true);
      setShowSubscriptionDialog(true);
      return;
    }

    await createPlan();
  };

  const createPlan = async () => {
    if (!user) return;

    const isValidTitle = await validateTitle(title);
    if (!isValidTitle) return;

    if ((planType === 'familiar' || planType === 'filho') && !memberName.trim()) {
      setFieldError('memberName', planType === 'filho' 
        ? 'Informe o nome do filho para este plano.' 
        : 'Informe o nome do membro da família para este plano.');
      return;
    }

    setLoading(true);
    try {
      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id: user.id,
          title,
          motto,
          plan_type: planType,
          member_name: memberName.trim() || null,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (planError) throw planError;

      let goalsToInsert = [];
      
      if (useImportedData && importedGoals.length > 0) {
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

      await saveAllCustomizations(plan.id, areaConfigs);

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

  const handleSubscribed = () => {
    setIsSubscribed(true);
    // If there was a pending create, execute it
    if (pendingCreate) {
      setPendingCreate(false);
      createPlan();
    }
  };

  const importedByArea = importedGoals.reduce((acc, goal) => {
    if (!acc[goal.area]) acc[goal.area] = [];
    acc[goal.area].push(goal);
    return acc;
  }, {} as Record<string, ImportedGoal[]>);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Novo Plano de Vida</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crie um novo plano e defina suas metas
          </p>
        </div>

        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informações do Plano</CardTitle>
            <CardDescription>
              Preencha os dados básicos do seu plano de vida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
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
                            "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                            isSelected 
                              ? `bg-gradient-to-br ${type.gradient} border-primary/50 shadow-sm` 
                              : "border-border/50 hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            isSelected ? type.iconBg : "bg-muted text-muted-foreground"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <span className={cn(
                              "font-semibold text-sm block",
                              isSelected ? "text-foreground" : "text-foreground"
                            )}>
                              {type.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {type.description}
                            </span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Foto do Plano (opcional)</Label>
                <div className="flex items-center gap-4">
                  <PlanPhotoUpload
                    photoUrl={photoUrl}
                    planType={planType}
                    userId={user?.id || ''}
                    onPhotoChange={setPhotoUrl}
                    size="lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Adicione uma foto para identificar este plano.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {planType === 'individual' && 'Sua foto pessoal'}
                      {planType === 'familiar' && 'Foto da família'}
                      {planType === 'filho' && 'Foto do(a) filho(a)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member Name */}
              {(planType === 'familiar' || planType === 'filho') && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="memberName" className="text-sm">
                    {planType === 'filho' ? 'Nome do Filho(a)' : 'Nome do Membro'}
                  </Label>
                  <Input
                    id="memberName"
                    value={memberName}
                    onChange={(e) => {
                      setMemberName(e.target.value);
                      clearError('memberName');
                    }}
                    placeholder={planType === 'filho' ? 'Ex: Maria' : 'Ex: João e Maria'}
                    error={hasError('memberName')}
                    errorMessage={getError('memberName')}
                    className="h-11 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Nome do Plano *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError('title');
                  }}
                  placeholder="Ex: Plano Pessoal 2024, Sonhos da Família Silva"
                  error={hasError('title')}
                  errorMessage={getError('title')}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motto" className="text-sm">Lema / Frase motivacional (opcional)</Label>
                <Input
                  id="motto"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ex: Aprender a ter as coisas no tempo certo"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Import Section */}
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Importar plano existente (opcional)</Label>
                  {useImportedData && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={clearImport}
                      className="text-muted-foreground hover:text-destructive h-8 rounded-lg"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>

                {!useImportedData ? (
                  <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/40 hover:bg-muted/20 transition-all duration-200 cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.txt,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-import"
                    />
                    <label htmlFor="file-import" className="cursor-pointer">
                      {importing ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Processando arquivo...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground block">
                              Clique para importar arquivo
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Suporta Excel (.xlsx, .xls), CSV, TXT ou PDF
                            </span>
                          </div>
                          <div className="flex gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileSpreadsheet className="w-4 h-4" />
                              Excel
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              CSV/TXT
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileType className="w-4 h-4" />
                              PDF
                            </div>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 p-4 bg-success/10 border border-success/20 rounded-xl text-success">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {importedGoals.length} metas importadas de {Object.keys(importedByArea).length} áreas
                      </span>
                    </div>

                    {importWarnings.length > 0 && (
                      <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                        <div className="flex items-center gap-2 text-warning mb-2">
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(importedByArea).map(([area, goals]) => {
                        const areaInfo = LIFE_AREAS.find(a => a.id === area);
                        return (
                          <div 
                            key={area} 
                            className="text-xs p-2.5 rounded-xl bg-muted/50 border border-border/30"
                          >
                            <span className="font-medium text-foreground">{areaInfo?.label}</span>
                            <span className="text-muted-foreground ml-1">({goals.length})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Year/Age Configuration - only show if not using imported data */}
              {!useImportedData && (
                <div className="pt-5 border-t border-border/50">
                  <Label className="text-sm font-medium mb-4 block">Configuração de Períodos</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startYear" className="text-xs text-muted-foreground">Ano Inicial</Label>
                      <Input
                        id="startYear"
                        type="number"
                        value={startYear}
                        onChange={(e) => setStartYear(parseInt(e.target.value))}
                        min={1900}
                        max={2100}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startAge" className="text-xs text-muted-foreground">Idade Inicial</Label>
                      <Input
                        id="startAge"
                        type="number"
                        value={startAge}
                        onChange={(e) => setStartAge(parseInt(e.target.value))}
                        min={1}
                        max={120}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsToAdd" className="text-xs text-muted-foreground">Qtd. Anos</Label>
                      <Input
                        id="yearsToAdd"
                        type="number"
                        value={yearsToAdd}
                        onChange={(e) => setYearsToAdd(parseInt(e.target.value))}
                        min={1}
                        max={50}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Area Customization */}
              <div className="pt-5 border-t border-border/50">
                <AreaCustomizationEditor
                  areas={areaConfigs}
                  onAreasChange={setAreaConfigs}
                  isOpen={areasOpen}
                  onOpenChange={setAreasOpen}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-semibold"
                variant="premium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Plano de Vida
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={(open) => {
          setShowSubscriptionDialog(open);
          if (!open) setPendingCreate(false);
        }}
        onSubscribed={handleSubscribed}
      />
    </AppLayout>
  );
}
