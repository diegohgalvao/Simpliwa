export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  plan: 'starter' | 'professional' | 'enterprise';
  monthly_revenue: number;
  employees: number;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  user_id: string;
  company_id: string;
  role: 'super_admin' | 'admin' | 'user';
  created_at: string;
  profiles?: User;
  companies?: Company;
}

export interface Customer {
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

export interface Sale {
  id: string;
  company_id: string;
  customer_id?: string;
  amount: number;
  product: string;
  customer_name: string;
  payment_method?: string;
  status: 'completed' | 'pending' | 'cancelled';
  sale_date: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
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

export interface AuthUser {
  id: string;
  email: string;
  profile?: User;
  companies?: CompanyMember[];
  currentCompany?: Company;
}