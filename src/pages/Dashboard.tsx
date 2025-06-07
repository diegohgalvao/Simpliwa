import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Analytics from '../components/dashboard/Analytics';
import Messages from '../components/dashboard/Messages';
import Customers from '../components/dashboard/Customers';
import Companies from '../components/dashboard/Companies';
import Users from '../components/dashboard/Users';
import Settings from '../components/dashboard/Settings';
import Sales from '../components/dashboard/Sales';
import Products from '../components/dashboard/Products';
import Team from '../components/dashboard/Team';
import Notifications from '../components/dashboard/Notifications';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user } = useAuth();
  
  // Cache para componentes já renderizados
  const renderedComponents = useRef<{ [key: string]: React.ReactElement }>({});
  const mountedSections = useRef<Set<string>>(new Set(['overview'])); // Overview sempre montado

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Função para criar componentes sob demanda
  const createComponent = useCallback((section: string): React.ReactElement => {
    switch (section) {
      case 'overview':
        return <Overview key="overview" />;
      case 'sales':
        return <Sales key="sales" />;
      case 'products':
        return <Products key="products" />;
      case 'customers':
        return <Customers key="customers" />;
      case 'messages':
        return <Messages key="messages" />;
      case 'team':
        return <Team key="team" />;
      case 'analytics':
        return <Analytics key="analytics" />;
      case 'notifications':
        return <Notifications key="notifications" />;
      case 'companies':
        return <Companies key="companies" />;
      case 'users':
        return <Users key="users" />;
      case 'settings':
        return <Settings key="settings" />;
      default:
        return <Overview key="overview" />;
    }
  }, []);

  // Função para obter ou criar componente
  const getComponent = useCallback((section: string): React.ReactElement => {
    // Se já foi renderizado, retorna do cache
    if (renderedComponents.current[section]) {
      return renderedComponents.current[section];
    }

    // Cria novo componente e adiciona ao cache
    const component = createComponent(section);
    renderedComponents.current[section] = component;
    mountedSections.current.add(section);
    
    return component;
  }, [createComponent]);

  // Handler para mudança de seção
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    
    // Garante que o componente será criado se não existir
    if (!mountedSections.current.has(section)) {
      getComponent(section);
    }
  }, [getComponent]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Renderizar apenas seções que já foram visitadas */}
        {Array.from(mountedSections.current).map((section) => {
          const isActive = activeSection === section;
          
          return (
            <div
              key={section}
              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                isActive 
                  ? 'opacity-100 visible z-10' 
                  : 'opacity-0 invisible z-0'
              }`}
              style={{
                // Garantir que componentes invisíveis não interfiram
                pointerEvents: isActive ? 'auto' : 'none',
                // Usar transform para melhor performance
                transform: isActive ? 'translateX(0)' : 'translateX(-10px)'
              }}
            >
              <div className="h-full overflow-auto">
                {getComponent(section)}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default Dashboard;