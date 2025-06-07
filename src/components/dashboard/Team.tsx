import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, User, Mail, Phone, Shield, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  department: string;
  position: string;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  joinDate: string;
  permissions: string[];
}

const Team = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      phone: '+55 11 99999-1111',
      role: 'admin',
      department: 'Vendas',
      position: 'Gerente de Vendas',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      joinDate: '2023-06-15',
      permissions: ['sales', 'customers', 'reports']
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos.santos@empresa.com',
      phone: '+55 11 99999-2222',
      role: 'user',
      department: 'Atendimento',
      position: 'Atendente',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active',
      lastLogin: '2024-01-15 13:45',
      joinDate: '2023-08-20',
      permissions: ['customers', 'messages']
    },
    {
      id: '3',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@empresa.com',
      phone: '+55 11 99999-3333',
      role: 'user',
      department: 'Estoque',
      position: 'Assistente de Estoque',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active',
      lastLogin: '2024-01-15 09:20',
      joinDate: '2023-10-10',
      permissions: ['products', 'inventory']
    },
    {
      id: '4',
      name: 'João Costa',
      email: 'joao.costa@empresa.com',
      role: 'user',
      department: 'Marketing',
      position: 'Analista de Marketing',
      status: 'inactive',
      lastLogin: '2024-01-10 16:15',
      joinDate: '2023-12-01',
      permissions: ['reports', 'analytics']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as const,
    department: '',
    position: '',
    permissions: [] as string[]
  });

  const departments = ['Vendas', 'Atendimento', 'Estoque', 'Marketing', 'Financeiro', 'Administração'];
  const availablePermissions = [
    { id: 'sales', label: 'Vendas' },
    { id: 'customers', label: 'Clientes' },
    { id: 'products', label: 'Produtos' },
    { id: 'inventory', label: 'Estoque' },
    { id: 'messages', label: 'Mensagens' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'analytics', label: 'Análises' },
    { id: 'settings', label: 'Configurações' }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const adminMembers = teamMembers.filter(m => m.role === 'admin').length;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      department: newMember.department,
      position: newMember.position,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      permissions: newMember.permissions
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      department: '',
      position: '',
      permissions: []
    });
    setShowAddModal(false);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === id 
        ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
        : m
    ));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setNewMember({
        ...newMember,
        permissions: [...newMember.permissions, permission]
      });
    } else {
      setNewMember({
        ...newMember,
        permissions: newMember.permissions.filter(p => p !== permission)
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Membros</p>
              <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Membros Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">{adminMembers}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departamentos</p>
              <p className="text-2xl font-bold text-orange-600">{departments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
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
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">Todas as Funções</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuário</option>
          </select>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.avatar || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop`}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.position}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                      {member.department}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setEditingMember(member)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {member.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Desde {new Date(member.joinDate).toLocaleDateString('pt-BR')}
                </div>
                {member.lastLogin && (
                  <div className="flex items-center text-sm text-gray-600">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Último login: {new Date(member.lastLogin).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Permissões:</p>
                <div className="flex flex-wrap gap-1">
                  {member.permissions.map(permission => (
                    <span key={permission} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {availablePermissions.find(p => p.id === permission)?.label || permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    member.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(member.id)}
                  className="text-sm text-secondary hover:underline"
                >
                  {member.status === 'active' ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Membro da Equipe</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um departamento</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={newMember.position}
                    onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(permission => (
                    <label key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMember.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-secondary focus:ring-secondary"
                      />
                      <span className="text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
                >
                  Adicionar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;