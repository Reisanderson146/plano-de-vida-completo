import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, User, Users, Baby, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanPhotoUploadProps {
  photoUrl: string | null;
  planType: string;
  userId: string;
  planId?: string;
  onPhotoChange: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PLAN_TYPE_ICONS = {
  individual: User,
  familiar: Users,
  filho: Baby,
};

export function PlanPhotoUpload({
  photoUrl,
  planType,
  userId,
  planId,
  onPhotoChange,
  size = 'md',
  className,
}: PlanPhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const Icon = PLAN_TYPE_ICONS[planType as keyof typeof PLAN_TYPE_ICONS] || User;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${planId || 'temp'}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('plan-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('plan-photos')
        .getPublicUrl(filePath);

      onPhotoChange(publicUrl);

      toast({
        title: 'Foto atualizada',
        description: 'A foto do plano foi atualizada com sucesso.',
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Erro ao enviar foto',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
  };

  return (
    <div className={cn('relative inline-block group', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Avatar className={cn(sizeClasses[size], 'border-2 border-border/50 shadow-sm')}>
        <AvatarImage src={photoUrl || undefined} alt="Foto do plano" className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
          <Icon className={cn(iconSizes[size], 'text-primary/60')} />
        </AvatarFallback>
      </Avatar>

      {/* Upload overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-full',
          'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
          uploading && 'opacity-100'
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Remove button */}
      {photoUrl && !uploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePhoto();
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}