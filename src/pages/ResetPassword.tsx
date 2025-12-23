import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import loginBackground from '@/assets/login-background.png';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for access token in hash or wait for Supabase to process it
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    console.log('ResetPassword: Checking auth state', { accessToken: !!accessToken, type });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('ResetPassword: Auth event:', event, 'Session:', !!session);
      
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) {
          setSessionValid(true);
          setVerifying(false);
        }
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('ResetPassword: Current session:', !!session);
      if (session) {
        setSessionValid(true);
      }
      // Give a moment for auth to process the hash tokens
      setTimeout(() => {
        setVerifying(false);
      }, 1500);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setConfirmError(null);

    // Validation
    if (!newPassword) {
      setPasswordError('Digite sua nova senha');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (!confirmPassword) {
      setConfirmError('Confirme sua nova senha');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSuccess(true);
      // Sign out and redirect to login after a moment
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 3000);
    }
  };

  // Loading state while verifying
  if (verifying) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/60 via-[#7BC8A4]/40 to-[#2A8C68]/50 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <p className="text-white text-lg font-medium">Verificando link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (!sessionValid) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/60 via-[#7BC8A4]/40 to-[#2A8C68]/50 backdrop-blur-[2px]" />
        <Card className="relative z-10 w-full max-w-md border-0 rounded-[28px] shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Link Inválido</CardTitle>
            <CardDescription className="text-muted-foreground">
              Este link de recuperação expirou ou é inválido. Solicite um novo link de recuperação de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#2A8C68] to-[#7BC8A4] hover:opacity-90 text-white font-semibold text-base"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/60 via-[#7BC8A4]/40 to-[#2A8C68]/50 backdrop-blur-[2px]" />
        <Card className="relative z-10 w-full max-w-md border-0 rounded-[28px] shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Senha Atualizada!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua senha foi redefinida com sucesso. Você será redirecionado para a tela de login...
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#2A8C68]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password reset form
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/60 via-[#7BC8A4]/40 to-[#2A8C68]/50 backdrop-blur-[2px]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A8E6CE]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7BC8A4]/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      
      <div className="w-full max-w-[440px] animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <Logo size="2xl" showText={false} showIcon={true} variant="light" className="drop-shadow-2xl mb-6" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-4">
            Plano de Vida
          </h1>
          <p className="text-white/90 text-center text-lg sm:text-xl font-light tracking-[0.15em] drop-shadow-md">
            Constância que constrói resultados.
          </p>
        </div>

        <Card className="relative border-0 overflow-hidden rounded-[28px] shadow-[0_20px_60px_-10px_rgba(42,140,104,0.35)]">
          <div className="absolute inset-0 rounded-[28px] p-[1px] bg-gradient-to-br from-white/40 via-[#A8E6CE]/30 to-white/20">
            <div className="w-full h-full rounded-[27px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <CardHeader className="pb-3 pt-8 px-7 sm:px-9 text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#A8E6CE]/30 flex items-center justify-center mb-2">
                <KeyRound className="w-8 h-8 text-[#2A8C68]" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                Redefinir Senha
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm sm:text-base font-normal">
                Digite sua nova senha para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="px-7 sm:px-9 pb-9">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-semibold text-foreground/90">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError(null);
                      }}
                      className={`h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50 pr-12 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm animate-fade-in">{passwordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground/90">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Digite novamente"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmError(null);
                      }}
                      className={`h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50 pr-12 ${confirmError ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmError && (
                    <p className="text-red-500 text-sm animate-fade-in">{confirmError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#2A8C68] to-[#7BC8A4] hover:opacity-90 text-white font-semibold text-base shadow-lg shadow-[#2A8C68]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#2A8C68]/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Atualizando...
                    </>
                  ) : (
                    'Redefinir Senha'
                  )}
                </Button>
              </form>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
