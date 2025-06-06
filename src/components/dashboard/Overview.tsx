import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, MessageSquare, Users } from 'lucide-react';
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
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.currentCompany?.id, user?.profile?.role]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (user.profile?.role === 'super_admin') {
        // Super admin vê dados consolidados
        await fetchSuperAdminData();
      } else {
        // Admin vê dados da empresa
        await fetchCompanyData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperAdminData = async () => {
    // Buscar todas as empresas
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*');

    if (companiesData) {
      setCompanies(companiesData);
    }

    // Buscar estatísticas consolidadas
    const { data: salesData } = await supabase
      .from('sales')
      .select('amount, status, sale_date');

    const { data: customersData } = await supabase
      .from('customers')
      .select('id, created_at');

    const { data: messagesData } = await supabase
      .from('messages')
      .select('id, created_at');

    // Buscar vendas recentes
    const { data: recentSalesData } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentSalesData) {
      setRecentSales(recentSalesData);
    }

    // Calcular estatísticas
    const totalRevenue = salesData?.reduce((sum, sale) => 
      sale.status === 'completed' ? sum + sale.amount : sum, 0) || 0;
    
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
  };

  const fetchCompanyData = async () => {
    if (!user?.currentCompany?.id) return;

    const companyId = user.currentCompany.id;

    // Buscar dados da empresa específica
    const { data: salesData } = await supabase
      .from('sales')
      .select('amount, status, sale_date')
      .eq('company_id', companyId);

    const { data: customersData } = await supabase
      .from('customers')
      .select('id, created_at')
      .eq('company_id', companyId);

    const { data: messagesData } = await supabase
      .from('messages')
      .select('id, created_at')
      .eq('company_id', companyId);

    // Buscar vendas recentes
    const { data: recentSalesData } = await supabase
      .from('sales')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentSalesData) {
      setRecentSales(recentSalesData);
    }

    // Calcular estatísticas
    const totalRevenue = salesData?.reduce((sum, sale) => 
      sale.status === 'completed' ? sum + sale.amount : sum, 0) || 0;
    
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
  };

  const statCards = [
    {
      title: user?.profile?.role === 'super_admin' ? 'Receita Total' : 'Receita da Empresa',
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

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo, {user?.profile?.name}!
        </h1>
        <p className="text-white/90">
          {user?.profile?.role === 'super_admin' 
            ? 'Visão geral de todas as empresas do sistema'
            : `Aqui está o resumo da ${user?.currentCompany?.name}`
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

      {/* Super Admin - Companies Overview */}
      {user?.profile?.role === 'super_admin' && companies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Empresas Cadastradas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.slice(0, 6).map((company) => (
              <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{company.name}</h4>
                <p className="text-sm text-gray-500">{company.segment}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    company.status === 'active' ? 'bg-green-100 text-green-800' :
                    company.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {company.status === 'active' ? 'Ativo' :
                     company.status === 'trial' ? 'Trial' : 'Suspenso'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    R$ {company.monthly_revenue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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