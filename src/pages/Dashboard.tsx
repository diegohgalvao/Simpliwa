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
import Sales from '../components/dashboard/Sales';
import Products from '../components/dashboard/Products';
import Team from '../components/dashboard/Team';
import Notifications from '../components/dashboard/Notifications';

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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'sales':
        return <Sales />;
      case 'products':
        return <Products />;
      case 'customers':
        return <Customers />;
      case 'messages':
        return <Messages />;
      case 'team':
        return <Team />;
      case 'analytics':
        return <Analytics />;
      case 'notifications':
        return <Notifications />;
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