import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Company, Sale, Customer, Message } from '../types';

interface DashboardData {
  companies: Company[];
  sales: Sale[];
  customers: Customer[];
  messages: Message[];
  stats: {
    totalRevenue: number;
    totalSales: number;
    totalCustomers: number;
    totalMessages: number;
    revenueGrowth: number;
    salesGrowth: number;
    customersGrowth: number;
    messagesGrowth: number;
  };
}

export const useRealData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    companies: [],
    sales: [],
    customers: [],
    messages: [],
    stats: {
      totalRevenue: 0,
      totalSales: 0,
      totalCustomers: 0,
      totalMessages: 0,
      revenueGrowth: 0,
      salesGrowth: 0,
      customersGrowth: 0,
      messagesGrowth: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile) {
      fetchData();
    }
  }, [user?.profile?.role, user?.currentCompany?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.profile?.role === 'super_admin') {
        await fetchSuperAdminData();
      } else {
        await fetchCompanyData();
      }
    } catch (error) {
      console.error('Error fetching real data:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperAdminData = async () => {
    // Buscar dados consolidados de todas as empresas
    const [companiesResult, salesResult, customersResult, messagesResult] = await Promise.allSettled([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false })
    ]);

    const companies = companiesResult.status === 'fulfilled' ? companiesResult.value.data || [] : [];
    const sales = salesResult.status === 'fulfilled' ? salesResult.value.data || [] : [];
    const customers = customersResult.status === 'fulfilled' ? customersResult.value.data || [] : [];
    const messages = messagesResult.status === 'fulfilled' ? messagesResult.value.data || [] : [];

    // Calcular estatísticas consolidadas
    const completedSales = sales.filter(sale => sale.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

    setData({
      companies,
      sales,
      customers,
      messages,
      stats: {
        totalRevenue,
        totalSales: completedSales.length,
        totalCustomers: customers.length,
        totalMessages: messages.length,
        revenueGrowth: 23.5, // Mock - seria calculado com dados históricos
        salesGrowth: 18.2,
        customersGrowth: 12.3,
        messagesGrowth: 45.8
      }
    });
  };

  const fetchCompanyData = async () => {
    if (!user?.currentCompany?.id) {
      // Sem empresa selecionada
      setData({
        companies: [],
        sales: [],
        customers: [],
        messages: [],
        stats: {
          totalRevenue: 0,
          totalSales: 0,
          totalCustomers: 0,
          totalMessages: 0,
          revenueGrowth: 0,
          salesGrowth: 0,
          customersGrowth: 0,
          messagesGrowth: 0
        }
      });
      return;
    }

    const companyId = user.currentCompany.id;

    // Buscar dados específicos da empresa
    const [salesResult, customersResult, messagesResult] = await Promise.allSettled([
      supabase.from('sales').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
      supabase.from('customers').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('company_id', companyId).order('created_at', { ascending: false })
    ]);

    const sales = salesResult.status === 'fulfilled' ? salesResult.value.data || [] : [];
    const customers = customersResult.status === 'fulfilled' ? customersResult.value.data || [] : [];
    const messages = messagesResult.status === 'fulfilled' ? messagesResult.value.data || [] : [];

    // Calcular estatísticas da empresa
    const completedSales = sales.filter(sale => sale.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

    setData({
      companies: user.currentCompany ? [user.currentCompany] : [],
      sales,
      customers,
      messages,
      stats: {
        totalRevenue,
        totalSales: completedSales.length,
        totalCustomers: customers.length,
        totalMessages: messages.length,
        revenueGrowth: 23.5, // Mock - seria calculado com dados históricos
        salesGrowth: 18.2,
        customersGrowth: 12.3,
        messagesGrowth: 45.8
      }
    });
  };

  const refreshData = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
};

export default useRealData;