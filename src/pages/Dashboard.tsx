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
  
  // Refs para manter os componentes montados
  const componentRefs = useRef<{ [key: string]: React.ReactElement }>({});
  const initializedSections = useRef<Set<string>>(new Set());

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Função para criar e cachear componentes
  const getComponent = useCallback((section: string) => {
    // Se o componente já foi criado, retorna ele
    if (componentRefs.current[section]) {
      return componentRefs.current[section];
    }

    // Cria o componente apenas uma vez
    let component: React.ReactElement;
    
    switch (section) {
      case 'overview':
        component = <Overview key="overview" />;
        break;
      case 'sales':
        component = <Sales key="sales" />;
        break;
      case 'products':
        component = <Products key="products" />;
        break;
      case 'customers':
        component = <Customers key="customers" />;
        break;
      case 'messages':
        component = <Messages key="messages" />;
        break;
      case 'team':
        component = <Team key="team" />;
        break;
      case 'analytics':
        component = <Analytics key="analytics" />;
        break;
      case 'notifications':
        component = <Notifications key="notifications" />;
        break;
      case 'companies':
        component = <Companies key="companies" />;
        break;
      case 'users':
        component = <Users key="users" />;
        break;
      case 'settings':
        component = <Settings key="settings" />;
        break;
      default:
        component = <Overview key="overview" />;
    }

    // Armazena o componente no cache
    componentRefs.current[section] = component;
    initializedSections.current.add(section);
    
    return component;
  }, []);

  // Lista de todas as seções possíveis
  const allSections = [
    'overview', 'sales', 'products', 'customers', 'messages', 
    'team', 'analytics', 'notifications', 'companies', 'users', 'settings'
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-hidden relative">
        {/* Container para todos os componentes */}
        <div className="h-full">
          {allSections.map((section) => {
            // Só renderiza seções que já foram visitadas ou a seção ativa
            const shouldRender = initializedSections.current.has(section) || section === activeSection;
            
            if (!shouldRender) {
              return null;
            }

            return (
              <div
                key={section}
                className={`absolute inset-0 transition-opacity duration-200 ${
                  activeSection === section 
                    ? 'opacity-100 z-10 overflow-auto' 
                    : 'opacity-0 z-0 overflow-hidden pointer-events-none'
                }`}
              >
                {getComponent(section)}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;