import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${
              isScrolled ? 'text-primary' : 'text-white'
            }`}>
              SimpliWa
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['funcionalidades', 'sobre', 'depoimentos', 'precos'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize font-medium transition-colors hover:text-secondary ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item === 'precos' ? 'Preços' : item}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('teste-gratuito')}
              className="bg-secondary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
            >
              Teste Grátis
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? 'text-primary' : 'text-white'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? 'text-primary' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <nav className="flex flex-col py-4">
              {['funcionalidades', 'sobre', 'depoimentos', 'precos'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="px-4 py-3 text-left text-gray-700 capitalize font-medium hover:bg-accent transition-colors"
                >
                  {item === 'precos' ? 'Preços' : item}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('teste-gratuito')}
                className="mx-4 mt-2 bg-secondary text-white px-6 py-3 rounded-full font-semibold text-center"
              >
                Teste Grátis
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;