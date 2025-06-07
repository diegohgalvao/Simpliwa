import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Package, DollarSign, BarChart3, Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  sales: number;
  revenue: number;
  status: 'active' | 'inactive';
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Vestido Festa Premium',
      description: 'Vestido elegante para ocasiões especiais',
      price: 1250,
      stock: 15,
      category: 'Vestidos',
      sales: 45,
      revenue: 56250,
      status: 'active'
    },
    {
      id: '2',
      name: 'Conjunto Casual',
      description: 'Conjunto confortável para o dia a dia',
      price: 890,
      stock: 23,
      category: 'Conjuntos',
      sales: 32,
      revenue: 28480,
      status: 'active'
    },
    {
      id: '3',
      name: 'Blusa Social',
      description: 'Blusa profissional para trabalho',
      price: 600,
      stock: 8,
      category: 'Blusas',
      sales: 28,
      revenue: 16800,
      status: 'active'
    },
    {
      id: '4',
      name: 'Saia Midi',
      description: 'Saia versátil para diversas ocasiões',
      price: 450,
      stock: 0,
      category: 'Saias',
      sales: 24,
      revenue: 10800,
      status: 'inactive'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });

  const categories = ['Vestidos', 'Conjuntos', 'Blusas', 'Saias', 'Acessórios'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;
  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      sales: 0,
      revenue: 0,
      status: 'active'
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', description: '', price: '', stock: '', category: '' });
    setShowAddModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setProducts(products.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {totalRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Preço:</span>
                  <span className="font-semibold text-gray-900">
                    R$ {product.price.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estoque:</span>
                  <span className={`font-semibold ${
                    product.stock <= 5 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {product.stock} unidades
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vendas:</span>
                  <span className="font-semibold text-gray-900">{product.sales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Receita:</span>
                  <span className="font-semibold text-green-600">
                    R$ {product.revenue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
                <button
                  onClick={() => handleToggleStatus(product.id)}
                  className="text-sm text-secondary hover:underline"
                >
                  {product.status === 'active' ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;