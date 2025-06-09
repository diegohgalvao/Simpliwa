import React, { useState, useEffect } from 'react';
import { User, Shield, Building2, Calendar, Eye, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  companies?: string[];
  last_login?: string;
  status: 'active' | 'inactive';
}

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    superAdmins: 0,
    admins: 0,
    activeUsers: 0
  });

  // Verificar se usuário tem acesso
  if (user?.profile?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Apenas super administradores podem acessar o gerenciamento de usuários do sistema.
          </p>
          <div className="mt-4 p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Seu nível de acesso:</strong> {user?.profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
            <p className="text-sm text-red-700 mt-1">
              Para gerenciar usuários da sua empresa, acesse a seção "Equipe".
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar apenas os perfis - removemos a chamada para auth.admin.listUsers()
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          role,
          avatar_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Criar dados dos usuários apenas com informações do perfil
      const combinedUsers: SystemUser[] = (profilesData || []).map(profile => {
        return {
          id: profile.id,
          name: profile.name,
          email: 'Email protegido', // Não podemos acessar emails via admin API no frontend
          role: profile.role,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_login: undefined, // Não disponível sem admin API
          status: 'active' // Por enquanto, todos ativos
        };
      });

      setUsers(combinedUsers);

      // Calcular estatísticas
      setStats({
        totalUsers: combinedUsers.length,
        superAdmins: combinedUsers.filter(u => u.role === 'super_admin').length,
        admins: combinedUsers.filter(u => u.role === 'admin').length,
        activeUsers: combinedUsers.filter(u => u.status === 'active').length
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários do sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    // Implementar visualização detalhada do usuário
    console.log('Ver usuário:', userId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários do sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchUsers}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Crown className="h-6 w-6 text-yellow-600 mr-2" />
            Usuários do Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento completo de todos os usuários da plataforma SimpliWa
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {stats.totalUsers} usuários
        </div>
      </div>

      {/* Alerta de Segurança */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Área de Alta Segurança</h3>
            <p className="text-sm text-amber-700 mt-1">
              Você está visualizando dados dos usuários do sistema. 
              Apenas super administradores têm este acesso.
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Nota: Emails e dados de login são protegidos e não são exibidos por segurança.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <User className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.superAdmins}</p>
              <p className="text-xs text-gray-500 mt-1">Máximo: 1</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Usuário</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Função</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cadastro</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((systemUser) => (
                  <tr key={systemUser.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={systemUser.avatar_url || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop`}
                          alt={systemUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {systemUser.name}
                            {systemUser.role === 'super_admin' && (
                              <Crown className="h-4 w-4 text-yellow-600 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">ID: {systemUser.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(systemUser.role)}`}>
                        {getRoleIcon(systemUser.role)}
                        <span className="ml-1">{getRoleLabel(systemUser.role)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(systemUser.created_at)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        systemUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {systemUser.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewUser(systemUser.id)}
                        className="flex items-center px-3 py-1 text-sm bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Informações de Segurança</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>Super Admin:</strong> Apenas 1 permitido no sistema (você)</li>
              <li>• <strong>Administradores:</strong> Gerenciam suas próprias empresas</li>
              <li>• <strong>Usuários:</strong> Acesso limitado dentro de suas empresas</li>
              <li>• <strong>Dados sensíveis:</strong> Protegidos por RLS (Row Level Security)</li>
              <li>• <strong>Emails:</strong> Protegidos e não exibidos por segurança</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;