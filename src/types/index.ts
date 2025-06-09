export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer' | 'user';
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
  role: 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer' | 'user';
  created_at: string;
  profiles?: User;
  companies?: Company;
}

export interface UserPermission {
  id: string;
  user_id: string;
  company_id: string;
  permission_type: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
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
  quantity?: number;
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

export interface Product {
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
  permissions?: UserPermission[];
}

// Tipos para hierarquia de usuários
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer' | 'user';

export interface RolePermissions {
  [key: string]: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    '*': { read: true, write: true, delete: true }
  },
  admin: {
    '*': { read: true, write: true, delete: true }
  },
  manager: {
    products: { read: true, write: true, delete: true },
    sales: { read: true, write: true, delete: false },
    customers: { read: true, write: true, delete: false },
    messages: { read: true, write: true, delete: false },
    reports: { read: true, write: false, delete: false },
    team: { read: true, write: false, delete: false }
  },
  operator: {
    products: { read: true, write: false, delete: false },
    sales: { read: true, write: true, delete: false },
    customers: { read: true, write: true, delete: false },
    messages: { read: true, write: true, delete: false },
    reports: { read: true, write: false, delete: false }
  },
  viewer: {
    products: { read: true, write: false, delete: false },
    sales: { read: true, write: false, delete: false },
    customers: { read: true, write: false, delete: false },
    messages: { read: true, write: false, delete: false },
    reports: { read: true, write: false, delete: false }
  },
  user: {
    products: { read: true, write: false, delete: false },
    sales: { read: true, write: false, delete: false },
    customers: { read: true, write: false, delete: false },
    messages: { read: true, write: false, delete: false }
  }
};