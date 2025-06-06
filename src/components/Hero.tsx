import React from 'react';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="relative container mx-auto px-4 lg:px-8 pt-20 lg:pt-32">
        <div className="flex flex-col lg:flex-row items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <div className="animate-fade-up">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-white text-sm font-medium">
                  🚀 Revolucione sua gestão empresarial
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Gerencie seu negócio
                <span className="block text-accent">
                  direto no WhatsApp
                </span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-lg">
                Transforme seu WhatsApp no centro de comando da sua empresa. 
                Gestão simples, resultados extraordinários.
              </p>

              {/* Benefits List */}
              <div className="flex flex-col space-y-3 mb-8">
                {[
                  'Controle total via WhatsApp',
                  'Dashboard web completo',
                  'Sem complicações técnicas'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-white/90">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection('teste-gratuito')}
                  className="bg-accent text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105 flex items-center justify-center group"
                >
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary transition-all flex items-center justify-center group">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="lg:w-1/2 relative">
            <div className="animate-fade-in">
              <div className="relative">
                {/* Phone Mockup */}
                <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gray-900 rounded-[2rem] h-[600px] p-8 flex flex-col">
                    {/* WhatsApp Header */}
                    <div className="bg-secondary rounded-t-2xl p-4 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">SW</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">SimpliWa Bot</h3>
                          <p className="text-sm opacity-90">online</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="flex-1 bg-accent/5 p-4 space-y-4">
                      <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">Olá! Como posso ajudar com sua empresa hoje?</p>
                      </div>
                      <div className="bg-secondary rounded-2xl rounded-br-md p-3 max-w-[80%] ml-auto text-white">
                        <p className="text-sm">Quero ver minhas vendas do mês</p>
                      </div>
                      <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">📊 Vendas de Janeiro</p>
                        <p className="text-sm text-gray-800 font-semibold">Total: R$ 45.680</p>
                        <p className="text-sm text-gray-500">↗️ +23% vs mês anterior</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 bg-white rounded-2xl p-4 shadow-lg animate-bounce-gentle">
                  <div className="text-2xl mb-2">📈</div>
                  <p className="text-sm font-semibold text-gray-800">+45% Vendas</p>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-sm font-semibold text-gray-800">Tempo Real</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;