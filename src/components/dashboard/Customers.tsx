import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    {
      id: '1',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@email.com',
      phone: '+55 11 99999-1234',
      totalPurchases: 'R$ 3.450',
      lastPurchase: '2024-01-15',
      status: 'Ativo',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+55 11 98888-5678',
      totalPurchases: 'R$ 1.890',
      lastPurchase: '2024-01-12',
      status: 'Ativo',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: '3',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '+55 11 97777-9012',
      totalPurchases: 'R$ 2.340',
      lastPurchase: '2024-01-10',
      status: 'Ativo',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: '4',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@email.com',
      phone: '+55 11 96666-3456',
      totalPurchases: 'R$ 890',
      lastPurchase: '2024-01-08',
      status: 'Inativo',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total de Clientes', value: '247', color: 'text-blue-600' },
          { label: 'Clientes Ativos', value: '189', color: 'text-green-600' },
          { label: 'Novos este Mês', value: '23', color: 'text-purple-600' },
          { label: 'Ticket Médio', value: 'R$ 342', color: 'text-orange-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contato</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Compras</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Última Compra</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{customer.totalPurchases}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{customer.lastPurchase}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'Ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-green-600">
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;