import React from 'react';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </button>
          <button className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Período</h3>
          <div className="h-80 flex items-end justify-between space-x-2">
            {[
              { month: 'Jan', value: 45680, growth: 12 },
              { month: 'Fev', value: 52340, growth: 15 },
              { month: 'Mar', value: 48920, growth: -7 },
              { month: 'Abr', value: 61250, growth: 25 },
              { month: 'Mai', value: 58730, growth: -4 },
              { month: 'Jun', value: 67890, growth: 16 }
            ].map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-lg relative overflow-hidden">
                  <div 
                    className="w-full bg-primary rounded-lg transition-all hover:bg-secondary"
                    style={{ height: `${(data.value / 70000) * 250}px` }}
                  ></div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xs font-medium text-gray-900">{data.month}</div>
                  <div className="text-xs text-gray-500">R$ {(data.value / 1000).toFixed(0)}k</div>
                  <div className={`text-xs ${data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.growth > 0 ? '+' : ''}{data.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Principais</h3>
            <div className="space-y-4">
              {[
                { label: 'Ticket Médio', value: 'R$ 342', change: '+8.2%', positive: true },
                { label: 'Taxa Conversão', value: '12.4%', change: '+2.1%', positive: true },
                { label: 'Tempo Resposta', value: '2.3min', change: '-15%', positive: true },
                { label: 'Satisfação', value: '4.8/5', change: '+0.2', positive: true }
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                    <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    metric.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produtos</h3>
            <div className="space-y-3">
              {[
                { name: 'Vestido Festa Premium', sales: 45, revenue: 'R$ 56.250' },
                { name: 'Conjunto Casual', sales: 32, revenue: 'R$ 28.480' },
                { name: 'Blusa Social', sales: 28, revenue: 'R$ 16.800' },
                { name: 'Saia Midi', sales: 24, revenue: 'R$ 14.400' }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sales} vendas</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{product.revenue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Clientes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Novos Clientes</div>
                <div className="text-2xl font-bold text-gray-900">127</div>
              </div>
              <div className="text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Clientes Recorrentes</div>
                <div className="text-2xl font-bold text-gray-900">89</div>
              </div>
              <div className="text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance WhatsApp</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensagens Enviadas</span>
              <span className="text-sm font-semibold text-gray-900">1.247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Abertura</span>
              <span className="text-sm font-semibold text-gray-900">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Resposta</span>
              <span className="text-sm font-semibold text-gray-900">67.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversões</span>
              <span className="text-sm font-semibold text-gray-900">156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;