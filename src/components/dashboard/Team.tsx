import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, User, Mail, Phone, Shield, Calendar, UserCheck, Crown, Users, Eye, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserRole, UserPermission } from '../../types';

interface TeamMember {
  id: string;
  user_id: string;
  company_id: string;
  role: UserRole;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

const Team = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);

  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'operator' as UserRole
  });

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin da Empresa',
    manager: 'Gerente',
    operator: 'Operacional',
    viewer: 'Consulta',
    user: 'Usuário'
  };

  const roleDescriptions: Record<UserRole, string> = {
    super_admin: 'Acesso total ao sistema (equipe SimpliWa)',
    admin: 'Proprietário/responsável da empresa',
    manager: 'Gestor de setor (vendas, estoque, marketing)',
    operator: 'Vendedor/atendente (operações do dia a dia)',
    viewer: 'Sócio/consultor (apenas visualização)',
    user: 'Usuário básico'
  };

  const roleColors: Record<UserRole, string> = {
    super_admin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    operator: 'bg-green-100 text-green-800 border-green-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
    user: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const roleIcons: Record<UserRole, React.ComponentType<any>> = {
    super_admin: Crown,
    admin: Shield,
    manager: Users,
    operator: UserCheck,
    viewer: Eye,
    user: User
  };

  useEffect(() => {
    if (user?.currentCompany?.id) {
      fetchTeamMembers();
    }
  }, [user?.currentCompany?.id]);

  const fetchTeamMembers = async () => {
    if (!user?.currentCompany?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('company_members')
        .select(`
          id,
          user_id,
          company_id,
          role,
          created_at,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('company_id', user.currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Erro ao buscar membros da equipe:', error);
      setError('Erro ao carregar membros da equipe');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPermissions = async (memberId: string) => {
    if (!user?.currentCompany?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', memberId)
        .eq('company_id', user.currentCompany.id);

      if (error) {
        throw error;
      }

      setPermissions(data || []);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.currentCompany?.id) {
      alert('Erro: Empresa não selecionada');
      return;
    }

    try {
      // Use RPC function to get user ID by email
      const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
        p_email: newMember.email
      });

      if (rpcError) {
        throw rpcError;
      }

      if (!userId) {
        alert('Usuário não encontrado. O usuário deve se cadastrar primeiro no sistema.');
        return;
      }

      // Verificar se já é membro da empresa
      const { data: existingMember, error: memberError } = await supabase
        .from('company_members')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', user.currentCompany.id)
        .maybeSingle();

      if (memberError) {
        throw memberError;
      }

      if (existingMember) {
        alert('Este usuário já é membro da empresa.');
        return;
      }

      // Adicionar como membro
      const { error: insertError } = await supabase
        .from('company_members')
        .insert({
          user_id: userId,
          company_id: user.currentCompany.id,
          role: newMember.role
        });

      if (insertError) {
        throw insertError;
      }

      await fetchTeamMembers();
      setNewMember({ email: '', name: '', role: 'operator' });
      setShowAddModal(false);
      alert('Membro adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      alert('Erro ao adicionar membro da equipe');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return;

    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      await fetchTeamMembers();
      alert('Membro removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      alert('Erro ao remover membro da equipe');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      await fetchTeamMembers();
      alert('Função alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar função:', error);
      alert('Erro ao alterar função do membro');
    }
  };

  const handleViewPermissions = async (member: TeamMember) => {
    setSelectedMember(member);
    await fetchMemberPermissions(member.user_id);
    setShowPermissionsModal(true);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const totalMembers = teamMembers.length;
  const adminMembers = teamMembers.filter(m => m.role === 'admin').length;
  const managerMembers = teamMembers.filter(m => m.role === 'manager').length;
  const operatorMembers = teamMembers.filter(m => m.role === 'operator').length;

  // Verificar se usuário pode gerenciar equipe
  const canManageTeam = user?.profile?.role === 'super_admin' || 
                       (user?.companies?.some(cm => 
                         cm.company_id === user.currentCompany?.id && 
                         cm.role === 'admin'
                       ));

  if (!user?.currentCompany?.id) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2 inline" />
          Selecione uma empresa para gerenciar a equipe.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2 inline" />
          {error}
          <button 
            onClick={fetchTeamMembers}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Equipe</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os membros e permissões da {user.currentCompany.name}
          </p>
        </div>
        {canManageTeam && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </button>
        )}
      </div>

      {/* Hierarquia de Usuários Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Hierarquia de Usuários SimpliWa
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(roleLabels).map(([role, label]) => {
            if (role === 'super_admin') return null; // Não mostrar super_admin
            const Icon = roleIcons[role as UserRole];
            return (
              <div key={role} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <Icon className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {roleDescriptions[role as UserRole]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Membros</p>
              <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-red-600">{adminMembers}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gerentes</p>
              <p className="text-2xl font-bold text-blue-600">{managerMembers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Operacionais</p>
              <p className="text-2xl font-bold text-green-600">{operatorMembers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">Todas as Funções</option>
            <option value="admin">Admin da Empresa</option>
            <option value="manager">Gerente</option>
            <option value="operator">Operacional</option>
            <option value="viewer">Consulta</option>
            <option value="user">Usuário</option>
          </select>
        </div>

        {/* Team Members Table */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' 
                ? 'Nenhum membro encontrado com os filtros aplicados'
                : 'Nenhum membro na equipe ainda'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Membro</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Função</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Desde</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const Icon = roleIcons[member.role];
                  return (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.profiles?.avatar_url || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop`}
                            alt={member.profiles?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.profiles?.name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {member.user_id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${roleColors[member.role]}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {roleLabels[member.role]}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {new Date(member.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPermissions(member)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Ver permissões"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canManageTeam && member.role !== 'admin' && (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleChangeRole(member.id, e.target.value as UserRole)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                title="Alterar função"
                              >
                                <option value="manager">Gerente</option>
                                <option value="operator">Operacional</option>
                                <option value="viewer">Consulta</option>
                                <option value="user">Usuário</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Remover membro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Membro da Equipe</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Usuário *
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="usuario@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  O usuário deve estar cadastrado no sistema
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função *
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                >
                  <option value="manager">Gerente</option>
                  <option value="operator">Operacional</option>
                  <option value="viewer">Consulta</option>
                  <option value="user">Usuário</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {roleLabels[newMember.role]}
                </p>
                <p className="text-xs text-gray-600">
                  {roleDescriptions[newMember.role]}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Permissões de {selectedMember.profiles?.name}
              </h3>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${roleColors[selectedMember.role]}`}>
                {React.createElement(roleIcons[selectedMember.role], { className: "h-4 w-4 mr-2" })}
                {roleLabels[selectedMember.role]}
              </span>
            </div>

            <div className="space-y-4">
              {permissions.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Este usuário usa as permissões padrão da função {roleLabels[selectedMember.role]}
                  </p>
                </div>
              ) : (
                permissions.map((permission) => (
                  <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {permission.permission_type}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${permission.can_read ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Leitura: {permission.can_read ? 'Sim' : 'Não'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${permission.can_write ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Escrita: {permission.can_write ? 'Sim' : 'Não'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${permission.can_delete ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Exclusão: {permission.can_delete ? 'Sim' : 'Não'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;