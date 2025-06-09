import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Phone, Mail, User, Calendar, Save, X, AlertTriangle, MessageSquare, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import CustomerAvatar from '../CustomerAvatar';

interface Customer {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  total_purchases: number;
  last_purchase_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedCustomerForAvatar, setSelectedCustomerForAvatar] = useState<Customer | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Camera and file upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user?.currentCompany?.id) {
      fetchCustomers();
    }
  }, [user?.currentCompany?.id]);

  const fetchCustomers = async () => {
    if (!user?.currentCompany?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', user.currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.currentCompany?.id) {
      alert('Erro: Empresa não selecionada');
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          company_id: user.currentCompany.id,
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          avatar_url: newCustomer.avatar_url || null,
          total_purchases: 0,
          status: 'active'
        });

      if (error) {
        throw error;
      }

      await fetchCustomers();
      setNewCustomer({ name: '', email: '', phone: '', avatar_url: '' });
      setShowAddModal(false);
      alert('Cliente adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      alert('Erro ao adicionar cliente');
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCustomer) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editingCustomer.name,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          avatar_url: editingCustomer.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCustomer.id);

      if (error) {
        throw error;
      }

      await fetchCustomers();
      setEditingCustomer(null);
      alert('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchCustomers();
      alert('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleSendMessage = (customer: Customer) => {
    if (customer.phone) {
      const message = `Olá ${customer.name}! Como posso ajudá-lo hoje?`;
      const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Cliente não possui número de telefone cadastrado');
    }
  };

  const openAvatarModal = (customer: Customer) => {
    setSelectedCustomerForAvatar(customer);
    setShowAvatarModal(true);
  };

  const uploadAvatar = async (file: File) => {
    if (!selectedCustomerForAvatar) return;

    try {
      setUploadingAvatar(true);

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `customer-${selectedCustomerForAvatar.id}-${Date.now()}.${fileExt}`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Atualizar cliente com nova URL
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomerForAvatar.id);

      if (updateError) {
        throw updateError;
      }

      await fetchCustomers();
      setShowAvatarModal(false);
      setSelectedCustomerForAvatar(null);
      alert('Avatar atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        }
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Aguardar um pouco para garantir que o vídeo está pronto
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert('Erro: Câmera não está pronta');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      alert('Erro: Não foi possível acessar o canvas');
      return;
    }

    // Verificar se o vídeo está carregado
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      alert('Aguarde a câmera carregar completamente');
      return;
    }

    // Definir dimensões do canvas baseado no vídeo
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob e fazer upload
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        uploadAvatar(file);
        stopCamera();
      } else {
        alert('Erro ao capturar a foto');
      }
    }, 'image/jpeg', 0.8);
  };

  const removeAvatar = async () => {
    if (!selectedCustomerForAvatar) return;

    try {
      setUploadingAvatar(true);

      const { error } = await supabase
        .from('customers')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomerForAvatar.id);

      if (error) {
        throw error;
      }

      await fetchCustomers();
      setShowAvatarModal(false);
      setSelectedCustomerForAvatar(null);
      alert('Avatar removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      alert('Erro ao remover avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const newThisMonth = customers.filter(c => {
    const customerDate = new Date(c.created_at);
    const now = new Date();
    return customerDate.getMonth() === now.getMonth() && customerDate.getFullYear() === now.getFullYear();
  }).length;
  const averageTicket = customers.length > 0 ? 
    customers.reduce((sum, c) => sum + c.total_purchases, 0) / customers.length : 0;

  if (!user?.currentCompany?.id) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2 inline" />
          Selecione uma empresa para gerenciar clientes.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
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
            onClick={fetchCustomers}
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie os clientes da {user.currentCompany.name}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Novos este Mês</p>
              <p className="text-2xl font-bold text-purple-600">{newThisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-orange-600">
                R$ {averageTicket.toLocaleString('pt-BR')}
              </p>
            </div>
            <User className="h-8 w-8 text-orange-600" />
          </div>
        </div>
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

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum cliente encontrado com os filtros aplicados'
                : 'Nenhum cliente cadastrado ainda'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
              >
                Adicionar Primeiro Cliente
              </button>
            )}
          </div>
        ) : (
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
                      {editingCustomer?.id === customer.id ? (
                        <input
                          type="text"
                          value={editingCustomer.name}
                          onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          required
                        />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <CustomerAvatar 
                              name={customer.name} 
                              avatar_url={customer.avatar_url}
                              size="md"
                            />
                            <button
                              onClick={() => openAvatarModal(customer)}
                              className="absolute -bottom-1 -right-1 bg-secondary text-white p-1 rounded-full hover:bg-opacity-90 transition-colors"
                              title="Alterar foto"
                            >
                              <Camera className="h-3 w-3" />
                            </button>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              Cliente desde {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingCustomer?.id === customer.id ? (
                        <div className="space-y-1">
                          <input
                            type="email"
                            value={editingCustomer.email || ''}
                            onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Email"
                          />
                          <input
                            type="tel"
                            value={editingCustomer.phone || ''}
                            onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Telefone"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.phone}
                            </div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-sm text-gray-500">Sem contato</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        R$ {customer.total_purchases.toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">
                        {customer.last_purchase_date 
                          ? new Date(customer.last_purchase_date).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {editingCustomer?.id === customer.id ? (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={handleEditCustomer}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Salvar"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setEditingCustomer(null)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setEditingCustomer(customer)}
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {customer.phone && (
                            <button 
                              onClick={() => handleSendMessage(customer)}
                              className="p-1 text-gray-500 hover:text-green-600"
                              title="Enviar WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Cliente</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone/WhatsApp
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Foto (opcional)
                </label>
                <input
                  type="url"
                  value={newCustomer.avatar_url}
                  onChange={(e) => setNewCustomer({ ...newCustomer, avatar_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="https://exemplo.com/foto.jpg"
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

      {/* Avatar Upload Modal */}
      {showAvatarModal && selectedCustomerForAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Alterar Foto - {selectedCustomerForAvatar.name}
              </h3>
              <button
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedCustomerForAvatar(null);
                  stopCamera();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showCamera ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CustomerAvatar 
                    name={selectedCustomerForAvatar.name}
                    avatar_url={selectedCustomerForAvatar.avatar_url}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center justify-center px-4 py-3 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Arquivo
                  </button>

                  <button
                    onClick={startCamera}
                    disabled={uploadingAvatar}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Tirar Foto
                  </button>

                  {selectedCustomerForAvatar.avatar_url && (
                    <button
                      onClick={removeAvatar}
                      disabled={uploadingAvatar}
                      className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover Foto
                    </button>
                  )}
                </div>

                {uploadingAvatar && (
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Fazendo upload...</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={capturePhoto}
                    disabled={uploadingAvatar}
                    className="flex-1 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    📸 Capturar
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {uploadingAvatar && (
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Processando foto...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;