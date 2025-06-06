import React, { useState } from 'react';
import { Check, Zap, Crown, Star } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: { monthly: 97, annual: 970 },
      description: 'Perfeito para pequenos negócios começando a se organizar',
      features: [
        'Até 1.000 mensagens/mês',
        'Dashboard básico',
        'Relatórios essenciais',
        'Suporte por email',
        '1 usuário',
        'Backup automático'
      ],
      popular: false,
      cta: 'Começar Teste Grátis'
    },
    {
      name: 'Professional', 
      icon: Crown,
      price: { monthly: 197, annual: 1970 },
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
      popular: true,
      cta: 'Mais Popular'
    },
    {
      name: 'Enterprise',
      icon: Star,
      price: { monthly: 397, annual: 3970 },
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
      ],
      popular: false,
      cta: 'Falar com Vendas'
    }
  ];

  return (
    <section id="precos" className="py-20 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_60%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-accent text-sm font-medium">
              💰 Preços Transparentes
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Planos que crescem
            <span className="block text-accent">com seu negócio</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Escolha o plano ideal para sua empresa. Todos incluem teste gratuito de 14 dias, 
            sem compromisso e sem cartão de crédito.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full p-2 max-w-xs mx-auto">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-white/60'}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAnnual ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-white/60'}`}>
              Anual
            </span>
            {isAnnual && (
              <span className="bg-accent text-primary text-xs px-2 py-1 rounded-full font-bold">
                -20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 shadow-xl transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-4 ring-accent' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent text-primary px-6 py-2 rounded-full text-sm font-bold">
                    Mais Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-sm text-gray-500">R$</span>
                  <span className="text-5xl font-bold text-gray-900">
                    {isAnnual 
                      ? Math.floor(plan.price.annual / 12) 
                      : plan.price.monthly
                    }
                  </span>
                  <span className="text-gray-500">/mês</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-gray-500 mt-2">
                    Cobrança anual de R$ {plan.price.annual}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button 
                onClick={() => document.getElementById('teste-gratuito')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-secondary text-white hover:bg-opacity-90'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Guarantees */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-white">
              <div className="flex flex-col items-center">
                <div className="bg-accent p-3 rounded-full mb-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">14 Dias Grátis</h4>
                <p className="text-white/80 text-sm">Teste completo sem cartão</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-accent p-3 rounded-full mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Suporte Incluído</h4>
                <p className="text-white/80 text-sm">Ajuda sempre que precisar</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-accent p-3 rounded-full mb-4">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Cancele Quando Quiser</h4>
                <p className="text-white/80 text-sm">Sem multas ou burocracias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;