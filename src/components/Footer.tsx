import React from 'react';
import { MessageCircle, Mail, Phone, MapPin, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Preços', href: '#precos' },
    { label: 'Teste Grátis', href: '#teste-gratuito' }
  ];

  const resources = [
    { label: 'Central de Ajuda', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Webinars', href: '#' },
    { label: 'Case Studies', href: '#' },
    { label: 'API Docs', href: '#' }
  ];

  const legal = [
    { label: 'Termos de Uso', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
    { label: 'LGPD', href: '#' },
    { label: 'Cookies', href: '#' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-accent p-2 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">SimpliWa</span>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              Transformando a gestão empresarial através do WhatsApp. 
              Simplicidade, eficiência e resultados reais para PMEs brasileiras.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-white/80">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>contato@simpliwa.com.br</span>
              </div>
              <div className="flex items-center text-white/80">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Links Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/80 hover:text-accent transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-6">Recursos</h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a 
                    href={resource.href}
                    className="text-white/80 hover:text-accent transition-colors"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-lg font-bold mb-6">Legal</h3>
            <ul className="space-y-3 mb-8">
              {legal.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className="text-white/80 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Siga-nos</h4>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-white/10 p-3 rounded-full hover:bg-accent hover:text-primary transition-all"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-white/10 p-3 rounded-full hover:bg-accent hover:text-primary transition-all"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-white/10 p-3 rounded-full hover:bg-accent hover:text-primary transition-all"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="text-xl font-bold mb-2">Fique por dentro das novidades</h3>
              <p className="text-white/80">Receba dicas de gestão e atualizações do SimpliWa</p>
            </div>
            
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="px-4 py-3 rounded-l-lg border-0 flex-1 lg:w-80 text-gray-900 focus:ring-2 focus:ring-accent outline-none"
              />
              <button className="bg-accent text-primary px-6 py-3 rounded-r-lg font-semibold hover:bg-white transition-colors">
                Inscrever
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between text-white/60 text-sm">
            <p>© 2024 SimpliWa. Todos os direitos reservados.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span>Feito com ❤️ para empresários brasileiros</span>
              <div className="flex items-center space-x-2">
                <span>Powered by</span>
                <div className="bg-white/10 px-2 py-1 rounded text-xs">
                  WhatsApp Business API
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;