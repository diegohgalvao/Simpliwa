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
  Target,
  Shield,
  Eye
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
      // Menu baseado no role do usuário
      const baseItems = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard/overview' }
      ];

      // Verificar permissões do usuário atual
      const userRole = user?.companies?.find(cm => cm.company_id === user.currentCompany?.id)?.role || 'user';
      
      // Adicionar itens baseados no role
      if (['admin', 'manager', 'operator'].includes(userRole)) {
        baseItems.push(
          { id: 'vendas', label: 'Vendas', icon: ShoppingCart, path: '/dashboard/vendas' },
          { id: 'clientes', label: 'Clientes', icon: Users, path: '/dashboard/clientes' },
          { id: 'mensagens', label: 'Mensagens', icon: MessageSquare, path: '/dashboard/mensagens' }
        );
      }

      if (['admin', 'manager'].includes(userRole)) {
        baseItems.push(
          { id: 'produtos', label: 'Produtos', icon: Package, path: '/dashboard/produtos' },
          { id: 'equipe', label: 'Equipe', icon: UserCheck, path: '/dashboard/equipe' },
          { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/dashboard/relatorios' }
        );
      }

      if (userRole === 'admin') {
        baseItems.push(
          { id: 'notificacoes', label: 'Notificações', icon: Bell, path: '/dashboard/notificacoes' }
        );
      }

      // Todos podem acessar configurações
      baseItems.push(
        { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/dashboard/configuracoes' }
      );

      return baseItems;
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-red-600" />;
      case 'manager':
        return <Users className="h-3 w-3 text-blue-600" />;
      case 'operator':
        return <UserCheck className="h-3 w-3 text-green-600" />;
      case 'viewer':
        return <Eye className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin da Empresa';
      case 'manager':
        return 'Gerente';
      case 'operator':
        return 'Operacional';
      case 'viewer':
        return 'Consulta';
      default:
        return 'Usuário';
    }
  };

  const currentUserRole = user?.profile?.role === 'super_admin' 
    ? 'super_admin' 
    : user?.companies?.find(cm => cm.company_id === user.currentCompany?.id)?.role || 'user';

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
              {getRoleIcon(currentUserRole)}
              <p className="text-xs text-gray-500">
                {getRoleLabel(currentUserRole)}
              </p>
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

        {/* Role-based Access Info */}
        {user?.profile?.role !== 'super_admin' && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600">
              <strong>Nível de Acesso:</strong>
            </div>
            <div className="text-xs text-gray-700 mt-1">
              {currentUserRole === 'admin' && '• Gestão completa da empresa'}
              {currentUserRole === 'manager' && '• Gestão de setor'}
              {currentUserRole === 'operator' && '• Operações do dia a dia'}
              {currentUserRole === 'viewer' && '• Apenas visualização'}
              {currentUserRole === 'user' && '• Acesso básico'}
            </div>
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

        {/* Role Permissions Info */}
        {user?.profile?.role !== 'super_admin' && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-xs font-medium text-blue-800">Suas Permissões</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              {currentUserRole === 'admin' && (
                <>
                  <div>✓ Gestão completa da empresa</div>
                  <div>✓ Gerenciar equipe</div>
                  <div>✓ Relatórios avançados</div>
                </>
              )}
              {currentUserRole === 'manager' && (
                <>
                  <div>✓ Gestão de produtos</div>
                  <div>✓ Relatórios do setor</div>
                  <div>✓ Supervisão de equipe</div>
                </>
              )}
              {currentUserRole === 'operator' && (
                <>
                  <div>✓ Registrar vendas</div>
                  <div>✓ Atender clientes</div>
                  <div>✓ Consultar produtos</div>
                </>
              )}
              {currentUserRole === 'viewer' && (
                <>
                  <div>✓ Visualizar relatórios</div>
                  <div>✓ Consultar dados</div>
                  <div>✗ Sem edição</div>
                </>
              )}
            </div>
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