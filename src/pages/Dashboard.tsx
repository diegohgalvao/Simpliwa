import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Analytics from '../components/dashboard/Analytics';
import Messages from '../components/dashboard/Messages';
import Customers from '../components/dashboard/Customers';
import Companies from '../components/dashboard/Companies';
import Users from '../components/dashboard/Users';
import Settings from '../components/dashboard/Settings';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div>Carregando...</div>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'analytics':
        return <Analytics />;
      case 'messages':
        return <Messages />;
      case 'customers':
        return <Customers />;
      case 'companies':
        return <Companies />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;