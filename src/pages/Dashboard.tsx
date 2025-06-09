import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import BusinessIntelligence from '../components/dashboard/BusinessIntelligence';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Routes>
          {/* Default route based on user role */}
          <Route 
            index 
            element={
              <Navigate 
                to={user?.profile?.role === 'super_admin' ? 'business-intelligence' : 'overview'} 
                replace 
              />
            } 
          />
          
          {/* Super Admin Routes */}
          {user?.profile?.role === 'super_admin' ? (
            <>
              <Route path="business-intelligence\" element={<BusinessIntelligence />} />
              <Route path="empresas" element={<Companies />} />
              <Route path="usuarios" element={<Users />} />
              <Route path="configuracoes" element={<Settings />} />
              {/* Redirect any other routes to business-intelligence for super admin */}
              <Route path="*" element={<Navigate to="business-intelligence\" replace />} />
            </>
          ) : (
            <>
              {/* Regular User Routes */}
              <Route path="overview" element={<Overview />} />
              <Route path="vendas" element={<Sales />} />
              <Route path="produtos" element={<Products />} />
              <Route path="clientes" element={<Customers />} />
              <Route path="mensagens" element={<Messages />} />
              <Route path="equipe" element={<Team />} />
              <Route path="relatorios" element={<Analytics />} />
              <Route path="notificacoes" element={<Notifications />} />
              <Route path="configuracoes" element={<Settings />} />
              {/* Redirect any other routes to overview for regular users */}
              <Route path="*" element={<Navigate to="overview\" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;