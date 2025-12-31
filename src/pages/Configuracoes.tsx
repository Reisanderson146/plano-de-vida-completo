import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Info, Volume2, VolumeX, Music, Play, User, CreditCard, RotateCcw, Vibrate, Smartphone } from 'lucide-react';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSoundSettings, soundStyleConfigs, SoundStyle, vibrationStyleConfigs, VibrationStyle } from '@/hooks/useSoundSettings';
import { useTour } from '@/hooks/useTour';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    soundEnabled, volume, style, 
    vibrationEnabled, vibrationStyle,
    toggleSound, setVolume, setStyle,
    toggleVibration, setVibrationStyle 
  } = useSoundSettings();
  const { restartTour } = useTour();

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

  const testVibration = () => {
    if (!vibrationEnabled || vibrationStyle === 'none') return;
    
    if ('vibrate' in navigator) {
      const pattern = vibrationStyleConfigs[vibrationStyle].pattern;
      navigator.vibrate(pattern);
    } else {
      toast({
        title: 'Vibração não suportada',
        description: 'Seu dispositivo não suporta vibração.',
        variant: 'destructive',
      });
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

  const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">Personalize seu aplicativo</p>
        </div>

        {/* Quick Links - More compact on mobile */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <Link to="/meus-dados">
            <Card className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center py-3 sm:py-6 text-center p-2 sm:p-4">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:bg-primary/20 transition-colors">
                  <User className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-[10px] sm:text-sm font-medium text-foreground leading-tight">Meus Dados</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/conta">
            <Card className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center py-3 sm:py-6 text-center p-2 sm:p-4">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:bg-emerald-500/20 transition-colors">
                  <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
                </div>
                <span className="text-[10px] sm:text-sm font-medium text-foreground leading-tight">Assinatura</span>
              </CardContent>
            </Card>
          </Link>
          
          <Card 
            className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full"
            onClick={handleRestartTour}
          >
            <CardContent className="flex flex-col items-center justify-center py-3 sm:py-6 text-center p-2 sm:p-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-violet-500/10 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:bg-violet-500/20 transition-colors">
                <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6 text-violet-500" />
              </div>
              <span className="text-[10px] sm:text-sm font-medium text-foreground leading-tight">Ver Tour</span>
            </CardContent>
          </Card>

          <Link to="/guia">
            <Card className="border-border/40 hover:border-border transition-colors cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center py-3 sm:py-6 text-center p-2 sm:p-4">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:bg-amber-500/20 transition-colors">
                  <Info className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />
                </div>
                <span className="text-[10px] sm:text-sm font-medium text-foreground leading-tight">Guia</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Dark Mode Card - Compact */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Modo de Exibição
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Modo claro, escuro ou automático</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-background shadow-sm">
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Aparência</p>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Claro, escuro ou automático</p>
                </div>
              </div>
              <DarkModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings Card - Compact */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              {getVolumeIcon()}
              Sons do Sistema
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure os efeitos sonoros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-background shadow-sm">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  ) : (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Efeitos Sonoros</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {soundEnabled ? 'Ativados' : 'Desativados'}
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
              "p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 space-y-3 sm:space-y-4 transition-opacity",
              !soundEnabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-background shadow-sm">
                    {getVolumeIcon()}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Volume</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{getVolumeLabel()}</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-primary">{Math.round(volume * 100)}%</span>
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
              "space-y-3 sm:space-y-4 transition-opacity",
              !soundEnabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-4">
                <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-muted/50">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Estilo de Som</p>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Escolha o estilo dos efeitos</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {(Object.keys(soundStyleConfigs) as SoundStyle[]).map((styleKey) => {
                  const config = soundStyleConfigs[styleKey];
                  const isSelected = style === styleKey;
                  
                  return (
                    <button
                      key={styleKey}
                      onClick={() => setStyle(styleKey)}
                      disabled={!soundEnabled}
                      className={cn(
                        "relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all",
                        "hover:border-primary/50 hover:bg-muted/30",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border bg-background"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                      )}
                      <p className="text-xs sm:text-sm font-medium text-foreground">{config.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{config.description}</p>
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
                className="w-full gap-2 h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Ouvir Prévia
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vibration Settings Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Vibrate className={cn("w-4 h-4 sm:w-5 sm:h-5", vibrationEnabled ? "text-primary" : "text-muted-foreground")} />
              Vibração
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure o feedback tátil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
            {!supportsVibration && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Vibração disponível apenas em dispositivos móveis
                </p>
              </div>
            )}
            
            {/* Enable/Disable Toggle */}
            <div className={cn(
              "flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50",
              !supportsVibration && "opacity-50"
            )}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-background shadow-sm">
                  <Vibrate className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5",
                    vibrationEnabled ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Feedback Tátil</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {vibrationEnabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <Switch
                checked={vibrationEnabled}
                onCheckedChange={toggleVibration}
                disabled={!supportsVibration}
                aria-label="Ativar vibração"
              />
            </div>

            {/* Vibration Style Selection */}
            <div className={cn(
              "space-y-3 sm:space-y-4 transition-opacity",
              (!vibrationEnabled || !supportsVibration) && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-4">
                <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-muted/50">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Estilo de Vibração</p>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Escolha o padrão de vibração</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {(Object.keys(vibrationStyleConfigs) as VibrationStyle[]).map((styleKey) => {
                  const config = vibrationStyleConfigs[styleKey];
                  const isSelected = vibrationStyle === styleKey;
                  
                  return (
                    <button
                      key={styleKey}
                      onClick={() => setVibrationStyle(styleKey)}
                      disabled={!vibrationEnabled || !supportsVibration}
                      className={cn(
                        "relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all",
                        "hover:border-primary/50 hover:bg-muted/30",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border bg-background"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                      )}
                      <p className="text-xs sm:text-sm font-medium text-foreground">{config.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{config.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Test Vibration Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={testVibration}
                disabled={!vibrationEnabled || !supportsVibration || vibrationStyle === 'none'}
                className="w-full gap-2 h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Vibrate className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Testar Vibração
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info Card - Compact */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Sobre o Aplicativo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid gap-2 sm:gap-3">
              <div className="flex justify-between items-center p-2.5 sm:p-3 rounded-md sm:rounded-lg bg-muted/30">
                <span className="text-xs sm:text-sm text-muted-foreground">Versão</span>
                <span className="text-xs sm:text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 rounded-md sm:rounded-lg bg-muted/30">
                <span className="text-xs sm:text-sm text-muted-foreground">Usuário</span>
                <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">{user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
