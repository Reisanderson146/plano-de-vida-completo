import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Info, Volume2, VolumeX, Music, Play } from 'lucide-react';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSoundSettings, soundStyleConfigs, SoundStyle } from '@/hooks/useSoundSettings';
import { cn } from '@/lib/utils';

export default function Configuracoes() {
  const { user } = useAuth();
  const { soundEnabled, volume, style, toggleSound, setVolume, setStyle } = useSoundSettings();

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
