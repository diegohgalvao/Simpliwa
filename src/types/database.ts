export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          segment: string;
          plan: 'starter' | 'professional' | 'enterprise';
          monthly_revenue: number;
          employees: number;
          status: 'active' | 'trial' | 'suspended' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          segment: string;
          plan?: 'starter' | 'professional' | 'enterprise';
          monthly_revenue?: number;
          employees?: number;
          status?: 'active' | 'trial' | 'suspended' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          segment?: string;
          plan?: 'starter' | 'professional' | 'enterprise';
          monthly_revenue?: number;
          employees?: number;
          status?: 'active' | 'trial' | 'suspended' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          role: 'super_admin' | 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          role?: 'super_admin' | 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          role?: 'super_admin' | 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
      };
      company_members: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          role: 'super_admin' | 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          role?: 'super_admin' | 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          role?: 'super_admin' | 'admin' | 'user';
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          total_purchases: number;
          last_purchase_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          total_purchases?: number;
          last_purchase_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          total_purchases?: number;
          last_purchase_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string | null;
          amount: number;
          product: string;
          customer_name: string;
          payment_method: string | null;
          status: 'completed' | 'pending' | 'cancelled';
          sale_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id?: string | null;
          amount: number;
          product: string;
          customer_name: string;
          payment_method?: string | null;
          status?: 'completed' | 'pending' | 'cancelled';
          sale_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          customer_id?: string | null;
          amount?: number;
          product?: string;
          customer_name?: string;
          payment_method?: string | null;
          status?: 'completed' | 'pending' | 'cancelled';
          sale_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          company_id: string;
          customer_phone: string;
          customer_name: string | null;
          content: string;
          type: 'incoming' | 'outgoing';
          status: 'sent' | 'delivered' | 'read';
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_phone: string;
          customer_name?: string | null;
          content: string;
          type: 'incoming' | 'outgoing';
          status?: 'sent' | 'delivered' | 'read';
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          customer_phone?: string;
          customer_name?: string | null;
          content?: string;
          type?: 'incoming' | 'outgoing';
          status?: 'sent' | 'delivered' | 'read';
          timestamp?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_type: 'starter' | 'professional' | 'enterprise';
      company_status: 'active' | 'trial' | 'suspended' | 'cancelled';
      user_role: 'super_admin' | 'admin' | 'user';
      sale_status: 'completed' | 'pending' | 'cancelled';
      message_type: 'incoming' | 'outgoing';
      message_status: 'sent' | 'delivered' | 'read';
    };
  };
}