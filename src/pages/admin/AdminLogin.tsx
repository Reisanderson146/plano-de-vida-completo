import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Se já está logado e é admin, redireciona para o painel admin
    if (user && !adminLoading) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      }
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha email e senha.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        toast({
          title: 'Erro ao entrar',
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        setCheckingAdmin(true);
        
        // Verificar se o usuário é admin
        const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
        
        if (adminError || !isAdminResult) {
          // Não é admin - fazer logout e mostrar erro
          await supabase.auth.signOut();
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão de administrador.',
            variant: 'destructive',
          });
          setCheckingAdmin(false);
          setLoading(false);
          return;
        }

        // É admin - redirecionar para o painel
        toast({
          title: 'Bem-vindo, Admin!',
          description: 'Acesso autorizado ao painel administrativo.',
        });
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setCheckingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-slate-500/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-[420px] animate-fade-in relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-6">
            <Shield className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Painel Admin
          </h1>
          <p className="text-slate-400 text-center">
            Acesso restrito a administradores
          </p>
        </div>

        {/* Card */}
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4 pt-6 px-6 text-center">
            <CardTitle className="text-xl text-white">
              Autenticação Admin
            </CardTitle>
            <CardDescription className="text-slate-400">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium text-slate-300">
                  Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium text-slate-300">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 shadow-lg shadow-amber-500/25" 
                disabled={loading || checkingAdmin}
              >
                {loading || checkingAdmin ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {checkingAdmin ? 'Verificando permissões...' : 'Entrando...'}
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Entrar como Admin
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-sm text-slate-500">
                Não é administrador?{' '}
                <a 
                  href="/auth" 
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Acesse como usuário
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
