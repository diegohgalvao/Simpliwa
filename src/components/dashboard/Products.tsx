import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Package, DollarSign, BarChart3, Eye, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  company_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    category: '',
    image_url: ''
  });

  const categories = ['Vestidos', 'Conjuntos', 'Blusas', 'Saias', 'Acessórios', 'Calças', 'Sapatos', 'Bolsas'];

  useEffect(() => {
    if (user?.currentCompany?.id) {
      fetchProducts();
    }
  }, [user?.currentCompany?.id]);

  const fetchProducts = async () => {
    if (!user?.currentCompany?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', user.currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.currentCompany?.id) {
      alert('Erro: Empresa não selecionada');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          company_id: user.currentCompany.id,
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          category: newProduct.category,
          image_url: newProduct.image_url || null,
          status: 'active'
        });

      if (error) {
        throw error;
      }

      await fetchProducts();
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '', image_url: '' });
      setShowAddModal(false);
      alert('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          stock: editingProduct.stock,
          category: editingProduct.category,
          image_url: editingProduct.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) {
        throw error;
      }

      await fetchProducts();
      setEditingProduct(null);
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchProducts();
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchProducts();
      alert(`Produto ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do produto');
    }
  };

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
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

  if (!user?.currentCompany?.id) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2 inline" />
          Selecione uma empresa para gerenciar produtos.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2 inline" />
          {error}
          <button 
            onClick={fetchProducts}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie o catálogo de produtos da {user.currentCompany.name}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
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
              <p className="text-xs text-gray-500 mt-1">≤ 5 unidades</p>
            </div>
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {totalValue.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Estoque × Preço</p>
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
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'Nenhum produto encontrado com os filtros aplicados'
                : 'Nenhum produto cadastrado ainda'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
              >
                Adicionar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                {editingProduct?.id === product.id ? (
                  // Edit Mode
                  <form onSubmit={handleEditProduct} className="space-y-3">
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    />
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      rows={2}
                      required
                    />
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Preço"
                        required
                      />
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Estoque"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 flex items-center justify-center px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
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
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Excluir produto"
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
                          {product.stock <= 5 && (
                            <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">
                              Baixo
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Valor Total:</span>
                        <span className="font-semibold text-green-600">
                          R$ {(product.price * product.stock).toLocaleString('pt-BR')}
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
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className="text-sm text-secondary hover:underline transition-colors"
                      >
                        {product.status === 'active' ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
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
                  Descrição *
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
                  Categoria *
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
                    Preço (R$) *
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
                    Estoque *
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
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