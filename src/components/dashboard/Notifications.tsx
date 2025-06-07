import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, AlertTriangle, Trash2, Filter } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'sales' | 'system' | 'team' | 'customer' | 'inventory';
  actionUrl?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Nova venda realizada',
      message: 'Venda de R$ 1.250,00 para Maria Silva foi concluída com sucesso.',
      timestamp: '2024-01-15T14:30:00Z',
      read: false,
      category: 'sales'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Estoque baixo',
      message: 'O produto "Vestido Festa Premium" está com apenas 3 unidades em estoque.',
      timestamp: '2024-01-15T13:45:00Z',
      read: false,
      category: 'inventory'
    },
    {
      id: '3',
      type: 'info',
      title: 'Nova mensagem no WhatsApp',
      message: 'Cliente João Santos enviou uma nova mensagem sobre orçamento.',
      timestamp: '2024-01-15T12:20:00Z',
      read: true,
      category: 'customer'
    },
    {
      id: '4',
      type: 'success',
      title: 'Backup realizado',
      message: 'Backup automático dos dados foi concluído com sucesso.',
      timestamp: '2024-01-15T10:00:00Z',
      read: true,
      category: 'system'
    },
    {
      id: '5',
      type: 'info',
      title: 'Novo membro da equipe',
      message: 'Ana Costa foi adicionada à equipe como Analista de Vendas.',
      timestamp: '2024-01-15T09:15:00Z',
      read: false,
      category: 'team'
    },
    {
      id: '6',
      type: 'error',
      title: 'Falha na sincronização',
      message: 'Erro ao sincronizar dados com o WhatsApp. Tentativa automática em 5 minutos.',
      timestamp: '2024-01-15T08:30:00Z',
      read: false,
      category: 'system'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'sales' | 'system' | 'team' | 'customer' | 'inventory'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sales':
        return 'Vendas';
      case 'system':
        return 'Sistema';
      case 'team':
        return 'Equipe';
      case 'customer':
        return 'Cliente';
      case 'inventory':
        return 'Estoque';
      default:
        return category;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Não Lidas</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vendas</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.category === 'sales').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sistema</p>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => n.category === 'system').length}
              </p>
            </div>
            <Info className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'unread', label: 'Não lidas' },
              { value: 'sales', label: 'Vendas' },
              { value: 'system', label: 'Sistema' },
              { value: 'team', label: 'Equipe' },
              { value: 'customer', label: 'Cliente' },
              { value: 'inventory', label: 'Estoque' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  getTypeColor(notification.type)
                } ${!notification.read ? 'border-l-4 border-l-secondary' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {getCategoryLabel(notification.category)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-secondary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <p className="text-gray-500 text-xs">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-500 hover:text-green-600"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Excluir notificação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;