import React from 'react';
import { MessageSquare, BarChart3, Smartphone, Zap, Shield, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Integrado',
      description: 'Gerencie tudo direto do seu WhatsApp, sem apps complicados ou treinamentos longos.'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Inteligentes',
      description: 'Dados em tempo real sobre vendas, clientes e performance da sua empresa.'
    },
    {
      icon: Smartphone,
      title: 'Dashboard Completo',
      description: 'Acesse relatórios detalhados e análises avançadas quando precisar de mais.'
    },
    {
      icon: Zap,
      title: 'Automação Inteligente',
      description: 'Automatize tarefas repetitivas e foque no que realmente importa.'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta e backup automático.'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Controle acessos e monitore a performance da sua equipe facilmente.'
    }
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-accent rounded-full px-4 py-2 mb-6">
            <span className="text-primary text-sm font-medium">
              ✨ Funcionalidades Poderosas
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
            Tudo que sua empresa precisa
            <span className="block text-secondary">em um só lugar</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desenvolvido especialmente para pequenas e médias empresas que querem crescer 
            sem complicações tecnológicas.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/10 transition-colors">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button 
            onClick={() => document.getElementById('teste-gratuito')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 inline-flex items-center"
          >
            Experimentar Todas as Funcionalidades
            <Zap className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;