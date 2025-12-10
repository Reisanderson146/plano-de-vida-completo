import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Moon } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize a aparência do seu aplicativo</p>
        </div>

        {/* Theme Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Tema do Aplicativo
            </CardTitle>
            <CardDescription>Escolha o estilo visual do seu Plano de Vida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Modo de Exibição</p>
                  <p className="text-xs text-muted-foreground">Claro, escuro ou automático</p>
                </div>
              </div>
              <DarkModeToggle />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Color Theme Selector */}
            <ThemeSelector
              selectedTheme={selectedTheme}
              onThemeChange={handleThemeChange}
            />
          </CardContent>
        </Card>

        {/* App Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre o Aplicativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usuário</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
