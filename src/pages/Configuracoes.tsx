import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Moon, Info, Bell, Mail, Smartphone, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useReminderSettings, ReminderSetting } from '@/hooks/useReminderSettings';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const reminderTypeLabels = {
  check_in: { label: 'Metas Realizadas', icon: CheckCircle2, description: 'Lembretes para atualizar o progresso das metas' },
  deadline: { label: 'Prazos', icon: Clock, description: 'Alertas quando metas estão próximas do vencimento' },
  annual_review: { label: 'Revisão Anual', icon: Calendar, description: 'Lembrete para fazer o balanço de fim de ano' },
};

const frequencyLabels = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, isLoading: loadingSettings, updateSetting } = useReminderSettings();

  const handleSettingChange = (setting: ReminderSetting, field: keyof ReminderSetting, value: any) => {
    updateSetting({
      id: setting.id,
      updates: { [field]: value },
    });
    toast({
      title: 'Configuração salva!',
      description: 'Suas preferências de lembrete foram atualizadas.',
    });
  };

  if (loadingSettings) {
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
          <p className="text-muted-foreground mt-1">Personalize as notificações do seu aplicativo</p>
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

        {/* Reminders Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Lembretes
            </CardTitle>
            <CardDescription>Configure como e quando você deseja receber lembretes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings.map((setting) => {
              const typeInfo = reminderTypeLabels[setting.reminder_type];
              const Icon = typeInfo.icon;

              return (
                <div key={setting.id} className="p-4 rounded-xl bg-muted/50 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-background shadow-sm">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{typeInfo.label}</p>
                        <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(checked) => handleSettingChange(setting, 'enabled', checked)}
                    />
                  </div>

                  {setting.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor={`email-${setting.id}`} className="text-sm">Email</Label>
                        </div>
                        <Switch
                          id={`email-${setting.id}`}
                          checked={setting.email_enabled}
                          onCheckedChange={(checked) => handleSettingChange(setting, 'email_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor={`inapp-${setting.id}`} className="text-sm">In-App</Label>
                        </div>
                        <Switch
                          id={`inapp-${setting.id}`}
                          checked={setting.in_app_enabled}
                          onCheckedChange={(checked) => handleSettingChange(setting, 'in_app_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <Label className="text-sm text-muted-foreground">Frequência</Label>
                        <Select
                          value={setting.frequency}
                          onValueChange={(value) => handleSettingChange(setting, 'frequency', value)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(frequencyLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
