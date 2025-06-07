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
  MessageCircle,
  ShoppingCart,
  Package,
  UserCheck,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, signOut, switchCompany } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'team', label: 'Equipe', icon: UserCheck },
    { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    ...(user?.profile?.role === 'super_admin' ? [
      { id: 'companies', label: 'Empresas', icon: Building2 },
      { id: 'users', label: 'Usuários', icon: UserCog }
    ] : []),
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const handleCompanySwitch = (companyId: string) => {
    switchCompany(companyId);
  };

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
            src={user?.profile?.avatar_url || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop`}
            alt={user?.profile?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.profile?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.profile?.role === 'super_admin' ? 'Super Admin' : 
               user?.profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>

        {/* Company Selector */}
        {user?.profile?.role !== 'super_admin' && user?.companies && user.companies.length > 1 && (
          <div className="mt-3">
            <select
              value={user.currentCompany?.id || ''}
              onChange={(e) => handleCompanySwitch(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1"
            >
              {user.companies.map((cm) => (
                <option key={cm.company_id} value={cm.company_id}>
                  {cm.companies?.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Company Display */}
        {user?.currentCompany && (
          <div className="mt-2 text-xs text-gray-500">
            {user.currentCompany.name}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
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
          onClick={signOut}
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