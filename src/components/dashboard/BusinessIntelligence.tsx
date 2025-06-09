import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Users, 
  Target, 
  Zap, 
  Award,
  Crown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Company, Sale, Customer, Message } from '../../types';

const BusinessIntelligence = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    totalPlatformRevenue: 0,
    averageRevenuePerCompany: 0,
    totalEmployees: 0,
    conversionRate: 0,
    churnRate: 5.2, // Mock data
    growthRate: 23.5, // Mock data
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
          <div className="mt-4 p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Seu nível de acesso:</strong> {user?.profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
            <p className="text-sm text-red-700 mt-1">
              Esta seção contém dados estratégicos de toda a plataforma SimpliWa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchBusinessIntelligenceData();
  }, []);

  const fetchBusinessIntelligenceData = async () => {
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

      setBusinessMetrics({
        totalCompanies,
        activeCompanies,
        trialCompanies,
        totalPlatformRevenue,
        averageRevenuePerCompany,
        totalEmployees,
        conversionRate,
        churnRate: 5.2, // Mock data - would be calculated from historical data
        growthRate: 23.5, // Mock data - would be calculated from historical data
        totalSales: salesData?.filter(s => s.status === 'completed').length || 0,
        totalCustomers: customersData?.length || 0,
        totalMessages: messagesData?.length || 0
      });

    } catch (error) {
      console.error('Erro ao buscar dados de Business Intelligence:', error);
      setError('Erro ao carregar dados de Business Intelligence');
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

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
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
            onClick={fetchBusinessIntelligenceData}
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
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-20">
          <BarChart3 className="h-32 w-32" />
        </div>
        <div className="relative">
          <div className="flex items-center mb-2">
            <Crown className="h-6 w-6 mr-2" />
            <span className="text-sm font-medium opacity-90">Business Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Inteligência de Negócios SimpliWa
          </h1>
          <p className="text-white/90 text-lg">
            Análise estratégica completa da plataforma para decisões baseadas em dados
          </p>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empresas Ativas</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{businessMetrics.totalCompanies}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(businessMetrics.growthRate)}
            <span className={`text-sm font-medium ml-1 ${getGrowthColor(businessMetrics.growthRate)}`}>
              +{businessMetrics.growthRate}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(businessMetrics.totalPlatformRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(28.3)}
            <span className="text-sm font-medium text-green-600 ml-1">+28.3%</span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {businessMetrics.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(5.2)}
            <span className="text-sm font-medium text-green-600 ml-1">+5.2%</span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Funcionários</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {formatNumber(businessMetrics.totalEmployees)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-50">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(15.7)}
            <span className="text-sm font-medium text-green-600 ml-1">+15.7%</span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Revenue Analysis & Growth Opportunities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Análise de Receita
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Receita média por empresa:</span>
              <span className="font-bold text-green-700">
                {formatCurrency(businessMetrics.averageRevenuePerCompany)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">Receita por funcionário:</span>
              <span className="font-bold text-blue-700">
                {formatCurrency(businessMetrics.totalEmployees > 0 ? 
                  businessMetrics.totalPlatformRevenue / businessMetrics.totalEmployees : 0)}
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-orange-600" />
            Oportunidades de Crescimento
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Empresas em trial:</span>
              <span className="font-bold text-yellow-700">{businessMetrics.trialCompanies}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-700">Potencial upsell:</span>
              <span className="font-bold text-orange-700">
                {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-700">Taxa de churn:</span>
              <span className="font-bold text-red-700">{businessMetrics.churnRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Performance da Plataforma
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{formatNumber(businessMetrics.totalSales)}</div>
            <div className="text-sm text-gray-600">Vendas Concluídas</div>
            <div className="text-xs text-blue-500 mt-1">+18.2% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{formatNumber(businessMetrics.totalCustomers)}</div>
            <div className="text-sm text-gray-600">Clientes Ativos</div>
            <div className="text-xs text-green-500 mt-1">+12.3% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{formatNumber(businessMetrics.totalMessages)}</div>
            <div className="text-sm text-gray-600">Mensagens/Mês</div>
            <div className="text-xs text-purple-500 mt-1">+45.8% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">{businessMetrics.activeCompanies}</div>
            <div className="text-sm text-gray-600">Empresas Ativas</div>
            <div className="text-xs text-orange-500 mt-1">+23.5% vs mês anterior</div>
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

      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-blue-600" />
          Insights Estratégicos
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              Foco em Conversão
            </h4>
            <p className="text-sm text-gray-600">
              {businessMetrics.trialCompanies} empresas em trial. Taxa de conversão atual de {businessMetrics.conversionRate.toFixed(1)}%. 
              Implementar estratégia de conversão personalizada pode aumentar em 15-20%.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
              Oportunidade de Upsell
            </h4>
            <p className="text-sm text-gray-600">
              {companies.filter(c => c.plan === 'starter' && (c.monthly_revenue || 0) > 30000).length} empresas 
              starter com receita {'>'}R$ 30k. Potencial de upgrade para Professional.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2 text-orange-600" />
              Expansão de Mercado
            </h4>
            <p className="text-sm text-gray-600">
              Receita média por funcionário de {formatCurrency(businessMetrics.totalEmployees > 0 ? 
                businessMetrics.totalPlatformRevenue / businessMetrics.totalEmployees : 0)}. 
              Segmentos com maior potencial: {companies.filter(c => (c.monthly_revenue || 0) > 50000).length} empresas high-value.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Retenção de Clientes
            </h4>
            <p className="text-sm text-gray-600">
              Taxa de churn de {businessMetrics.churnRate}% está abaixo da média do setor (8-10%). 
              Manter foco na satisfação do cliente e suporte proativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;