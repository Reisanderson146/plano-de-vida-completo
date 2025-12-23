import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AdminHeader({ onRefresh, isLoading }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
          <Shield className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Gerencie usuários, assinaturas e visualize estatísticas
          </p>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );
}
