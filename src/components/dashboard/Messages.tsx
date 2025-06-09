import React, { useState, useEffect } from 'react';
import { Search, Filter, Send, Phone, MoreVertical, MessageSquare, User, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  company_id: string;
  customer_phone: string;
  customer_name?: string;
  content: string;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  created_at: string;
}

interface Chat {
  customer_phone: string;
  customer_name?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  messages: Message[];
}

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.currentCompany?.id) {
      fetchMessages();
    }
  }, [user?.currentCompany?.id]);

  const fetchMessages = async () => {
    if (!user?.currentCompany?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('company_id', user.currentCompany.id)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
      processChats(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const processChats = (messagesData: Message[]) => {
    const chatMap = new Map<string, Chat>();

    messagesData.forEach(message => {
      const phone = message.customer_phone;
      
      if (!chatMap.has(phone)) {
        chatMap.set(phone, {
          customer_phone: phone,
          customer_name: message.customer_name,
          lastMessage: message.content,
          timestamp: message.timestamp,
          unread: message.type === 'incoming' && message.status !== 'read' ? 1 : 0,
          messages: []
        });
      }

      const chat = chatMap.get(phone)!;
      chat.messages.push(message);

      // Atualizar última mensagem se for mais recente
      if (new Date(message.timestamp) > new Date(chat.timestamp)) {
        chat.lastMessage = message.content;
        chat.timestamp = message.timestamp;
      }

      // Contar mensagens não lidas
      if (message.type === 'incoming' && message.status !== 'read') {
        chat.unread++;
      }
    });

    // Ordenar mensagens de cada chat
    chatMap.forEach(chat => {
      chat.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    // Converter para array e ordenar por timestamp
    const chatsArray = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setChats(chatsArray);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.currentCompany?.id) return;

    try {
      const selectedChatData = chats.find(c => c.customer_phone === selectedChat);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          company_id: user.currentCompany.id,
          customer_phone: selectedChat,
          customer_name: selectedChatData?.customer_name,
          content: newMessage,
          type: 'outgoing',
          status: 'sent',
          timestamp: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Abrir WhatsApp Web
      const whatsappUrl = `https://wa.me/${selectedChat.replace(/\D/g, '')}?text=${encodeURIComponent(newMessage)}`;
      window.open(whatsappUrl, '_blank');

      setNewMessage('');
      await fetchMessages();
      alert('Mensagem enviada! O WhatsApp Web foi aberto para você.');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    }
  };

  const handleMarkAsRead = async (phone: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('company_id', user?.currentCompany?.id)
        .eq('customer_phone', phone)
        .eq('type', 'incoming')
        .neq('status', 'read');

      if (error) {
        throw error;
      }

      await fetchMessages();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const filteredChats = chats.filter(chat =>
    (chat.customer_name && chat.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    chat.customer_phone.includes(searchTerm) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChatMessages = selectedChat ? 
    chats.find(c => c.customer_phone === selectedChat)?.messages || [] : [];

  const totalMessages = messages.length;
  const unreadMessages = chats.reduce((sum, chat) => sum + chat.unread, 0);
  const totalChats = chats.length;

  if (!user?.currentCompany?.id) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2 inline" />
          Selecione uma empresa para gerenciar mensagens.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
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
            onClick={fetchMessages}
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
          <h1 className="text-2xl font-bold text-gray-900">Mensagens WhatsApp</h1>
          <p className="text-gray-600 mt-1">Central de mensagens da {user.currentCompany.name}</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Total: {totalMessages}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Não lidas: {unreadMessages}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Conversas</p>
              <p className="text-2xl font-bold text-blue-600">{totalChats}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensagens Não Lidas</p>
              <p className="text-2xl font-bold text-red-600">{unreadMessages}</p>
            </div>
            <User className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Mensagens</p>
              <p className="text-2xl font-bold text-green-600">{totalMessages}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.customer_phone}
                  onClick={() => {
                    setSelectedChat(chat.customer_phone);
                    if (chat.unread > 0) {
                      handleMarkAsRead(chat.customer_phone);
                    }
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat === chat.customer_phone ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={chat.avatar || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop`}
                      alt={chat.customer_name || 'Cliente'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.customer_name || 'Cliente'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-gray-400">{chat.customer_phone}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={chats.find(c => c.customer_phone === selectedChat)?.avatar || 
                         `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {chats.find(c => c.customer_phone === selectedChat)?.customer_name || 'Cliente'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/${selectedChat.replace(/\D/g, '')}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Abrir no WhatsApp"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma mensagem ainda
                  </div>
                ) : (
                  currentChatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'incoming' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'incoming'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-secondary text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.type === 'incoming' ? 'text-gray-500' : 'text-white/70'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {message.type === 'outgoing' && (
                            <div className="ml-2">
                              {message.status === 'sent' && <Clock className="h-3 w-3 text-white/70" />}
                              {message.status === 'delivered' && <CheckCircle className="h-3 w-3 text-white/70" />}
                              {message.status === 'read' && <CheckCircle className="h-3 w-3 text-green-300" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-secondary text-white p-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Dica: Ao enviar, o WhatsApp Web será aberto automaticamente
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">Escolha uma conversa para começar a responder</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;