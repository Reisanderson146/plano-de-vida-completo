import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Shield, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  UserCheck, 
  UserX, 
  ArrowUpDown,
  Loader2,
  Crown,
  Gem,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserPlan {
  id: string;
  title: string;
  plan_type: string;
  member_name: string | null;
  created_at: string;
  goals_count: number;
  completed_count: number;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  created_at: string;
  is_blocked: boolean;
  email?: string;
  isAdmin?: boolean;
  subscription_plan: string | null;
  subscription_status: string | null;
}

interface AdminUserCardProps {
  user: UserProfile;
  currentUserId?: string;
  plans?: UserPlan[];
  isExpanded: boolean;
  isLoadingPlans: boolean;
  isUpdatingUser: boolean;
  isUpdatingSubscription: boolean;
  onToggleExpand: () => void;
  onToggleBlock: () => void;
  onOpenSubscriptionDialog: () => void;
}

const getPlanTypeLabel = (type: string) => {
  switch (type) {
    case 'individual': return 'Individual';
    case 'familiar': return 'Familiar';
    case 'filho': return 'Filho';
    default: return type;
  }
};

const getPlanTypeColor = (type: string) => {
  switch (type) {
    case 'individual': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'familiar': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'filho': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export function AdminUserCard({
  user,
  currentUserId,
  plans,
  isExpanded,
  isLoadingPlans,
  isUpdatingUser,
  isUpdatingSubscription,
  onToggleExpand,
  onToggleBlock,
  onOpenSubscriptionDialog,
}: AdminUserCardProps) {
  const isCurrentUser = user.id === currentUserId;
  
  return (
    <div className={cn(
      "group rounded-xl border transition-all duration-300",
      user.is_blocked 
        ? "bg-red-950/20 border-red-500/30" 
        : user.isAdmin 
          ? "bg-gradient-to-r from-amber-950/20 to-slate-800/50 border-amber-500/30"
          : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
    )}>
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div className={cn(
              "relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-105",
              user.isAdmin 
                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white" 
                : user.is_blocked
                  ? "bg-red-500/20 text-red-400"
                  : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300"
            )}>
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
              {user.isAdmin && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Name and Badges */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white truncate">
                  {user.full_name || 'Usuário sem nome'}
                </p>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-[10px] border-slate-500 text-slate-400">
                    Você
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Subscription Badge */}
                {user.subscription_plan === 'premium' ? (
                  <Badge className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                ) : user.subscription_plan === 'basic' ? (
                  <Badge className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                    <Gem className="w-3 h-3 mr-1" />
                    Basic
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-slate-600 text-slate-500">
                    Sem plano
                  </Badge>
                )}
                
                {/* Blocked Badge */}
                {user.is_blocked && (
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                    <UserX className="w-3 h-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
                
                {/* Date */}
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(user.created_at), 'dd MMM yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              disabled={isLoadingPlans}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {isLoadingPlans ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Planos</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </>
              )}
            </Button>
            
            {!isCurrentUser && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSubscriptionDialog}
                  disabled={isUpdatingSubscription}
                  className="border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60"
                >
                  {isUpdatingSubscription ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1.5">Plano</span>
                    </>
                  )}
                </Button>
                
                <Button
                  variant={user.is_blocked ? "default" : "destructive"}
                  size="sm"
                  onClick={onToggleBlock}
                  disabled={isUpdatingUser}
                  className={cn(
                    user.is_blocked && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {isUpdatingUser ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user.is_blocked ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1.5">Desbloquear</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1.5">Bloquear</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Plans Section */}
      {isExpanded && plans && (
        <div className="px-4 pb-4">
          <div className="pt-3 border-t border-slate-700/50">
            {plans.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-slate-500">
                <Target className="w-5 h-5 mr-2 opacity-50" />
                <span className="text-sm">Nenhum plano criado</span>
              </div>
            ) : (
              <div className="grid gap-2">
                {plans.map((plan) => {
                  const progress = plan.goals_count > 0 
                    ? Math.round((plan.completed_count / plan.goals_count) * 100) 
                    : 0;
                  
                  return (
                    <div 
                      key={plan.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                          <Target className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">{plan.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={cn("text-[10px] border", getPlanTypeColor(plan.plan_type))}>
                              {getPlanTypeLabel(plan.plan_type)}
                            </Badge>
                            {plan.member_name && (
                              <span className="text-[11px] text-slate-500">
                                {plan.member_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Progress Bar */}
                        <div className="hidden sm:block w-24">
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                progress === 100 
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                                  : "bg-gradient-to-r from-blue-500 to-blue-400"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {plan.completed_count}/{plan.goals_count}
                          </p>
                          <p className="text-[10px] text-slate-500">metas</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
