import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { LIFE_AREAS } from '@/lib/constants';

export default function Cadastro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Meu Plano de Vida');
  const [motto, setMotto] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startAge, setStartAge] = useState(30);
  const [yearsToAdd, setYearsToAdd] = useState(5);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create the life plan
      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id: user.id,
          title,
          motto,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create goals for each year and area
      const goalsToInsert = [];
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

      const { error: goalsError } = await supabase
        .from('life_goals')
        .insert(goalsToInsert);

      if (goalsError) throw goalsError;

      toast({
        title: 'Plano criado com sucesso!',
        description: 'Agora você pode adicionar suas metas.',
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Novo Plano de Vida</h1>
          <p className="text-muted-foreground">
            Crie um novo plano e defina suas metas para as 7 áreas da vida
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
            <CardDescription>
              Preencha os dados básicos do seu plano de vida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Plano</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Meu Plano de Vida 2024-2029"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motto">Lema / Frase motivacional (opcional)</Label>
                <Input
                  id="motto"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ex: Aprender a ter as coisas no tempo certo"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startYear">Ano inicial</Label>
                  <Input
                    id="startYear"
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startAge">Idade inicial</Label>
                  <Input
                    id="startAge"
                    type="number"
                    value={startAge}
                    onChange={(e) => setStartAge(parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsToAdd">Quantidade de anos</Label>
                  <Input
                    id="yearsToAdd"
                    type="number"
                    value={yearsToAdd}
                    onChange={(e) => setYearsToAdd(parseInt(e.target.value))}
                    min={1}
                    max={20}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-foreground mb-2">Áreas que serão criadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {LIFE_AREAS.map((area) => (
                    <span
                      key={area.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium bg-area-${area.id} text-foreground`}
                    >
                      {area.label}
                    </span>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
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
