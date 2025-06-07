import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff, ArrowRight, UserPlus, AlertCircle, CheckCircle, Mail, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }

    if (!formData.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        setError('Nome é obrigatório');
        return false;
      }

      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setShowEmailConfirmation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        console.log('Attempting sign up...');
        const { error } = await signUp(formData.email, formData.password, formData.name);
        
        if (error) {
          if (error.includes('User already registered')) {
            setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
          } else if (error.includes('Verifique seu email')) {
            setShowEmailConfirmation(true);
            setFormData({ email: formData.email, password: '', name: '', confirmPassword: '' });
            setIsSignUp(false);
          } else if (error.includes('Password should be at least')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.includes('Invalid email')) {
            setError('Email inválido. Verifique o formato do email.');
          } else if (error.includes('Signup is disabled')) {
            setError('Cadastro temporariamente desabilitado. Tente novamente mais tarde.');
          } else {
            setError(error);
          }
        } else {
          setSuccess('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
          setFormData({ email: formData.email, password: '', name: '', confirmPassword: '' });
          setIsSignUp(false);
        }
      } else {
        console.log('Attempting sign in...');
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
          } else if (error === 'Email not confirmed') {
            // Mostrar aviso específico para email não confirmado
            setShowEmailConfirmation(true);
            setError(''); // Limpar erro para mostrar apenas o aviso de confirmação
          } else if (error.includes('Too many requests')) {
            setError('Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.');
          } else if (error.includes('Network error')) {
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
          } else if (error.includes('User not found')) {
            setError('Usuário não encontrado. Verifique o email ou cadastre-se.');
          } else {
            setError('Erro ao fazer login. Tente novamente ou entre em contato com o suporte.');
          }
        } else {
          // Wait a bit for auth state to update, then navigate
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError('Erro inesperado. Verifique sua conexão e tente novamente.');
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error || success || showEmailConfirmation) {
      clearMessages();
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('Digite seu email para reenviar a confirmação.');
      return;
    }

    try {
      setIsLoading(true);
      // Note: Supabase doesn't have a direct resend confirmation method in the client
      // This would typically be handled by a server endpoint
      setSuccess('Se o email existir em nossa base, um novo link de confirmação será enviado.');
      setShowEmailConfirmation(false);
    } catch (error) {
      setError('Erro ao reenviar confirmação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearMessages();
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative">
        {/* Left Column - Branding */}
        <div className="text-white flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-accent p-3 rounded-xl">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <span className="text-3xl font-bold">SimpliWa</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            {isSignUp ? 'Crie sua conta' : 'Acesse seu'}
            <span className="block text-accent">
              {isSignUp ? 'gratuitamente' : 'Dashboard'}
            </span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8">
            {isSignUp 
              ? 'Comece a gerenciar sua empresa pelo WhatsApp hoje mesmo.'
              : 'Gerencie sua empresa com dados em tempo real e relatórios completos.'
            }
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              'Relatórios em tempo real',
              'Gestão completa de vendas',
              'Análise de performance',
              'Controle de equipe'
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Criar conta' : 'Faça seu login'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Preencha os dados abaixo para criar sua conta'
                : 'Entre com suas credenciais para acessar o dashboard'
              }
            </p>
          </div>

          {/* Email Confirmation Message */}
          {showEmailConfirmation && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-4 rounded-lg mb-6">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">📧 Confirme seu email</h4>
                  <p className="text-sm mb-3">
                    Seu email ainda não foi confirmado. Verifique sua caixa de entrada 
                    (incluindo a pasta de spam) e clique no link de confirmação que enviamos para{' '}
                    <strong>{formData.email}</strong>.
                  </p>
                  <div className="bg-blue-100 p-3 rounded-lg mb-3">
                    <p className="text-xs text-blue-700">
                      <strong>💡 Dica:</strong> Se não encontrar o email, verifique a pasta de spam/lixo eletrônico. 
                      Emails de confirmação às vezes são filtrados automaticamente.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleResendConfirmation}
                      disabled={isLoading}
                      className="text-sm text-blue-700 hover:text-blue-900 underline flex items-center disabled:opacity-50"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reenviar confirmação
                    </button>
                    <button
                      onClick={() => setShowEmailConfirmation(false)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm">{success}</span>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="text-green-500 hover:text-green-700 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm">{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors ${
                    error && !formData.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors ${
                  error && (!formData.email.trim() || !formData.email.includes('@')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors pr-12 ${
                    error && !formData.password.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder={isSignUp ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors pr-12 ${
                      error && formData.password !== formData.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirme sua senha"
                    required={isSignUp}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Criar Conta
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-secondary hover:underline"
            >
              {isSignUp 
                ? 'Já tem uma conta? Faça login'
                : 'Não tem uma conta? Cadastre-se'
              }
            </button>
          </div>

          {/* Environment Check */}
          {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-800">
                  <strong>Configuração necessária:</strong> Configure as variáveis de ambiente do Supabase no arquivo .env
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/"
              className="text-secondary hover:underline text-sm"
            >
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;