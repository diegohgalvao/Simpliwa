import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de autenticação
    setTimeout(() => {
      const success = login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email ou senha incorretos');
      }
      setIsLoading(false);
    }, 1000);
  };

  const demoAccounts = [
    { email: 'admin@simpliwa.com.br', password: 'admin123', role: 'Super Admin' },
    { email: 'maria@boutiqueelegance.com.br', password: 'maria123', role: 'Admin - Boutique Elegance' },
    { email: 'joao@santosconstrucoes.com.br', password: 'joao123', role: 'Admin - Santos Construções' },
    { email: 'ana@beautycenter.com.br', password: 'ana123', role: 'Admin - Beauty Center' }
  ];

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

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
            Acesse seu
            <span className="block text-accent">Dashboard</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8">
            Gerencie sua empresa com dados em tempo real e relatórios completos.
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

        {/* Right Column - Login Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Faça seu login
            </h2>
            <p className="text-gray-600">
              Entre com suas credenciais para acessar o dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors pr-12"
                  placeholder="Sua senha"
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Contas de Demonstração:</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(account.email, account.password)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{account.role}</div>
                  <div className="text-xs text-gray-500">{account.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-secondary hover:underline text-sm"
            >
              ← Voltar para o site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;