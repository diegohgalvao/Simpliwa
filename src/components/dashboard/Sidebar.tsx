import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings, 
  Building2,
  UserCog,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'customers', label: 'Clientes', icon: Users },
    ...(currentUser?.role === 'super_admin' ? [
      { id: 'companies', label: 'Empresas', icon: Building2 },
      { id: 'users', label: 'Usuários', icon: UserCog }
    ] : []),
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="bg-white h-screen w-64 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">SimpliWa</span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={currentUser?.avatar} 
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentUser?.role === 'super_admin' ? 'Super Admin' : 
               currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;