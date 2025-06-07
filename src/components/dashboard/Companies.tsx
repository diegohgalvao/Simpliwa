import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, TrendingUp, Eye, Crown, BarChart3, Calendar, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealData } from '../../hooks/useRealData';

const Companies = () => {
  const { user, switchCompany } = useAuth();
  const { data, loading, error, refreshData } = useRealData();

  // Verificar se usuário tem acesso
  if (user?.profile?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Apenas super administradores podem acessar a visão consolidada de todas as empresas.
          </p>
          <div className="mt-4 p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Seu nível de acesso:</strong> {user?.profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
            <p className="text-sm text-red-700 mt-1">
              Você tem acesso apenas aos dados da sua empresa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleViewCompany = (company: any) => {
    // Simular switch para a empresa (para super admin visualizar dados)
    switchCompany(company.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'trial':
        return 'Trial';
      case 'suspended':
        return 'Suspenso';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'Starter';
      case 'professional':
        return 'Professional';
      case 'enterprise':
        return 'Enterprise';
      default:
        return plan;
    }
  };

  // Calcular estatísticas
  const stats = {
    totalCompanies: data.companies.length,
    totalRevenue: data.companies.reduce((sum, company) => sum + (company.monthly_revenue || 0), 0),
    totalEmployees: data.companies.reduce((sum, company) => sum + (company.employees || 0), 0),
    activeCompanies: data.companies.filter(c => c.status === 'active').length
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados das empresas...</p>
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
            onClick={refreshData}
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
            Análise de Empresas
          </h1>
          <p className="text-gray-600 mt-1">
            Visão estratégica de todas as empresas da plataforma SimpliWa (Dados Reais)
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {stats.totalCompanies} empresas
        </div>
      </div>

      {/* Business Intelligence Alert */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Painel de Business Intelligence</h3>
            <p className="text-sm text-blue-700 mt-1">
              Dados reais do banco de dados. Use estas informações para identificar oportunidades de crescimento, 
              padrões de uso e insights estratégicos para expandir o negócio SimpliWa.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Empresas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCompanies}</p>
              <p className="text-xs text-gray-500 mt-1">Clientes ativos</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {stats.totalRevenue.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mensal combinada</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Funcionários</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalEmployees}</p>
              <p className="text-xs text-gray-500 mt-1">Total no ecossistema</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Ativação</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalCompanies > 0 ? Math.round((stats.activeCompanies / stats.totalCompanies) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeCompanies} de {stats.totalCompanies}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Empresas Cadastradas (Dados Reais)</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Ordenado por data de cadastro</span>
          </div>
        </div>

        {data.companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma empresa cadastrada ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.companies.map((company) => (
              <div key={company.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{company.segment}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(company.plan)}`}>
                        {getPlanLabel(company.plan)}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(company.status)}`}>
                        {getStatusLabel(company.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Receita Mensal:</span>
                    <span className="font-semibold text-gray-900">
                      R$ {(company.monthly_revenue || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Funcionários:</span>
                    <span className="font-semibold text-gray-900">{company.employees || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cadastro:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Business Insights */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Insights de Negócio</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Receita por funcionário:</span>
                      <span className="font-medium">
                        R$ {company.employees ? Math.round((company.monthly_revenue || 0) / company.employees).toLocaleString('pt-BR') : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Potencial de crescimento:</span>
                      <span className={`font-medium ${
                        (company.monthly_revenue || 0) > 50000 ? 'text-green-600' : 
                        (company.monthly_revenue || 0) > 20000 ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {(company.monthly_revenue || 0) > 50000 ? 'Alto' : 
                         (company.monthly_revenue || 0) > 20000 ? 'Médio' : 'Inicial'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewCompany(company)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Business Intelligence Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Receita (Dados Reais)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Receita média por empresa:</span>
              <span className="font-bold text-green-700">
                R$ {stats.totalCompanies > 0 ? Math.round(stats.totalRevenue / stats.totalCompanies).toLocaleString('pt-BR') : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">Receita por funcionário:</span>
              <span className="font-bold text-blue-700">
                R$ {stats.totalEmployees > 0 ? Math.round(stats.totalRevenue / stats.totalEmployees).toLocaleString('pt-BR') : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades de Crescimento</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Empresas em trial:</span>
              <span className="font-bold text-yellow-700">
                {data.companies.filter(c => c.status === 'trial').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-700">Potencial upsell:</span>
              <span className="font-bold text-purple-700">
                {data.companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-700">Empresas de alto valor:</span>
              <span className="font-bold text-orange-700">
                {data.companies.filter(c => (c.monthly_revenue || 0) > 100000).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;