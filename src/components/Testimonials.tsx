import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Proprietária da Boutique Elegance',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'O SimpliWa mudou completamente como gerencio minha loja. Agora acompanho vendas, estoque e clientes direto do WhatsApp. Meu faturamento aumentou 40% em 3 meses!',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Diretor da Santos Construções',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Impressionante como algo tão simples pode ser tão poderoso. Consigo gerenciar 5 obras simultaneamente sem perder o controle de nada. Recomendo muito!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'CEO da Beauty Center',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Finalmente uma solução que não precisa de treinamento! Minha equipe adotou na primeira semana. Os relatórios me ajudam a tomar decisões mais rápidas e assertivas.',
      rating: 5
    },
    {
      name: 'Carlos Mendes',
      role: 'Fundador da TechFix',
      image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Como prestador de serviços, preciso de agilidade. O SimpliWa me permite acompanhar chamados, faturamento e equipe em tempo real. Produtividade nas alturas!',
      rating: 5
    },
    {
      name: 'Lucia Ferreira',
      role: 'Dona da Padaria Delícia',
      image: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Mesmo sem conhecimento técnico, consegui usar desde o primeiro dia. Agora sei exatamente quais produtos vendem mais e quando repor o estoque. Fantástico!',
      rating: 5
    },
    {
      name: 'Roberto Lima',
      role: 'Proprietário da Auto Center Lima',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'A automação de relatórios me economiza 3 horas por dia! Consigo focar no atendimento enquanto o SimpliWa cuida da parte administrativa. Revolucionário!',
      rating: 5
    }
  ];

  return (
    <section id="depoimentos" className="py-20 bg-gradient-to-br from-accent/20 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-secondary/10 rounded-full px-4 py-2 mb-6">
            <span className="text-secondary text-sm font-medium">
              💬 Depoimentos Reais
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
            O que nossos clientes
            <span className="block text-secondary">estão dizendo</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empresários reais, resultados reais. Veja como o SimpliWa está 
            transformando negócios em todo o Brasil.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6">
                <div className="bg-secondary p-3 rounded-full">
                  <Quote className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Stars */}
              <div className="flex items-center mb-4 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">4.9/5</div>
              <div className="text-gray-600">Avaliação Média</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">500+</div>
              <div className="text-gray-600">Empresas Ativas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">98%</div>
              <div className="text-gray-600">Taxa de Satisfação</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-gray-600">Suporte</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;