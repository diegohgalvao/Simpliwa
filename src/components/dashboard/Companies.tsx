import React from 'react';
import { Building2, Users, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCompanies } from '../../data/mockData';

const Companies = () => {
  const { currentUser, switchUser } = useAuth();

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Acesso negado. Apenas super administradores podem ver esta seção.
        </div>
      </div>
    );
  }

  const handleViewCompany = (adminId: string) => {
    switchUser(adminId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Empresas Cadastradas</h1>
        <div className="text-sm text-gray-500">
          Total: {mockCompanies.length} empresas
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{mockCompanies.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {mockCompanies.reduce((sum, company) => sum + company.monthlyRevenue, 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Funcionários</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockCompanies.reduce((sum, company) => sum + company.employees, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Crescimento</p>
              <p className="text-2xl font-bold text-gray-900">+23%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-500">{company.segment}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                company.status === 'active' ? 'bg-green-100 text-green-800' :
                company.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {company.status === 'active' ? 'Ativo' :
                 company.status === 'trial' ? 'Trial' : 'Suspenso'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plano:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {company.plan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Receita Mensal:</span>
                <span className="text-sm font-medium text-gray-900">
                  R$ {company.monthlyRevenue.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Funcionários:</span>
                <span className="text-sm font-medium text-gray-900">{company.employees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cadastro:</span>
                <span className="text-sm font-medium text-gray-900">{company.createdAt}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewCompany(company.adminId)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Dashboard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Companies;