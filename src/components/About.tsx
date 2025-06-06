import React from 'react';
import { Target, Heart, Lightbulb, Rocket } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Foco na Simplicidade',
      description: 'Acreditamos que tecnologia deve simplificar, não complicar sua vida empresarial.'
    },
    {
      icon: Heart,
      title: 'Paixão por PMEs',
      description: 'Desenvolvido especialmente para pequenas e médias empresas que querem crescer.'
    },
    {
      icon: Lightbulb,
      title: 'Inovação Constante',
      description: 'Sempre buscando novas formas de otimizar a gestão empresarial via WhatsApp.'
    },
    {
      icon: Rocket,
      title: 'Resultados Reais',
      description: 'Nosso sucesso é medido pelo crescimento e eficiência dos nossos clientes.'
    }
  ];

  return (
    <section id="sobre" className="py-20 bg-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-accent text-sm font-medium">
                🌟 Nossa Missão
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Sobre a
              <span className="block text-accent">SimpliWa</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Nascemos da necessidade real de empresários que queriam uma forma simples 
              e eficiente de gerenciar seus negócios sem abandonar o WhatsApp - a ferramenta 
              que já usam todos os dias.
            </p>
            
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Desenvolvido por uma equipe que entende as dores das PMEs brasileiras, 
              o SimpliWa combina a praticidade do WhatsApp com a robustez de um 
              sistema de gestão completo.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">500+</div>
                <div className="text-sm text-white/80">Empresas Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">98%</div>
                <div className="text-sm text-white/80">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">2M+</div>
                <div className="text-sm text-white/80">Mensagens/mês</div>
              </div>
            </div>
          </div>

          {/* Right Column - Values */}
          <div className="space-y-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-accent p-3 rounded-xl flex-shrink-0">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para transformar sua gestão?
            </h3>
            <p className="text-white/80 mb-6">
              Junte-se a centenas de empresários que já simplificaram sua rotina
            </p>
            <button 
              onClick={() => document.getElementById('teste-gratuito')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-accent text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;