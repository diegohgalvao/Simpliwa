import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff, ArrowRight, UserPlus, AlertCircle, CheckCircle, Mail, X, RefreshCw, Crown, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlanOption {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const Login = () => {
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan') as 'starter' | 'professional' | 'enterprise' | null;
  
  const [currentStep, setCurrentStep] = useState<'plan' | 'signup' | 'login'>(
    planFromUrl ? 'signup' : 'login'
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    companyName: '',
    companySegment: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const plans: PlanOption[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 97,
      description: 'Perfeito para pequenos negócios começando a se organizar',
      features: [
        'Até 1.000 mensagens/mês',
        'Dashboard básico',
        'Relatórios essenciais',
        'Suporte por email',
        '1 usuário',
        'Backup automático'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 197,
      description: 'Ideal para empresas em crescimento que precisam de mais controle',
      features: [
        'Mensagens ilimitadas',
        'Dashboard completo',
        'Relatórios avançados',
        'Suporte prioritário',
        'Até 5 usuários',
        'Automações personalizadas',
        'API de integração',
        'Relatórios personalizados'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 397,
      description: 'Para empresas estabelecidas que querem o máximo de poder',
      features: [
        'Tudo do Professional',
        'Usuários ilimitados',
        'Suporte 24/7',
        'Gestor de conta dedicado',
        'Integrações customizadas',
        'Whitelabel disponível',
        'Treinamento da equipe',
        'SLA garantido'
      ]
    }
  ];

  // Set selected plan from URL parameter
  useEffect(() => {
    if (planFromUrl) {
      const plan = plans.find(p => p.id === planFromUrl);
      if (plan) {
        setSelectedPlan(plan);
        setCurrentStep('signup');
        setIsSignUp(true);
      }
    }
  }, [planFromUrl]);

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

    if (isSignUp || currentStep === 'signup') {
      if (!formData.name.trim()) {
        setError('Nome é obrigatório');
        return false;
      }

      if (!formData.companyName.trim()) {
        setError('Nome da empresa é obrigatório');
        return false;
      }

      if (!formData.companySegment.trim()) {
        setError('Segmento da empresa é obrigatório');
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

      if (!selectedPlan) {
        setError('Selecione um plano');
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

  const handlePlanSelection = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setCurrentStep('signup');
    setIsSignUp(true);
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
      if (isSignUp || currentStep === 'signup') {
        console.log('Attempting sign up with company creation...');
        
        const companyData = {
          name: formData.companyName,
          segment: formData.companySegment,
          plan: selectedPlan!.id
        };
        
        const { error: signUpError } = await signUp(
          formData.email, 
          formData.password, 
          formData.name,
          companyData
        );
        
        if (signUpError) {
          if (signUpError.includes('User already registered')) {
            setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
          } else if (signUpError.includes('Verifique seu email') || signUpError.includes('Plano')) {
            setShowEmailConfirmation(true);
            setSuccess(signUpError);
            setFormData({ ...formData, password: '', confirmPassword: '' });
            setCurrentStep('login');
            setIsSignUp(false);
          } else if (signUpError.includes('Password should be at least')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else if (signUpError.includes('Invalid email')) {
            setError('Email inválido. Verifique o formato do email.');
          } else {
            setError(signUpError);
          }
        } else {
          setSuccess(`Conta e empresa criadas com sucesso! Plano ${selectedPlan?.name} ativado. Você é o administrador da empresa.`);
          
          // Resetar formulário
          setFormData({ 
            email: formData.email, 
            password: '', 
            name: '', 
            confirmPassword: '',
            companyName: '',
            companySegment: ''
          });
          setCurrentStep('login');
          setIsSignUp(false);
          setSelectedPlan(null);
        }
      } else {
        console.log('Attempting sign in...');
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
          } else if (error === 'Email not confirmed') {
            setShowEmailConfirmation(true);
            setError('');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      setSuccess('Se o email existir em nossa base, um novo link de confirmação será enviado.');
      setShowEmailConfirmation(false);
    } catch (error) {
      setError('Erro ao reenviar confirmação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    if (currentStep === 'signup') {
      setCurrentStep('login');
      setIsSignUp(false);
      setSelectedPlan(null);
    } else {
      setCurrentStep('plan');
    }
    clearMessages();
    setFormData({ email: '', password: '', name: '', confirmPassword: '', companyName: '', companySegment: '' });
  };

  const goBackToPlanSelection = () => {
    setCurrentStep('plan');
    setSelectedPlan(null);
    clearMessages();
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

  // Plan Selection Step
  if (currentStep === 'plan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary p-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-accent p-3 rounded-xl">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <span className="text-3xl font-bold text-white">SimpliWa</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Escolha seu plano e comece
              <span className="block text-accent">seu teste grátis de 14 dias</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Todos os planos incluem teste gratuito completo. Sem cartão de crédito, sem compromisso.
              <br />
              <strong>Você será o administrador da sua empresa!</strong>
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 shadow-xl transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                  plan.popular ? 'ring-4 ring-accent' : ''
                }`}
                onClick={() => handlePlanSelection(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-accent text-primary px-6 py-2 rounded-full text-sm font-bold">
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {plan.id === 'starter' && <Building2 className="h-8 w-8 text-primary" />}
                    {plan.id === 'professional' && <Crown className="h-8 w-8 text-primary" />}
                    {plan.id === 'enterprise' && <Shield className="h-8 w-8 text-primary" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center mb-6">
                    <span className="text-sm text-gray-500">R$</span>
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-secondary mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-secondary text-white hover:bg-opacity-90'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Começar Teste Grátis
                </button>
              </div>
            ))}
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <button
              onClick={() => setCurrentStep('login')}
              className="text-white hover:text-accent transition-colors"
            >
              Já tem uma conta? Faça login
            </button>
          </div>
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
            {currentStep === 'signup' ? 'Crie sua empresa' : 'Acesse seu'}
            <span className="block text-accent">
              {currentStep === 'signup' ? 'e seja o Admin' : 'Dashboard'}
            </span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8">
            {currentStep === 'signup' 
              ? `Plano ${selectedPlan?.name} selecionado. Você será o administrador da empresa com acesso total.`
              : 'Gerencie sua empresa com dados em tempo real e relatórios completos.'
            }
          </p>

          {/* Selected Plan Info */}
          {selectedPlan && currentStep === 'signup' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold mb-2">Plano Selecionado: {selectedPlan.name}</h3>
              <p className="text-white/90 text-sm mb-3">{selectedPlan.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-accent">R$ {selectedPlan.price}/mês</span>
                <button
                  onClick={goBackToPlanSelection}
                  className="text-sm text-white/80 hover:text-white underline"
                >
                  Alterar plano
                </button>
              </div>
            </div>
          )}

          {/* Hierarchy Info */}
          {currentStep === 'signup' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-accent" />
                Você será o Admin da Empresa
              </h3>
              <div className="space-y-2 text-sm text-white/90">
                <div>✓ Acesso total à gestão da empresa</div>
                <div>✓ Pode adicionar e gerenciar funcionários</div>
                <div>✓ Controle de permissões da equipe</div>
                <div>✓ Relatórios e análises completas</div>
              </div>
            </div>
          )}

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
              {currentStep === 'signup' ? 'Criar empresa' : 'Faça seu login'}
            </h2>
            <p className="text-gray-600">
              {currentStep === 'signup' 
                ? 'Preencha os dados para criar sua empresa e conta de administrador'
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
            {currentStep === 'signup' && (
              <>
                <div>
                  <label htmlFor="name\" className="block text-sm font-medium text-gray-700 mb-2">
                    Seu nome completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da empresa *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="companySegment" className="block text-sm font-medium text-gray-700 mb-2">
                    Segmento da empresa *
                  </label>
                  <select
                    id="companySegment"
                    name="companySegment"
                    value={formData.companySegment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Selecione o segmento</option>
                    <option value="Moda e Vestuário">Moda e Vestuário</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Beleza e Estética">Beleza e Estética</option>
                    <option value="Construção Civil">Construção Civil</option>
                    <option value="Assistência Técnica">Assistência Técnica</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Varejo">Varejo</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email {currentStep === 'signup' ? 'corporativo' : ''} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors pr-12"
                  placeholder={currentStep === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
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

            {currentStep === 'signup' && (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors pr-12"
                    placeholder="Confirme sua senha"
                    required
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
                  {currentStep === 'signup' ? (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Criar Empresa e Conta
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
              {currentStep === 'signup' 
                ? 'Já tem uma conta? Faça login'
                : 'Não tem uma conta? Escolha seu plano'
              }
            </button>
          </div>

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