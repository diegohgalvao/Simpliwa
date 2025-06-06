import React, { useState } from 'react';
import { ArrowRight, Shield, Clock, Gift } from 'lucide-react';

const FreeTrial = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Obrigado! Entraremos em contato em breve para configurar seu teste gratuito.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="teste-gratuito" className="py-20 bg-gradient-to-br from-secondary to-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-white">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Gift className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Teste Gratuito - 14 Dias</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Experimente o SimpliWa
              <span className="block text-accent">sem compromisso</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Configure sua conta em menos de 5 minutos e comece a gerenciar sua empresa 
              pelo WhatsApp hoje mesmo. Sem cartão de crédito, sem taxas ocultas.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Shield, text: 'Sem cartão de crédito necessário' },
                { icon: Clock, text: '14 dias de acesso completo' },
                { icon: Gift, text: 'Suporte gratuito durante o teste' }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-accent p-2 rounded-lg mr-4">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-white/90">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-between text-center">
                <div>
                  <div className="text-2xl font-bold text-accent">500+</div>
                  <div className="text-sm text-white/80">Empresas testaram</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">87%</div>
                  <div className="text-sm text-white/80">Viraram clientes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">4.9★</div>
                  <div className="text-sm text-white/80">Avaliação média</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Comece seu teste gratuito
              </h3>
              <p className="text-gray-600">
                Preencha os dados abaixo e receba suas credenciais por WhatsApp
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email corporativo *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da empresa *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder="Nome da sua empresa"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 flex items-center justify-center group"
              >
                Começar Teste Gratuito
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-sm text-gray-500">
                Ao se cadastrar, você concorda com nossos{' '}
                <a href="#" className="text-secondary hover:underline">Termos de Uso</a>
                {' '}e{' '}
                <a href="#" className="text-secondary hover:underline">Política de Privacidade</a>
              </p>
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Setup em 5min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeTrial;