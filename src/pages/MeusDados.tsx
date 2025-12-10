import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Save, User, Calendar, Mail, Palette, RotateCcw } from 'lucide-react';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { useAreaCustomizations } from '@/hooks/useAreaCustomizations';

interface Profile {
  id: string;
  full_name: string | null;
  birth_year: number | null;
  avatar_url: string | null;
}

const COLOR_PRESETS = [
  '#8b5cf6', '#7c3aed', '#6d28d9', // Purple
  '#3b82f6', '#2563eb', '#1d4ed8', // Blue
  '#ec4899', '#db2777', '#be185d', // Pink
  '#f97316', '#ea580c', '#c2410c', // Orange
  '#22c55e', '#16a34a', '#15803d', // Green
  '#06b6d4', '#0891b2', '#0e7490', // Cyan
  '#ef4444', '#dc2626', '#b91c1c', // Red
  '#f59e0b', '#d97706', '#b45309', // Amber
];

export default function MeusDados() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { customizations, saveCustomization, resetCustomization, loading: areasLoading, refetch } = useAreaCustomizations();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Area customization state
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  const [areaLabel, setAreaLabel] = useState('');
  const [areaColor, setAreaColor] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setBirthYear(data.birth_year?.toString() || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar os dados do perfil.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBust })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithCacheBust);
      toast({
        title: 'Foto atualizada',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erro ao enviar foto',
        description: 'Não foi possível atualizar sua foto de perfil.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const updates = {
        full_name: fullName.trim() || null,
        birth_year: birthYear ? parseInt(birthYear) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleEditArea = (areaId: LifeArea) => {
    const customization = customizations.find(c => c.area_id === areaId);
    const defaultArea = LIFE_AREAS.find(a => a.id === areaId);
    
    setEditingArea(areaId);
    setAreaLabel(customization?.custom_label || defaultArea?.label || '');
    setAreaColor(customization?.custom_color || AREA_HEX_COLORS[areaId]);
  };

  const handleSaveArea = async () => {
    if (!editingArea) return;

    try {
      await saveCustomization(editingArea, areaLabel || null, areaColor || null);
      toast({ title: 'Área personalizada salva!' });
      setEditingArea(null);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a personalização.',
        variant: 'destructive',
      });
    }
  };

  const handleResetArea = async (areaId: LifeArea) => {
    try {
      await resetCustomization(areaId);
      toast({ title: 'Área restaurada ao padrão!' });
      if (editingArea === areaId) {
        setEditingArea(null);
      }
    } catch (error) {
      toast({
        title: 'Erro ao restaurar',
        description: 'Não foi possível restaurar a área.',
        variant: 'destructive',
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const calculatedAge = birthYear ? currentYear - parseInt(birthYear) : null;

  if (loading || areasLoading) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meus Dados</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
        </div>

        {/* Avatar Card */}
        <Card className="overflow-hidden">
          <div className="h-24 sm:h-32 gradient-hero" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-16">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-card shadow-lg">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName || 'Usuário'} />
                  <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left sm:pb-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {fullName || 'Usuário'}
                </h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthYear" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Ano de Nascimento
              </Label>
              <Input
                id="birthYear"
                type="number"
                placeholder="Ex: 1990"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                min={1900}
                max={currentYear}
              />
              {calculatedAge !== null && calculatedAge > 0 && (
                <p className="text-sm text-muted-foreground">
                  Idade atual: <span className="font-medium text-foreground">{calculatedAge} anos</span>
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Areas Customization Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Personalização das Áreas
            </CardTitle>
            <CardDescription>Personalize os nomes e cores das áreas do seu plano de vida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {LIFE_AREAS.map((area) => {
              const customization = customizations.find(c => c.area_id === area.id);
              const displayLabel = customization?.custom_label || area.label;
              const displayColor = customization?.custom_color || AREA_HEX_COLORS[area.id];
              const isEditing = editingArea === area.id;

              return (
                <div key={area.id} className="border rounded-lg p-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: areaColor }}
                        />
                        <span className="text-sm font-medium">Editando: {area.label}</span>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome da área</Label>
                        <Input
                          value={areaLabel}
                          onChange={(e) => setAreaLabel(e.target.value)}
                          placeholder={area.label}
                          maxLength={30}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Cor</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={areaColor}
                            onChange={(e) => setAreaColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <div className="flex flex-wrap gap-1">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                onClick={() => setAreaColor(color)}
                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${areaColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveArea}>
                          <Save className="w-3 h-3 mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingArea(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: displayColor }}
                        />
                        <div>
                          <p className="font-medium text-sm">{displayLabel}</p>
                          {customization && (
                            <p className="text-xs text-muted-foreground">Original: {area.label}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditArea(area.id)}>
                          Editar
                        </Button>
                        {customization && (
                          <Button size="sm" variant="ghost" onClick={() => handleResetArea(area.id)}>
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
