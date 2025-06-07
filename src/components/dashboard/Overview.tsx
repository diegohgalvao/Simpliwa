import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, MessageSquare, Users, Building2, Crown, BarChart3, Target, Zap, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Sale, Customer, Message, Company } from '../../types';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalMessages: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    salesGrowth: 0,
    messagesGrowth: 0,
    customersGrowth: 0
  });
  const [businessStats, setBusinessStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    totalPlatformRevenue: 0,
    averageRevenuePerCompany: 0,
    totalEmployees: 0,
    conversionRate: 0,
    churnRate: 0
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile) {
      fetchDashboardData();
    }
  }, [user?.currentCompany?.id, user?.profile?.role]);

  const fetchDashboardData = async () => {
    if (!user?.profile) return;

    try {
      setLoading(true);
      setError(null);

      if (user.profile.role === 'super_admin') {
        await fetchSuperAdminBusinessData();
      } else {
        await fetchCompanyData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperAdminBusinessData = async () => {
    try {
      // Fetch all companies for business intelligence
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }

      // Fetch consolidated business metrics
      const [salesResult, customersResult, messagesResult] = await Promise.allSettled([
        supabase.from('sales').select('amount, status, sale_date, company_id'),
        supabase.from('customers').select('id, created_at, company_id'),
        supabase.from('messages').select('id, created_at, company_id')
      ]);

      // Process results safely
      const salesData = salesResult.status === 'fulfilled' ? salesResult.value.data : [];
      const customersData = customersResult.status === 'fulfilled' ? customersResult.value.data : [];
      const messagesData = messagesResult.status === 'fulfilled' ? messagesResult.value.data : [];

      // Calculate business intelligence metrics
      const totalCompanies = companiesData?.length || 0;
      const activeCompanies = companiesData?.filter(c => c.status === 'active').length || 0;
      const trialCompanies = companiesData?.filter(c => c.status === 'trial').length || 0;
      const totalPlatformRevenue = companiesData?.reduce((sum, company) => sum + (company.monthly_revenue || 0), 0) || 0;
      const averageRevenuePerCompany = totalCompanies > 0 ? totalPlatformRevenue / totalCompanies : 0;
      const totalEmployees = companiesData?.reduce((sum, company) => sum + (company.employees || 0), 0) || 0;
      const conversionRate = totalCompanies > 0 ? (activeCompanies / totalCompanies) * 100 : 0;

      setBusinessStats({
        totalCompanies,
        activeCompanies,
        trialCompanies,
        totalPlatformRevenue,
        averageRevenuePerCompany,
        totalEmployees,
        conversionRate,
        churnRate: 5.2 // Mock data - would be calculated from historical data
      });

      // Set consolidated stats for the platform
      const totalRevenue = salesData?.reduce((sum, sale) => 
        sale.status === 'completed' ? sum + (sale.amount || 0) : sum, 0) || 0;
      
      setStats({
        totalRevenue,
        totalSales: salesData?.filter(s => s.status === 'completed').length || 0,
        totalMessages: messagesData?.length || 0,
        totalCustomers: customersData?.length || 0,
        revenueGrowth: 23.5, // Mock growth data
        salesGrowth: 18.2,
        messagesGrowth: 45.8,
        customersGrowth: 12.3
      });

      // Get recent sales across all companies (limited for privacy)
      const recentSalesData = salesData?.slice(0, 5) || [];
      setRecentSales(recentSalesData);

    } catch (error) {
      console.error('Error fetching super admin business data:', error);
      throw error;
    }
  };

  const fetchCompanyData = async () => {
    if (!user?.currentCompany?.id) {
      // No company selected, show empty stats
      setStats({
        totalRevenue: 0,
        totalSales: 0,
        totalMessages: 0,
        totalCustomers: 0,
        revenueGrowth: 0,
        salesGrowth: 0,
        messagesGrowth: 0,
        customersGrowth: 0
      });
      setRecentSales([]);
      return;
    }

    try {
      const companyId = user.currentCompany.id;

      // Fetch company-specific data
      const [salesResult, customersResult, messagesResult, recentSalesResult] = await Promise.allSettled([
        supabase.from('sales').select('amount, status, sale_date').eq('company_id', companyId),
        supabase.from('customers').select('id, created_at').eq('company_id', companyId),
        supabase.from('messages').select('id, created_at').eq('company_id', companyId),
        supabase.from('sales').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(5)
      ]);

      // Process results safely
      const salesData = salesResult.status === 'fulfilled' ? salesResult.value.data : [];
      const customersData = customersResult.status === 'fulfilled' ? customersResult.value.data : [];
      const messagesData = messagesResult.status === 'fulfilled' ? messagesResult.value.data : [];
      const recentSalesData = recentSalesResult.status === 'fulfilled' ? recentSalesResult.value.data : [];

      setRecentSales(recentSalesData || []);

      // Calculate stats
      const totalRevenue = salesData?.reduce((sum, sale) => 
        sale.status === 'completed' ? sum + (sale.amount || 0) : sum, 0) || 0;
      
      setStats({
        totalRevenue,
        totalSales: salesData?.filter(s => s.status === 'completed').length || 0,
        totalMessages: messagesData?.length || 0,
        totalCustomers: customersData?.length || 0,
        revenueGrowth: 23.5, // Mock growth data
        salesGrowth: 18.2,
        messagesGrowth: 45.8,
        customersGrowth: 12.3
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
      throw error;
    }
  };

  // Super Admin Business Intelligence Dashboard
  if (user?.profile?.role === 'super_admin') {
    const businessMetrics = [
      {
        title: 'Total de Empresas',
        value: businessStats.totalCompanies.toLocaleString('pt-BR'),
        change: '+12.5%',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Receita da Plataforma',
        value: `R$ ${businessStats.totalPlatformRevenue.toLocaleString('pt-BR')}`,
        change: '+28.3%',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Taxa de Conversão',
        value: `${businessStats.conversionRate.toFixed(1)}%`,
        change: '+5.2%',
        icon: Target,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Funcionários no Ecossistema',
        value: businessStats.totalEmployees.toLocaleString('pt-BR'),
        change: '+15.7%',
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ];

    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
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
              Visão estratégica completa da plataforma para tomada de decisões e crescimento do negócio
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
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">{metric.change}</span>
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
              Análise de Receita
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Receita média por empresa:</span>
                <span className="font-bold text-green-700">
                  R$ {businessStats.averageRevenuePerCompany.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Receita por funcionário:</span>
                <span className="font-bold text-blue-700">
                  R$ {businessStats.totalEmployees > 0 ? 
                    Math.round(businessStats.totalPlatformRevenue / businessStats.totalEmployees).toLocaleString('pt-BR') : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">Potencial de crescimento:</span>
                <span className="font-bold text-purple-700">
                  {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length} empresas
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
                <span className="font-bold text-yellow-700">{businessStats.trialCompanies}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-700">Potencial upsell:</span>
                <span className="font-bold text-orange-700">
                  {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-700">Taxa de churn:</span>
                <span className="font-bold text-red-700">{businessStats.churnRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            Performance da Plataforma
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalSales}</div>
              <div className="text-sm text-gray-600">Vendas Totais</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalCustomers}</div>
              <div className="text-sm text-gray-600">Clientes Ativos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalMessages}</div>
              <div className="text-sm text-gray-600">Mensagens/Mês</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">{businessStats.activeCompanies}</div>
              <div className="text-sm text-gray-600">Empresas Ativas</div>
            </div>
          </div>
        </div>

        {/* Top Performing Companies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Top Empresas por Receita
          </h3>
          <div className="space-y-3">
            {companies
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Estratégicas Recomendadas</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Foco em Conversão</h4>
              <p className="text-sm text-gray-600">
                {businessStats.trialCompanies} empresas em trial. Implementar estratégia de conversão personalizada.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📈 Oportunidade de Upsell</h4>
              <p className="text-sm text-gray-600">
                {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length} empresas 
                starter com potencial para upgrade.
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
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`,
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Vendas',
      value: stats.totalSales.toLocaleString('pt-BR'),
      change: stats.salesGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Mensagens',
      value: stats.totalMessages.toLocaleString('pt-BR'),
      change: stats.messagesGrowth,
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers.toLocaleString('pt-BR'),
      change: stats.customersGrowth,
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
            ? `Aqui está o resumo da ${user.currentCompany.name}`
            : 'Dashboard da sua empresa'
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
              {stat.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas Recentes</h3>
          <div className="space-y-4">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{sale.product}</p>
                    <p className="text-sm text-gray-500">{sale.customer_name}</p>
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
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma venda encontrada</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nova Venda', color: 'bg-green-500' },
            { label: 'Enviar Mensagem', color: 'bg-blue-500' },
            { label: 'Adicionar Cliente', color: 'bg-purple-500' },
            { label: 'Ver Relatórios', color: 'bg-orange-500' }
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;