import React, { useState, useCallback, useMemo } from 'react';
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

// Cache para manter os componentes montados
const componentCache = new Map();

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Função para criar componente com cache
  const createCachedComponent = useCallback((section: string, Component: React.ComponentType) => {
    if (!componentCache.has(section)) {
      componentCache.set(section, <Component key={section} />);
    }
    return componentCache.get(section);
  }, []);

  // Memoizar todos os componentes para evitar re-renderização
  const components = useMemo(() => ({
    overview: createCachedComponent('overview', Overview),
    sales: createCachedComponent('sales', Sales),
    products: createCachedComponent('products', Products),
    customers: createCachedComponent('customers', Customers),
    messages: createCachedComponent('messages', Messages),
    team: createCachedComponent('team', Team),
    analytics: createCachedComponent('analytics', Analytics),
    notifications: createCachedComponent('notifications', Notifications),
    companies: createCachedComponent('companies', Companies),
    users: createCachedComponent('users', Users),
    settings: createCachedComponent('settings', Settings)
  }), [createCachedComponent]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto relative">
        {/* Renderizar todos os componentes, mas mostrar apenas o ativo */}
        {Object.entries(components).map(([section, component]) => (
          <div
            key={section}
            className={`${
              activeSection === section ? 'block' : 'hidden'
            } h-full`}
          >
            {component}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Dashboard;