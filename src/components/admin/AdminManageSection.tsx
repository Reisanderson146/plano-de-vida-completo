import { Shield, ShieldCheck, ShieldOff, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  full_name: string | null;
  isAdmin?: boolean;
}

interface AdminManageSectionProps {
  users: UserProfile[];
  currentUserId?: string;
  updatingAdminRole: string | null;
  onOpenConfirmDialog: (user: UserProfile) => void;
}

export function AdminManageSection({ 
  users, 
  currentUserId, 
  updatingAdminRole,
  onOpenConfirmDialog 
}: AdminManageSectionProps) {
  const otherUsers = users.filter(u => u.id !== currentUserId);
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900/80 border border-amber-500/20 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-500/10 bg-amber-500/5">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-400">Gerenciar Administradores</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Conceda ou remova permissões de administrador
          </p>
        </div>
      </div>
      
      <div className="p-4">
        {otherUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 opacity-50" />
            </div>
            <p className="text-sm">Nenhum outro usuário cadastrado</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {otherUsers.map((user) => (
              <div 
                key={user.id} 
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200",
                  user.isAdmin 
                    ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" 
                    : "border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-semibold",
                    user.isAdmin 
                      ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white" 
                      : "bg-slate-700 text-slate-300"
                  )}>
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">
                      {user.full_name || 'Sem nome'}
                    </p>
                    <p className={cn(
                      "text-xs",
                      user.isAdmin ? "text-amber-400/80" : "text-slate-500"
                    )}>
                      {user.isAdmin ? 'Administrador' : 'Usuário comum'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant={user.isAdmin ? "outline" : "default"}
                  size="sm"
                  onClick={() => onOpenConfirmDialog(user)}
                  disabled={updatingAdminRole === user.id}
                  className={cn(
                    "transition-all duration-200",
                    user.isAdmin 
                      ? "border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500" 
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                  )}
                >
                  {updatingAdminRole === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user.isAdmin ? (
                    <>
                      <ShieldOff className="w-4 h-4 mr-1.5" />
                      Remover
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Tornar Admin
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
