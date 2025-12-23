import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation, isValidEmail } from '@/hooks/useFormValidation';
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import loginBackground from '@/assets/login-background.png';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { errors, setFieldError, clearError, hasError, getError, clearAllErrors } = useFormValidation();

  // Detect password recovery flow
  useEffect(() => {
    const type = searchParams.get('type');
    
    if (type === 'recovery') {
      // Listen for the PASSWORD_RECOVERY event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
      });

      // Also check if we already have a session from recovery
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsPasswordRecovery(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [searchParams]);

  useEffect(() => {
    // Don't redirect if in password recovery mode
    if (isPasswordRecovery) return;
    
    // Redirect immediately when user is authenticated
    if (user) {
      navigate('/');
    }
  }, [user, navigate, isPasswordRecovery]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    // Validate fields
    let hasValidationError = false;
    
    if (!email.trim()) {
      setFieldError('signin-email', 'Digite seu email');
      hasValidationError = true;
    } else if (!isValidEmail(email)) {
      setFieldError('signin-email', 'Digite um email válido');
      hasValidationError = true;
    }
    
    if (!password) {
      setFieldError('signin-password', 'Digite sua senha');
      hasValidationError = true;
    }
    
    if (hasValidationError) return;
    
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setFieldError('signin-password', 'Email ou senha incorretos');
      } else {
        toast({
          title: 'Erro ao entrar',
          description: error.message,
          variant: 'destructive',
        });
      }
      // Redirect is handled by useEffect based on subscription status
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    // Validate fields
    let hasValidationError = false;
    
    if (!fullName.trim()) {
      setFieldError('signup-name', 'Digite seu nome completo');
      hasValidationError = true;
    } else if (fullName.trim().length < 2) {
      setFieldError('signup-name', 'Nome deve ter pelo menos 2 caracteres');
      hasValidationError = true;
    }
    
    if (!email.trim()) {
      setFieldError('signup-email', 'Digite seu email');
      hasValidationError = true;
    } else if (!isValidEmail(email)) {
      setFieldError('signup-email', 'Digite um email válido');
      hasValidationError = true;
    }
    
    if (!password) {
      setFieldError('signup-password', 'Digite uma senha');
      hasValidationError = true;
    } else if (password.length < 6) {
      setFieldError('signup-password', 'A senha deve ter pelo menos 6 caracteres');
      hasValidationError = true;
    }
    
    if (!confirmPassword) {
      setFieldError('signup-confirm-password', 'Confirme sua senha');
      hasValidationError = true;
    } else if (password !== confirmPassword) {
      setFieldError('signup-confirm-password', 'As senhas não coincidem');
      hasValidationError = true;
    }
    
    if (hasValidationError) return;
    
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setFieldError('signup-email', 'Este email já está cadastrado');
      } else {
        toast({
          title: 'Erro ao cadastrar',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      // Email confirmation required
      setPendingEmail(email);
      setEmailConfirmationPending(true);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    if (!email.trim()) {
      setFieldError('reset-email', 'Digite seu email para recuperar a senha');
      return;
    }
    
    if (!isValidEmail(email)) {
      setFieldError('reset-email', 'Digite um email válido');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha',
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    let hasValidationError = false;
    
    if (!newPassword) {
      setFieldError('new-password', 'Digite sua nova senha');
      hasValidationError = true;
    } else if (newPassword.length < 6) {
      setFieldError('new-password', 'A senha deve ter pelo menos 6 caracteres');
      hasValidationError = true;
    }
    
    if (!confirmNewPassword) {
      setFieldError('confirm-new-password', 'Confirme sua nova senha');
      hasValidationError = true;
    } else if (newPassword !== confirmNewPassword) {
      setFieldError('confirm-new-password', 'As senhas não coincidem');
      hasValidationError = true;
    }
    
    if (hasValidationError) return;
    
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
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setIsPasswordRecovery(false);
      toast({
        title: 'Senha atualizada!',
        description: 'Faça login com sua nova senha',
      });
      navigate('/auth');
    }
  };

  // Password Recovery View - Set New Password
  if (isPasswordRecovery) {
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
                  Nova Senha
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm sm:text-base font-normal">
                  Digite sua nova senha para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="px-7 sm:px-9 pb-9">
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-semibold text-foreground/90">
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          clearError('new-password');
                        }}
                        className={`h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50 pr-12 ${hasError('new-password') ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {hasError('new-password') && (
                      <p className="text-red-500 text-sm animate-fade-in">{getError('new-password')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-sm font-semibold text-foreground/90">
                      Confirmar Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        placeholder="Digite novamente"
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          clearError('confirm-new-password');
                        }}
                        className={`h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50 pr-12 ${hasError('confirm-new-password') ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {hasError('confirm-new-password') && (
                      <p className="text-red-500 text-sm animate-fade-in">{getError('confirm-new-password')}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg text-white" 
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Atualizar Senha
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
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

  // Email Confirmation Pending View
  if (emailConfirmationPending) {
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
                  <svg className="w-8 h-8 text-[#2A8C68]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                  Confirme seu Email
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm sm:text-base font-normal">
                  Enviamos um link de confirmação para:
                </CardDescription>
              </CardHeader>
              <CardContent className="px-7 sm:px-9 pb-9">
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-[#A8E6CE]/20 border border-[#7BC8A4]/30 text-center">
                    <p className="text-base font-semibold text-[#2A8C68] break-all">
                      {pendingEmail}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p className="text-center">
                      Clique no link enviado para ativar sua conta.
                    </p>
                    <p className="text-center text-xs">
                      Verifique também sua pasta de spam.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setEmailConfirmationPending(false);
                      setPendingEmail('');
                    }}
                    className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg text-white"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar ao login
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (showForgotPassword) {
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
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                  Recuperar Senha
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm sm:text-base font-normal">
                  {resetEmailSent 
                    ? 'Um email foi enviado com instruções para redefinir sua senha'
                    : 'Digite seu email para receber um link de recuperação'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="px-7 sm:px-9 pb-9">
                {resetEmailSent ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-[#A8E6CE]/20 border border-[#7BC8A4]/30 text-center">
                      <p className="text-sm text-[#2A8C68] font-medium">
                        Verifique sua caixa de entrada e spam
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmailSent(false);
                      }}
                      className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg text-white"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Voltar ao login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground/90">
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Enviar link de recuperação'
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full h-12 text-base font-medium rounded-2xl text-[#2A8C68] hover:bg-[#A8E6CE]/20"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                    </Button>
                  </form>
                )}
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      {/* Premium green overlay with smooth gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/60 via-[#7BC8A4]/40 to-[#2A8C68]/50 backdrop-blur-[2px]" />
      
      {/* Animated glow effects with green theme */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A8E6CE]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7BC8A4]/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2A8C68]/10 rounded-full blur-[150px]" />
      
      <div className="w-full max-w-[440px] animate-fade-in relative z-10">
        {/* Logo Section - Enhanced & Larger */}
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          {/* Large Logo Icon */}
          <Logo size="2xl" showText={false} showIcon={true} variant="light" className="drop-shadow-2xl mb-6" />
          
          {/* Title on single line with enhanced typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-4">
            Plano de Vida
          </h1>
          
          {/* New Slogan with refined typography */}
          <p className="text-white/90 text-center text-lg sm:text-xl font-light tracking-[0.15em] drop-shadow-md">
            Constância que constrói resultados.
          </p>
        </div>

        {/* Enhanced Glassmorphism Card */}
        <Card className="relative border-0 overflow-hidden rounded-[28px] shadow-[0_20px_60px_-10px_rgba(42,140,104,0.35)]">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-[28px] p-[1px] bg-gradient-to-br from-white/40 via-[#A8E6CE]/30 to-white/20">
            <div className="w-full h-full rounded-[27px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl" />
          </div>
          
          {/* Card content */}
          <div className="relative z-10">
            <CardHeader className="pb-3 pt-8 px-7 sm:px-9 text-center space-y-3">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                Bem-vindo!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm sm:text-base font-normal">
                Acesse sua conta e continue sua jornada
              </CardDescription>
            </CardHeader>
            <CardContent className="px-7 sm:px-9 pb-9">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-gradient-to-r from-[#A8E6CE]/20 via-[#7BC8A4]/15 to-[#A8E6CE]/20 rounded-2xl p-1.5 border border-[#7BC8A4]/20">
                  <TabsTrigger 
                    value="signin" 
                    className="text-sm sm:text-base font-semibold h-full rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2A8C68]/10 data-[state=active]:text-[#2A8C68] transition-all duration-300"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="text-sm sm:text-base font-semibold h-full rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2A8C68]/10 data-[state=active]:text-[#2A8C68] transition-all duration-300"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground/90">
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError('signin-email');
                        }}
                        error={hasError('signin-email')}
                        errorMessage={getError('signin-email')}
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-background dark:focus:bg-slate-800 focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground/90">
                          Senha
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs font-medium text-[#2A8C68] hover:text-[#238058] hover:underline transition-colors"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError('signin-password');
                          }}
                          error={hasError('signin-password')}
                          errorMessage={getError('signin-password')}
                          className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-background dark:focus:bg-slate-800 focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-5 text-muted-foreground/60 hover:text-[#2A8C68] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg shadow-[#2A8C68]/25 hover:shadow-xl hover:shadow-[#2A8C68]/35 hover:-translate-y-0.5 group text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Entrar
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground/90">
                        Nome completo
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          clearError('signup-name');
                        }}
                        error={hasError('signup-name')}
                        errorMessage={getError('signup-name')}
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground/90">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError('signup-email');
                        }}
                        error={hasError('signup-email')}
                        errorMessage={getError('signup-email')}
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-background dark:focus:bg-slate-800 focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground/90">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError('signup-password');
                          }}
                          error={hasError('signup-password')}
                          errorMessage={getError('signup-password')}
                          className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-background dark:focus:bg-slate-800 focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-5 text-muted-foreground/60 hover:text-[#2A8C68] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-semibold text-foreground/90">
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Digite a senha novamente"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearError('signup-confirm-password');
                          }}
                          error={hasError('signup-confirm-password')}
                          errorMessage={getError('signup-confirm-password')}
                          className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-background dark:focus:bg-slate-800 focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-5 text-muted-foreground/60 hover:text-[#2A8C68] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg shadow-[#2A8C68]/25 hover:shadow-xl hover:shadow-[#2A8C68]/35 hover:-translate-y-0.5 group text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Criar conta
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </Card>

        {/* Footer with enhanced styling */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-sm">
            Ao continuar, você concorda com nossos termos de uso
          </p>
          <p className="text-xs text-white/50">
            <a 
              href="/admin/login" 
              className="hover:text-white/80 transition-colors underline underline-offset-2"
            >
              Acesso administrativo
            </a>
          </p>
          <p className="text-xs text-white/40 pt-2">
            Versão 1.0 • Desenvolvido por Anderson Reis
          </p>
        </div>
      </div>
    </div>
  );
}
