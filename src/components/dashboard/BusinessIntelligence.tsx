import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Building2, Users, Target, Zap, Award, BarChart3, Crown, AlertTriangle, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Company, Sale, Customer, Message } from '../../types';

interface BusinessMetrics {
  totalCompanies: number;
  activeCompanies: number;
  trialCompanies: number;
  suspendedCompanies: number;
  totalPlatformRevenue: number;
  averageRevenuePerCompany: number;
  totalEmployees: number;
  conversionRate: number;
  churnRate: number;
  growthRate: number;
  totalSales: number;
  totalCustomers: number;
  totalMessages: number;
}

const BusinessIntelligence = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    suspendedCompanies: 0,
    totalPlatformRevenue: 0,
    averageRevenuePerCompany: 0,
    totalEmployees: 0,
    conversionRate: 0,
    churnRate: 0,
    growthRate: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalMessages: 0
  });

  // Verificar se usuário tem acesso
  if (user?.profile?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Apenas super administradores podem acessar o Business Intelligence.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) {
        throw companiesError;
      }

      setCompanies(companiesData || []);

      // Fetch consolidated platform data
      const [salesResult, customersResult, messagesResult] = await Promise.allSettled([
        supabase.from('sales').select('amount, status, sale_date, company_id'),
        supabase.from('customers').select('id, created_at, company_id'),
        supabase.from('messages').select('id, created_at, company_id')
      ]);

      // Process results safely
      const salesData = salesResult.status === 'fulfilled' ? salesResult.value.data : [];
      const customersData = customersResult.status === 'fulfilled' ? customersResult.value.data : [];
      const messagesData = messagesResult.status === 'fulfilled' ? messagesResult.value.data : [];

      // Calculate business metrics
      const totalCompanies = companiesData?.length || 0;
      const activeCompanies = companiesData?.filter(c => c.status === 'active').length || 0;
      const trialCompanies = companiesData?.filter(c => c.status === 'trial').length || 0;
      const suspendedCompanies = companiesData?.filter(c => c.status === 'suspended').length || 0;
      const totalPlatformRevenue = companiesData?.reduce((sum, company) => sum + (company.monthly_revenue || 0), 0) || 0;
      const averageRevenuePerCompany = totalCompanies > 0 ? totalPlatformRevenue / totalCompanies : 0;
      const totalEmployees = companiesData?.reduce((sum, company) => sum + (company.employees || 0), 0) || 0;
      const conversionRate = totalCompanies > 0 ? (activeCompanies / totalCompanies) * 100 : 0;
      const totalSales = salesData?.filter(s => s.status === 'completed').length || 0;
      const totalCustomers = customersData?.length || 0;
      const totalMessages = messagesData?.length || 0;

      setMetrics({
        totalCompanies,
        activeCompanies,
        trialCompanies,
        suspendedCompanies,
        totalPlatformRevenue,
        averageRevenuePerCompany,
        totalEmployees,
        conversionRate,
        churnRate: 5.2, // Mock data - would be calculated from historical data
        growthRate: 28.3, // Mock data
        totalSales,
        totalCustomers,
        totalMessages
      });

    } catch (error) {
      console.error('Erro ao buscar dados de business intelligence:', error);
      setError('Erro ao carregar dados de business intelligence');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Business Intelligence...</p>
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
            onClick={fetchBusinessData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Receita da Plataforma',
      value: formatCurrency(metrics.totalPlatformRevenue),
      change: `+${metrics.growthRate}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Receita mensal combinada'
    },
    {
      title: 'Total de Empresas',
      value: formatNumber(metrics.totalCompanies),
      change: '+12.5%',
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Clientes na plataforma'
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Trial para ativo'
    },
    {
      title: 'Ecossistema de Funcionários',
      value: formatNumber(metrics.totalEmployees),
      change: '+15.7%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Total de usuários ativos'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-20">
          <Crown className="h-32 w-32" />
        </div>
        <div className="relative">
          <div className="flex items-center mb-2">
            <Crown className="h-6 w-6 mr-2" />
            <span className="text-sm font-medium opacity-90">Super Administrador</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Business Intelligence - SimpliWa
          </h1>
          <p className="text-white/90 text-lg">
            Visão estratégica completa da plataforma para tomada de decisões e crescimento do negócio
          </p>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Atualizado em tempo real</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>{metrics.totalCompanies} empresas monitoradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {kpi.change}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.description}</p>
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
                {formatCurrency(metrics.averageRevenuePerCompany)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">Receita por funcionário:</span>
              <span className="font-bold text-blue-700">
                {formatCurrency(metrics.totalEmployees > 0 ? metrics.totalPlatformRevenue / metrics.totalEmployees : 0)}
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
              <span className="font-bold text-yellow-700">{metrics.trialCompanies}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-700">Potencial upsell:</span>
              <span className="font-bold text-orange-700">
                {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-700">Taxa de churn:</span>
              <span className="font-bold text-red-700">{metrics.churnRate}%</span>
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
            <div className="text-2xl font-bold text-blue-600 mb-1">{formatNumber(metrics.totalSales)}</div>
            <div className="text-sm text-gray-600">Vendas Totais</div>
            <div className="text-xs text-blue-600 mt-1">+18.2% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{formatNumber(metrics.totalCustomers)}</div>
            <div className="text-sm text-gray-600">Clientes Ativos</div>
            <div className="text-xs text-green-600 mt-1">+12.3% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{formatNumber(metrics.totalMessages)}</div>
            <div className="text-sm text-gray-600">Mensagens/Mês</div>
            <div className="text-xs text-purple-600 mt-1">+45.8% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">{metrics.activeCompanies}</div>
            <div className="text-sm text-gray-600">Empresas Ativas</div>
            <div className="text-xs text-orange-600 mt-1">{metrics.conversionRate.toFixed(1)}% conversão</div>
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
              <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
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
                    {formatCurrency(company.monthly_revenue || 0)}
                  </div>
                  <div className="text-sm text-gray-500">{company.employees} funcionários</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Strategic Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Ações Estratégicas Recomendadas
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              🎯 <span className="ml-2">Foco em Conversão</span>
            </h4>
            <p className="text-sm text-gray-600">
              {metrics.trialCompanies} empresas em trial. Implementar estratégia de conversão personalizada 
              para aumentar a taxa de {metrics.conversionRate.toFixed(1)}% para 85%.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              📈 <span className="ml-2">Oportunidade de Upsell</span>
            </h4>
            <p className="text-sm text-gray-600">
              {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length} empresas 
              starter com receita alta. Potencial de upgrade para Professional.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              💰 <span className="ml-2">Otimização de Receita</span>
            </h4>
            <p className="text-sm text-gray-600">
              Receita média de {formatCurrency(metrics.averageRevenuePerCompany)} por empresa. 
              Identificar empresas com potencial de crescimento.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-orange-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              🔄 <span className="ml-2">Redução de Churn</span>
            </h4>
            <p className="text-sm text-gray-600">
              Taxa de churn atual: {metrics.churnRate}%. Implementar programa de retenção 
              para empresas em risco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;