export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  company?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  plan: 'starter' | 'professional' | 'enterprise';
  monthlyRevenue: number;
  employees: number;
  createdAt: string;
  status: 'active' | 'trial' | 'suspended';
  adminId: string;
}

export interface Sale {
  id: string;
  companyId: string;
  amount: number;
  product: string;
  customer: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
}

export interface Message {
  id: string;
  companyId: string;
  from: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
}

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalMessages: number;
  totalCustomers: number;
  revenueGrowth: number;
  salesGrowth: number;
  messagesGrowth: number;
  customersGrowth: number;
}