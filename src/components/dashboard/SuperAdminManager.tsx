import React, { useState, useEffect } from 'react';
import { Shield, Plus, UserMinus, Users, AlertTriangle, CheckCircle, X, Crown, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

const SuperAdminManager = () => {
  const { user } = useAuth();
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [hasAnySuperAdmin, setHasAnySuperAdmin] = useState(true);

  useEffect(() => {
    checkSuperAdminStatus();
    loadSuperAdmins();
  }, []);

  const checkSuperAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('has_super_admin');
      if (!error) {
        setHasAnySuperAdmin(data);
      }
    } catch (error) {
      console.error('Error checking super admin status:', error);
    }
  };

  // Permitir acesso se o usuário for super admin OU se não houver nenhum super admin ainda
  const canAccess = user?.profile?.role === 'super_admin' || !hasAnySuperAdmin;

  if (!canAccess) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Acesso negado. Apenas super administradores podem acessar esta seção.</span>
          </div>
        </div>
      </div>
    );
  }

  const loadSuperAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('list_super_admins');

      if (error) {
        throw error;
      }

      if (data.success) {
        setSuperAdmins(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      console.error('Error loading super admins:', error);
      setError('Erro ao carregar super administradores');
    } finally {
      setLoading(false);
    }
  };

  const promoteToSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoteEmail.trim()) {
      setError('Email é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase.rpc('promote_to_super_admin', {
        user_email: promoteEmail.trim()
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setSuccess(data.message);
        setPromoteEmail('');
        setShowPromoteModal(false);
        await loadSuperAdmins();
        await checkSuperAdminStatus();
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      console.error('Error promoting user:', error);
      setError('Erro ao promover usuário a super admin');
    } finally {
      setLoading(false);
    }
  };

  const demoteFromSuperAdmin = async (email: string) => {
    if (!confirm(`Tem certeza que deseja rebaixar ${email} de super administrador?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase.rpc('demote_from_super_admin', {
        user_email: email
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setSuccess(data.message);
        await loadSuperAdmins();
        await checkSuperAdminStatus();
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      console.error('Error demoting user:', error);
      setError('Erro ao rebaixar super admin');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Super Administradores</h1>
        </div>
        <button
          onClick={() => setShowPromoteModal(true)}
          className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Promover Usuário
        </button>
      </div>

      {/* First Super Admin Notice */}
      {!hasAnySuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Primeiro Super Administrador</p>
              <p className="text-sm">
                Nenhum super administrador foi configurado ainda. Você pode promover um usuário existente para ser o primeiro super admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Super Admins</p>
              <p className="text-2xl font-bold text-yellow-600">{superAdmins.length}</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos Hoje</p>
              <p className="text-2xl font-bold text-green-600">
                {superAdmins.filter(admin => {
                  if (!admin.last_sign_in_at) return false;
                  const lastSignIn = new Date(admin.last_sign_in_at);
                  const today = new Date();
                  return lastSignIn.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status do Sistema</p>
              <p className="text-2xl font-bold text-blue-600">
                {hasAnySuperAdmin ? 'Configurado' : 'Inicial'}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Super Admins List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Super Administradores</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Carregando...</span>
          </div>
        ) : superAdmins.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhum super administrador configurado</p>
            <p className="text-sm text-gray-400">
              Use o botão "Promover Usuário" para criar o primeiro super admin
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {superAdmins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{admin.name}</h4>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Criado em: {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {admin.last_sign_in_at && (
                        <span className="text-xs text-gray-500">
                          Último login: {new Date(admin.last_sign_in_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {admin.id === user?.id && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Você
                    </span>
                  )}
                  
                  {superAdmins.length > 1 && (
                    <button
                      onClick={() => demoteFromSuperAdmin(admin.email)}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Rebaixar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Como criar um Super Administrador</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">📋 Passo a passo:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>O usuário deve primeiro <strong>se cadastrar normalmente</strong> no sistema</li>
              <li>Após o cadastro e confirmação do email, use o botão <strong>"Promover Usuário"</strong></li>
              <li>Digite o <strong>email exato</strong> do usuário cadastrado</li>
              <li>O usuário será promovido a super administrador imediatamente</li>
            </ol>
          </div>
          
          <div className="bg-blue-100 p-3 rounded">
            <p className="font-medium mb-1">💡 Dica importante:</p>
            <p>O usuário DEVE existir na base de dados (ter se cadastrado) antes de poder ser promovido. Não é possível criar super admins para emails que não estão cadastrados.</p>
          </div>
          
          <div>
            <p className="font-medium mb-1">⚠️ Regras de segurança:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Sempre deve haver pelo menos 1 super administrador no sistema</li>
              <li>Super admins podem gerenciar todas as empresas e usuários</li>
              <li>Apenas super admins podem promover/rebaixar outros usuários</li>
              <li>Não é possível rebaixar o último super admin do sistema</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Promote Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promover a Super Administrador</h3>
            <form onSubmit={promoteToSuperAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do usuário
                </label>
                <input
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="usuario@exemplo.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ O usuário deve já estar cadastrado e ter confirmado o email
                </p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Importante:</strong> Apenas usuários que já se cadastraram no sistema podem ser promovidos. 
                  Se o email não existir, você receberá um erro.
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPromoteModal(false);
                    setPromoteEmail('');
                    clearMessages();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {loading ? 'Promovendo...' : 'Promover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminManager;