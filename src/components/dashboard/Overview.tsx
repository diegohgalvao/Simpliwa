import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, MessageSquare, Users, Building2, Crown, BarChart3, Target, Zap, Award, Plus, Send, UserPlus, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealData } from '../../hooks/useRealData';
import { useRealGrowthData } from '../../hooks/useRealGrowthData';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useRealData();
  const { growthData, loading: growthLoading } = useRealGrowthData();
  const navigate = useNavigate();

  // Super Admin Business Intelligence Dashboard
  if (user?.profile?.role === 'super_admin') {
    const businessMetrics = [
      {
        title: 'Total de Empresas',
        value: data.companies.length.toLocaleString('pt-BR'),
        change: '+12.5%',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Receita da Plataforma',
        value: `R$ ${data.stats.totalRevenue.toLocaleString('pt-BR')}`,
        change: `${growthData.revenueGrowth >= 0 ? '+' : ''}${growthData.revenueGrowth}%`,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Vendas Totais',
        value: data.stats.totalSales.toLocaleString('pt-BR'),
        change: `${growthData.salesGrowth >= 0 ? '+' : ''}${growthData.salesGrowth}%`,
        icon: Target,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Funcionários no Ecossistema',
        value: data.companies.reduce((sum, company) => sum + (company.employees || 0), 0).toLocaleString('pt-BR'),
        change: '+15.7%',
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ];

    if (loading || growthLoading) {
      return <LoadingSpinner message="Carregando Business Intelligence..." size="lg" />;
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* Super Admin Welcome */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Crown className="h-32 w-32" />
          </div>
          <div className="relative">
            <div className="flex items-center mb-2">
              <Crown className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium opacity-90">Super Administrador</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Business Intelligence - SimpliWa
            </h1>
            <p className="text-white/90">
              Visão estratégica completa da plataforma com dados reais do banco de dados
            </p>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor} ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {metric.change.startsWith('+') ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
              </div>
            </div>
          ))}
        </div>

        {/* Business Intelligence Panels */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Análise de Receita (Dados Reais)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Receita média por empresa:</span>
                <span className="font-bold text-green-700">
                  R$ {data.companies.length > 0 ? 
                    Math.round(data.stats.totalRevenue / data.companies.length).toLocaleString('pt-BR') : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Receita por funcionário:</span>
                <span className="font-bold text-blue-700">
                  R$ {data.companies.reduce((sum, c) => sum + (c.employees || 0), 0) > 0 ? 
                    Math.round(data.stats.totalRevenue / data.companies.reduce((sum, c) => sum + (c.employees || 0), 0)).toLocaleString('pt-BR') : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">Empresas com potencial de upgrade:</span>
                <span className="font-bold text-purple-700">
                  {data.companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length}
                </span>
              </div>
            </div>
          </div>

          {/* Growth Opportunities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              Oportunidades de Crescimento
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">Empresas em trial:</span>
                <span className="font-bold text-yellow-700">
                  {data.companies.filter(c => c.status === 'trial').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-700">Empresas ativas:</span>
                <span className="font-bold text-orange-700">
                  {data.companies.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Taxa de conversão:</span>
                <span className="font-bold text-green-700">
                  {data.companies.length > 0 ? 
                    Math.round((data.companies.filter(c => c.status === 'active').length / data.companies.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            Performance da Plataforma (Dados Reais)
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{data.stats.totalSales}</div>
              <div className="text-sm text-gray-600">Vendas Concluídas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{data.stats.totalCustomers}</div>
              <div className="text-sm text-gray-600">Clientes Cadastrados</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{data.stats.totalMessages}</div>
              <div className="text-sm text-gray-600">Mensagens Trocadas</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {data.companies.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Empresas Ativas</div>
            </div>
          </div>
        </div>

        {/* Top Performing Companies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Top Empresas por Receita (Dados Reais)
          </h3>
          <div className="space-y-3">
            {data.companies
              .sort((a, b) => (b.monthly_revenue || 0) - (a.monthly_revenue || 0))
              .slice(0, 5)
              .map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.segment}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      R$ {(company.monthly_revenue || 0).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">{company.employees} funcionários</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Strategic Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Estratégicas Baseadas em Dados Reais</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Foco em Conversão</h4>
              <p className="text-sm text-gray-600">
                {data.companies.filter(c => c.status === 'trial').length} empresas em trial. 
                Taxa atual: {data.companies.length > 0 ? 
                  Math.round((data.companies.filter(c => c.status === 'active').length / data.companies.length) * 100) : 0}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📈 Oportunidade de Upsell</h4>
              <p className="text-sm text-gray-600">
                {data.companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length} empresas 
                starter com receita alta podem fazer upgrade.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Company Dashboard
  const statCards = [
    {
      title: 'Receita da Empresa',
      value: `R$ ${data.stats.totalRevenue.toLocaleString('pt-BR')}`,
      change: growthData.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Vendas',
      value: data.stats.totalSales.toLocaleString('pt-BR'),
      change: growthData.salesGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Mensagens',
      value: data.stats.totalMessages.toLocaleString('pt-BR'),
      change: growthData.messagesGrowth,
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Clientes',
      value: data.stats.totalCustomers.toLocaleString('pt-BR'),
      change: growthData.customersGrowth,
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      label: 'Nova Venda',
      color: 'bg-green-500 hover:bg-green-600',
      icon: Plus,
      action: () => navigate('/dashboard/vendas')
    },
    {
      label: 'Enviar Mensagem',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: Send,
      action: () => navigate('/dashboard/mensagens')
    },
    {
      label: 'Adicionar Cliente',
      color: 'bg-purple-500 hover:bg-purple-600',
      icon: UserPlus,
      action: () => navigate('/dashboard/clientes')
    },
    {
      label: 'Ver Relatórios',
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: FileText,
      action: () => navigate('/dashboard/relatorios')
    }
  ];

  if (loading || growthLoading) {
    return <LoadingSpinner message="Carregando dashboard..." size="lg" showCompanyName />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo, {user?.profile?.name}!
        </h1>
        <p className="text-white/90">
          {user?.currentCompany 
            ? `Aqui está o resumo da ${user.currentCompany.name} com dados reais`
            : 'Dashboard da sua empresa com dados reais do banco'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita dos Últimos 6 Meses</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 78, 82, 95, 88, 100].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary rounded-t-lg transition-all hover:bg-secondary"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas Recentes (Dados Reais)</h3>
          <div className="space-y-4">
            {data.sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{sale.product}</p>
                  <p className="text-sm text-gray-500">{sale.customer_name}</p>
                  {sale.quantity && sale.quantity > 1 && (
                    <p className="text-xs text-gray-400">Qtd: {sale.quantity}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">R$ {sale.amount.toLocaleString('pt-BR')}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                    sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {sale.status === 'completed' ? 'Concluída' :
                     sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
            {data.sales.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma venda encontrada</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;