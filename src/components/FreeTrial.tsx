import React, { useState } from 'react';
import { ArrowRight, Shield, Clock, Gift, Crown, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreeTrial = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: 97,
      description: 'Perfeito para pequenos negócios',
      icon: Building2,
      features: ['Até 1.000 mensagens/mês', 'Dashboard básico', '1 usuário']
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      price: 197,
      description: 'Ideal para empresas em crescimento',
      icon: Crown,
      features: ['Mensagens ilimitadas', 'Dashboard completo', 'Até 5 usuários'],
      popular: true
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: 397,
      description: 'Para empresas estabelecidas',
      icon: Shield,
      features: ['Tudo do Professional', 'Usuários ilimitados', 'Suporte 24/7']
    }
  ];

  const handleStartTrial = () => {
    // Navegar para login com parâmetro do plano selecionado
    navigate(`/login?plan=${selectedPlan}`);
  };

  return (
    <section id="teste-gratuito" className="py-20 bg-gradient-to-br from-secondary to-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Gift className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Teste Gratuito - 14 Dias</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Escolha seu plano e comece
            <span className="block text-accent">seu teste gratuito</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            Todos os planos incluem 14 dias de teste completo. Sem cartão de crédito, 
            sem compromisso. Você será o administrador da sua empresa.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                  selectedPlan === plan.id ? 'ring-4 ring-accent shadow-2xl' : 'shadow-lg'
                } ${plan.popular ? 'border-2 border-accent' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-accent text-primary px-4 py-1 rounded-full text-sm font-bold">
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-sm text-gray-500">R$</span>
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">/mês</span>
                  </div>

                  <ul className="text-left space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                    selectedPlan === plan.id 
                      ? 'bg-secondary border-secondary' 
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto mb-8">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Plano {plans.find(p => p.id === selectedPlan)?.name} Selecionado
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center justify-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">14 dias grátis</span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm">Sem cartão</span>
              </div>
              <div className="flex items-center justify-center">
                <Crown className="h-5 w-5 mr-2" />
                <span className="text-sm">Você será o Admin</span>
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Após o cadastro, você será o administrador da sua empresa com acesso total 
              para gerenciar equipe, vendas, clientes e relatórios.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={handleStartTrial}
            className="bg-accent text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105 inline-flex items-center group"
          >
            Começar Teste Gratuito
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-white/80 text-sm mt-4">
            Sem compromisso • Cancele quando quiser • Suporte incluído
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          {[
            { icon: Shield, text: 'Sem cartão de crédito necessário' },
            { icon: Clock, text: '14 dias de acesso completo' },
            { icon: Crown, text: 'Você será o admin da empresa' }
          ].map((benefit, index) => (
            <div key={index} className="text-center text-white">
              <div className="bg-accent p-3 rounded-full w-fit mx-auto mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-white/90">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeTrial;