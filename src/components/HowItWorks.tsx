import React from 'react';
import { Download, MessageCircle, BarChart, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Download,
      number: '01',
      title: 'Cadastre-se Grátis',
      description: 'Crie sua conta em menos de 2 minutos. Sem cartão de crédito, sem complicação.'
    },
    {
      icon: MessageCircle,
      number: '02', 
      title: 'Conecte seu WhatsApp',
      description: 'Integração simples e segura. Mantenha seu número atual e privacidade.'
    },
    {
      icon: BarChart,
      number: '03',
      title: 'Comece a Gerenciar',
      description: 'Receba relatórios, gerencie vendas e acompanhe tudo pelo WhatsApp.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-accent/30 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
            Como funciona o
            <span className="block text-secondary">SimpliWa?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Em 3 passos simples, você transforma a gestão da sua empresa
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 -right-4 w-8 h-0.5 bg-secondary/30 z-10">
                  <ArrowRight className="absolute -right-2 -top-2 h-5 w-5 text-secondary/50" />
                </div>
              )}
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center relative z-20">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                
                {/* Icon */}
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Demo Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Veja o SimpliWa em ação
            </h3>
            <p className="text-gray-600 mb-8">
              Assista como é fácil gerenciar sua empresa pelo WhatsApp
            </p>
            
            {/* Video Placeholder */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <button className="relative bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors group">
                <div className="w-0 h-0 border-l-[24px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-90">Demo: 2 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;