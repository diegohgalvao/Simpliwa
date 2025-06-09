import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Edit, Trash2, DollarSign, Calendar, User, Package, TrendingUp, Download, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealData } from '../../hooks/useRealData';
import { supabase } from '../../lib/supabase';
import CustomerAvatar from '../CustomerAvatar';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

interface Sale {
  id: string;
  company_id: string;
  customer_id?: string;
  amount: number;
  product: string;
  customer_name: string;
  payment_method?: string;
  status: 'completed' | 'pending' | 'cancelled';
  sale_date: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

const Sales = () => {
  const { user } = useAuth();
  const { data, loading, refetch } = useRealData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newSale, setNewSale] = useState({
    product: '',
    customer_name: '',
    amount: '',
    quantity: '1',
    payment_method: '',
    status: 'pending' as const
  });

  const filterRef = useRef<HTMLDivElement>(null);

  // Extract data with fallbacks
  const sales = data?.sales || [];
  const products = data?.products || [];
  const customers = data?.customers || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = sales
    .filter(sale => sale.status === 'completed')
    .reduce((sum, sale) => sum + sale.amount, 0);

  const pendingSales = sales.filter(sale => sale.status === 'pending').length;
  const completedSales = sales.filter(sale => sale.status === 'completed').length;

  const handleAddSale = async () => {
    if (!user?.currentCompany || !newSale.product || !newSale.customer_name || !newSale.amount) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sales')
        .insert({
          company_id: user.currentCompany.id,
          product: newSale.product,
          customer_name: newSale.customer_name,
          amount: parseFloat(newSale.amount),
          quantity: parseInt(newSale.quantity),
          payment_method: newSale.payment_method || null,
          status: newSale.status
        });

      if (error) throw error;

      setNewSale({
        product: '',
        customer_name: '',
        amount: '',
        quantity: '1',
        payment_method: '',
        status: 'pending'
      });
      setShowAddModal(false);
      refetch();
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const handleEditSale = async () => {
    if (!editingSale) return;

    try {
      const { error } = await supabase
        .from('sales')
        .update({
          product: editingSale.product,
          customer_name: editingSale.customer_name,
          amount: editingSale.amount,
          quantity: editingSale.quantity,
          payment_method: editingSale.payment_method,
          status: editingSale.status
        })
        .eq('id', editingSale.id);

      if (error) throw error;

      setEditingSale(null);
      refetch();
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewSale(prev => ({
        ...prev,
        product: product.name,
        amount: product.price.toString()
      }));
      setSelectedProduct(productId);
    }
  };

  const handleCustomerSelect = (customerName: string) => {
    setNewSale(prev => ({
      ...prev,
      customer_name: customerName
    }));
    setSelectedCustomer(customerName);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie suas vendas e acompanhe o desempenho</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Venda</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{completedSales}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingSales}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por produto ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="completed">Concluída</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Produto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quantidade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Pagamento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Nenhuma venda encontrada com os filtros aplicados'
                      : 'Nenhuma venda cadastrada ainda'
                    }
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  // Find customer data for avatar
                  const customer = customers.find(c => c.name === sale.customer_name);
                  
                  return (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{sale.product}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <CustomerAvatar 
                            name={sale.customer_name}
                            avatar_url={customer?.avatar_url}
                            size="sm"
                          />
                          <span className="text-gray-900">{sale.customer_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{sale.quantity || 1}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          R$ {sale.amount.toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{sale.payment_method || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                          sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.status === 'completed' ? 'Concluída' :
                           sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">
                          {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setEditingSale(sale)}
                            className="p-1 text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nova Venda</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="">Selecione um produto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toLocaleString('pt-BR')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ou digite o nome do cliente"
                  value={newSale.customer_name}
                  onChange={(e) => setNewSale(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newSale.amount}
                  onChange={(e) => setNewSale(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={newSale.payment_method}
                  onChange={(e) => setNewSale(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newSale.status}
                  onChange={(e) => setNewSale(prev => ({ ...prev, status: e.target.value as 'completed' | 'pending' | 'cancelled' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSale}
                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Editar Venda</h2>
              <button
                onClick={() => setEditingSale(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto
                </label>
                <input
                  type="text"
                  value={editingSale.product}
                  onChange={(e) => setEditingSale(prev => prev ? { ...prev, product: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={editingSale.customer_name}
                  onChange={(e) => setEditingSale(prev => prev ? { ...prev, customer_name: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingSale.quantity}
                  onChange={(e) => setEditingSale(prev => prev ? { ...prev, quantity: parseInt(e.target.value) } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingSale.amount}
                  onChange={(e) => setEditingSale(prev => prev ? { ...prev, amount: parseFloat(e.target.value) } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={editingSale.payment_method || ''}
                  onChange={(e) => setEditingSale(prev => prev ? { ...prev, payment_method: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingSale.status}
                  onChange={(e) => setEditingSale(prev => prev ? { ...prev, status: e.target.value as 'completed' | 'pending' | 'cancelled' } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingSale(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSale}
                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;