import { User, Company, Sale, Message, DashboardStats } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Você (Super Admin)',
    email: 'admin@simpliwa.com.br',
    role: 'super_admin',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-01',
    lastLogin: '2024-01-15 14:30',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria@boutiqueelegance.com.br',
    role: 'admin',
    company: 'Boutique Elegance',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-05',
    lastLogin: '2024-01-15 09:15',
    status: 'active'
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@santosconstrucoes.com.br',
    role: 'admin',
    company: 'Santos Construções',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-08',
    lastLogin: '2024-01-15 11:45',
    status: 'active'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@beautycenter.com.br',
    role: 'admin',
    company: 'Beauty Center',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-10',
    lastLogin: '2024-01-15 16:20',
    status: 'active'
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    email: 'carlos@techfix.com.br',
    role: 'admin',
    company: 'TechFix',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-12',
    lastLogin: '2024-01-15 13:10',
    status: 'active'
  },
  {
    id: '6',
    name: 'Lucia Ferreira',
    email: 'lucia@padariadelicia.com.br',
    role: 'admin',
    company: 'Padaria Delícia',
    avatar: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-14',
    lastLogin: '2024-01-15 08:30',
    status: 'active'
  }
];

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Boutique Elegance',
    segment: 'Moda e Vestuário',
    plan: 'professional',
    monthlyRevenue: 45680,
    employees: 8,
    createdAt: '2024-01-05',
    status: 'active',
    adminId: '2'
  },
  {
    id: '2',
    name: 'Santos Construções',
    segment: 'Construção Civil',
    plan: 'enterprise',
    monthlyRevenue: 125000,
    employees: 25,
    createdAt: '2024-01-08',
    status: 'active',
    adminId: '3'
  },
  {
    id: '3',
    name: 'Beauty Center',
    segment: 'Beleza e Estética',
    plan: 'professional',
    monthlyRevenue: 32500,
    employees: 12,
    createdAt: '2024-01-10',
    status: 'active',
    adminId: '4'
  },
  {
    id: '4',
    name: 'TechFix',
    segment: 'Assistência Técnica',
    plan: 'starter',
    monthlyRevenue: 18900,
    employees: 5,
    createdAt: '2024-01-12',
    status: 'active',
    adminId: '5'
  },
  {
    id: '5',
    name: 'Padaria Delícia',
    segment: 'Alimentação',
    plan: 'starter',
    monthlyRevenue: 22300,
    employees: 6,
    createdAt: '2024-01-14',
    status: 'trial',
    adminId: '6'
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    companyId: '1',
    amount: 1250,
    product: 'Vestido Festa Premium',
    customer: 'Cliente Premium',
    date: '2024-01-15',
    status: 'completed',
    paymentMethod: 'Cartão de Crédito'
  },
  {
    id: '2',
    companyId: '1',
    amount: 890,
    product: 'Conjunto Casual',
    customer: 'Maria Oliveira',
    date: '2024-01-15',
    status: 'completed',
    paymentMethod: 'PIX'
  },
  {
    id: '3',
    companyId: '2',
    amount: 15000,
    product: 'Projeto Residencial',
    customer: 'Família Santos',
    date: '2024-01-14',
    status: 'pending',
    paymentMethod: 'Transferência'
  },
  {
    id: '4',
    companyId: '3',
    amount: 450,
    product: 'Tratamento Facial',
    customer: 'Ana Silva',
    date: '2024-01-15',
    status: 'completed',
    paymentMethod: 'Dinheiro'
  },
  {
    id: '5',
    companyId: '4',
    amount: 320,
    product: 'Reparo Smartphone',
    customer: 'João Costa',
    date: '2024-01-15',
    status: 'completed',
    paymentMethod: 'PIX'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    companyId: '1',
    from: '+55 11 99999-1234',
    content: 'Olá! Gostaria de saber sobre os vestidos de festa.',
    timestamp: '2024-01-15 14:30',
    type: 'incoming',
    status: 'read'
  },
  {
    id: '2',
    companyId: '1',
    from: 'Boutique Elegance',
    content: 'Olá! Temos várias opções lindas. Qual ocasião?',
    timestamp: '2024-01-15 14:32',
    type: 'outgoing',
    status: 'read'
  },
  {
    id: '3',
    companyId: '2',
    from: '+55 11 98888-5678',
    content: 'Preciso de um orçamento para reforma da cozinha.',
    timestamp: '2024-01-15 13:15',
    type: 'incoming',
    status: 'read'
  },
  {
    id: '4',
    companyId: '3',
    from: '+55 11 97777-9012',
    content: 'Qual o valor do tratamento para acne?',
    timestamp: '2024-01-15 15:45',
    type: 'incoming',
    status: 'delivered'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 244730,
  totalSales: 1247,
  totalMessages: 8934,
  totalCustomers: 2156,
  revenueGrowth: 23.5,
  salesGrowth: 18.2,
  messagesGrowth: 45.8,
  customersGrowth: 12.3
};