import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockDashboardStats, mockSales, mockCompanies } from '../../data/mockData';

const Overview: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Se for super admin, mostra dados consolidados. Se for admin, mostra dados da empresa
  const isSuper = currentUser?.role === 'super_admin';
  const userCompany = mockCompanies.find(c => c.adminId === currentUser?.id);
  
  const stats = isSuper ? mockDashboardStats : {
    totalRevenue: userCompany?.monthlyRevenue || 0,
    totalSales: 156,
    totalMessages: 1247,
    totalCustomers: 89,
    revenueGrowth: 23.5,
    salesGrowth: 18.2,
    messagesGrowth: 45.8,
    customersGrowth: 12.3
  };

  const statCards = [
    {
      title: 'Receita Total',
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

  const recentSales = mockSales.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
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
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{sale.product}</p>
                  <p className="text-sm text-gray-500">{sale.customer}</p>
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