import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Moon, Info } from 'lucide-react';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { applyTheme, initializeTheme } from '@/lib/themes';
import { useAuth } from '@/hooks/useAuth';

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('default');

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = initializeTheme();
    setSelectedTheme(savedTheme);
    setLoading(false);
  }, []);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    toast({
      title: 'Tema atualizado!',
      description: 'O novo tema foi aplicado com sucesso.',
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize a aparência do seu aplicativo</p>
        </div>

        {/* Theme Selection Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Tema de Cores
                </CardTitle>
                <CardDescription className="mt-1">Escolha o estilo visual do seu Plano de Vida</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-background shadow-sm">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Modo de Exibição</p>
                  <p className="text-sm text-muted-foreground">Claro, escuro ou automático</p>
                </div>
              </div>
              <DarkModeToggle />
            </div>

            {/* Color Theme Selector */}
            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-4">Paleta de Cores</p>
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Sobre o Aplicativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Versão</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Usuário</span>
                <span className="font-medium truncate max-w-[200px]">{user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
