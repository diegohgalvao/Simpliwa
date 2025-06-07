import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Bell,
  Crown,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, signOut, switchCompany } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Different menu items based on role
  const getMenuItems = () => {
    if (user?.profile?.role === 'super_admin') {
      return [
        { id: 'empresas', label: 'Análise de Empresas', icon: Building2, path: '/dashboard/empresas' },
        { id: 'usuarios', label: 'Usuários do Sistema', icon: UserCog, path: '/dashboard/usuarios' },
        { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/dashboard/configuracoes' }
      ];
    } else {
      return [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard/overview' },
        { id: 'vendas', label: 'Vendas', icon: ShoppingCart, path: '/dashboard/vendas' },
        { id: 'produtos', label: 'Produtos', icon: Package, path: '/dashboard/produtos' },
        { id: 'clientes', label: 'Clientes', icon: Users, path: '/dashboard/clientes' },
        { id: 'mensagens', label: 'Mensagens', icon: MessageSquare, path: '/dashboard/mensagens' },
        { id: 'equipe', label: 'Equipe', icon: UserCheck, path: '/dashboard/equipe' },
        { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/dashboard/relatorios' },
        { id: 'notificacoes', label: 'Notificações', icon: Bell, path: '/dashboard/notificacoes' },
        { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/dashboard/configuracoes' }
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleCompanySwitch = (companyId: string) => {
    switchCompany(companyId);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
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
            <div className="flex items-center space-x-1">
              <p className="text-xs text-gray-500 capitalize">
                {user?.profile?.role === 'super_admin' ? 'Super Admin' : 
                 user?.profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
              {user?.profile?.role === 'super_admin' && (
                <Crown className="h-3 w-3 text-yellow-600" />
              )}
            </div>
          </div>
        </div>

        {/* Company Selector - Only for non-super-admin users */}
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

        {/* Current Company Display - Only for non-super-admin */}
        {user?.profile?.role !== 'super_admin' && user?.currentCompany && (
          <div className="mt-2 text-xs text-gray-500">
            {user.currentCompany.name}
          </div>
        )}

        {/* Super Admin Badge */}
        {user?.profile?.role === 'super_admin' && (
          <div className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full text-center font-medium">
            🔐 Acesso Total ao Sistema
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive(item.path)
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

        {/* Super Admin Info Panel */}
        {user?.profile?.role === 'super_admin' && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-xs font-medium text-yellow-800">Modo Super Admin</span>
            </div>
            <p className="text-xs text-yellow-700">
              Você tem acesso completo a todas as empresas e dados do sistema SimpliWa.
            </p>
          </div>
        )}
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