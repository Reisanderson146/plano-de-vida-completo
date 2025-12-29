import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Info, Volume2, VolumeX, Music, Play, Bell, User, CreditCard, RotateCcw, Mail, Smartphone } from 'lucide-react';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useSoundSettings, soundStyleConfigs, SoundStyle } from '@/hooks/useSoundSettings';
import { useTour } from '@/hooks/useTour';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReminderSettings {
  goal_reminders: { enabled: boolean; email_enabled: boolean; in_app_enabled: boolean };
  weekly_summary: { enabled: boolean; email_enabled: boolean; in_app_enabled: boolean };
}

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { soundEnabled, volume, style, toggleSound, setVolume, setStyle } = useSoundSettings();
  const { restartTour } = useTour();

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    goal_reminders: { enabled: true, email_enabled: true, in_app_enabled: true },
    weekly_summary: { enabled: false, email_enabled: false, in_app_enabled: true },
  });
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [savingReminders, setSavingReminders] = useState(false);

  useEffect(() => {
    if (user) {
      loadReminderSettings();
    }
  }, [user]);

  const loadReminderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const settings: ReminderSettings = {
          goal_reminders: { enabled: true, email_enabled: true, in_app_enabled: true },
          weekly_summary: { enabled: false, email_enabled: false, in_app_enabled: true },
        };

        data.forEach((setting) => {
          if (setting.reminder_type === 'goal_reminders') {
            settings.goal_reminders = {
              enabled: setting.enabled,
              email_enabled: setting.email_enabled,
              in_app_enabled: setting.in_app_enabled,
            };
          } else if (setting.reminder_type === 'weekly_summary') {
            settings.weekly_summary = {
              enabled: setting.enabled,
              email_enabled: setting.email_enabled,
              in_app_enabled: setting.in_app_enabled,
            };
          }
        });

        setReminderSettings(settings);
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    } finally {
      setLoadingReminders(false);
    }
  };

  const saveReminderSetting = async (
    type: 'goal_reminders' | 'weekly_summary',
    field: 'enabled' | 'email_enabled' | 'in_app_enabled',
    value: boolean
  ) => {
    setSavingReminders(true);

    try {
      const newSettings = {
        ...reminderSettings[type],
        [field]: value,
      };

      // Update local state immediately
      setReminderSettings((prev) => ({
        ...prev,
        [type]: newSettings,
      }));

      // Upsert to database
      const { error } = await supabase
        .from('reminder_settings')
        .upsert({
          user_id: user!.id,
          reminder_type: type,
          enabled: newSettings.enabled,
          email_enabled: newSettings.email_enabled,
          in_app_enabled: newSettings.in_app_enabled,
        }, {
          onConflict: 'user_id,reminder_type'
        });

      if (error) throw error;

      toast({
        title: 'Configuração salva',
        description: 'Suas preferências de notificação foram atualizadas.',
      });
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a configuração.',
        variant: 'destructive',
      });
      // Revert local state
      loadReminderSettings();
    } finally {
      setSavingReminders(false);
    }
  };

  const handleRestartTour = () => {
    restartTour();
    toast({
      title: 'Tour reiniciado',
      description: 'O tour interativo começará na próxima navegação.',
    });
  };

  const playPreviewSound = () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);

      const config = soundStyleConfigs[style];
      
      config.celebrationNotes.forEach(({ freq, time, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = config.oscillatorType;
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + time);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
        
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + duration + 0.05);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  const getVolumeIcon = () => {
    if (!soundEnabled || volume === 0) return <VolumeX className="w-5 h-5 text-muted-foreground" />;
    return <Volume2 className="w-5 h-5 text-primary" />;
  };

  const getVolumeLabel = () => {
    if (!soundEnabled) return 'Sons desativados';
    if (volume === 0) return 'Mudo';
    if (volume < 0.3) return 'Volume baixo';
    if (volume < 0.7) return 'Volume médio';
    return 'Volume alto';
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize seu aplicativo</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/meus-dados">
            <Card className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Meus Dados</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/conta">
            <Card className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                  <CreditCard className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Assinatura</span>
              </CardContent>
            </Card>
          </Link>
          
          <Card 
            className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full"
            onClick={handleRestartTour}
          >
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3 group-hover:bg-violet-500/20 transition-colors">
                <RotateCcw className="w-6 h-6 text-violet-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Ver Tour</span>
            </CardContent>
          </Card>

          <Link to="/guia">
            <Card className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                  <Info className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Guia</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações e Lembretes
            </CardTitle>
            <CardDescription>Configure como deseja receber lembretes sobre suas metas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingReminders ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : (
              <>
                {/* Goal Reminders */}
                <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-background shadow-sm">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Lembretes de Metas</p>
                        <p className="text-sm text-muted-foreground">Notificações sobre metas próximas do prazo</p>
                      </div>
                    </div>
                    <Switch
                      checked={reminderSettings.goal_reminders.enabled}
                      onCheckedChange={(checked) => saveReminderSetting('goal_reminders', 'enabled', checked)}
                      disabled={savingReminders}
                    />
                  </div>
                  
                  {reminderSettings.goal_reminders.enabled && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminderSettings.goal_reminders.email_enabled}
                          onCheckedChange={(checked) => saveReminderSetting('goal_reminders', 'email_enabled', checked)}
                          disabled={savingReminders}
                          id="goal-email"
                        />
                        <label htmlFor="goal-email" className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          Email
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminderSettings.goal_reminders.in_app_enabled}
                          onCheckedChange={(checked) => saveReminderSetting('goal_reminders', 'in_app_enabled', checked)}
                          disabled={savingReminders}
                          id="goal-app"
                        />
                        <label htmlFor="goal-app" className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                          No App
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weekly Summary */}
                <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-background shadow-sm">
                        <Mail className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium">Resumo Semanal</p>
                        <p className="text-sm text-muted-foreground">Receba um resumo do seu progresso toda semana</p>
                      </div>
                    </div>
                    <Switch
                      checked={reminderSettings.weekly_summary.enabled}
                      onCheckedChange={(checked) => saveReminderSetting('weekly_summary', 'enabled', checked)}
                      disabled={savingReminders}
                    />
                  </div>
                  
                  {reminderSettings.weekly_summary.enabled && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminderSettings.weekly_summary.email_enabled}
                          onCheckedChange={(checked) => saveReminderSetting('weekly_summary', 'email_enabled', checked)}
                          disabled={savingReminders}
                          id="summary-email"
                        />
                        <label htmlFor="summary-email" className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          Email
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminderSettings.weekly_summary.in_app_enabled}
                          onCheckedChange={(checked) => saveReminderSetting('weekly_summary', 'in_app_enabled', checked)}
                          disabled={savingReminders}
                          id="summary-app"
                        />
                        <label htmlFor="summary-app" className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                          No App
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dark Mode Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Modo de Exibição
            </CardTitle>
            <CardDescription>Escolha entre modo claro, escuro ou automático</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-background shadow-sm">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Aparência</p>
                  <p className="text-sm text-muted-foreground">Claro, escuro ou automático</p>
                </div>
              </div>
              <DarkModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {getVolumeIcon()}
              Sons do Sistema
            </CardTitle>
            <CardDescription>Configure os efeitos sonoros do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-background shadow-sm">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-primary" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Efeitos Sonoros</p>
                  <p className="text-sm text-muted-foreground">
                    {soundEnabled ? 'Sons ativados' : 'Sons desativados'}
                  </p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={toggleSound}
                aria-label="Ativar sons do sistema"
              />
            </div>

            {/* Volume Slider */}
            <div className={cn(
              "p-4 rounded-xl bg-muted/50 space-y-4 transition-opacity",
              !soundEnabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-background shadow-sm">
                    {getVolumeIcon()}
                  </div>
                  <div>
                    <p className="font-medium">Volume</p>
                    <p className="text-sm text-muted-foreground">{getVolumeLabel()}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={([v]) => setVolume(v / 100)}
                max={100}
                step={5}
                className="w-full"
                disabled={!soundEnabled}
              />
            </div>

            {/* Sound Style Selection */}
            <div className={cn(
              "space-y-4 transition-opacity",
              !soundEnabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-3 px-4">
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Estilo de Som</p>
                  <p className="text-sm text-muted-foreground">Escolha o estilo dos efeitos sonoros</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(soundStyleConfigs) as SoundStyle[]).map((styleKey) => {
                  const config = soundStyleConfigs[styleKey];
                  const isSelected = style === styleKey;
                  
                  return (
                    <button
                      key={styleKey}
                      onClick={() => setStyle(styleKey)}
                      disabled={!soundEnabled}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all",
                        "hover:border-primary/50 hover:bg-muted/30",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border bg-background"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <p className="font-medium text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Preview Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={playPreviewSound}
                disabled={!soundEnabled}
                className="w-full gap-2"
              >
                <Play className="w-4 h-4" />
                Ouvir Prévia do Som
              </Button>
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
