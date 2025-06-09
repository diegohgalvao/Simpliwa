import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface GrowthData {
  revenueGrowth: number;
  salesGrowth: number;
  customersGrowth: number;
  messagesGrowth: number;
}

export const useRealGrowthData = () => {
  const { user } = useAuth();
  const [growthData, setGrowthData] = useState<GrowthData>({
    revenueGrowth: 0,
    salesGrowth: 0,
    customersGrowth: 0,
    messagesGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profile) {
      calculateGrowthData();
    }
  }, [user?.profile?.role, user?.currentCompany?.id]);

  const calculateGrowthData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      let companyFilter = '';
      if (user?.profile?.role !== 'super_admin' && user?.currentCompany?.id) {
        companyFilter = user.currentCompany.id;
      }

      // Calculate revenue growth
      const revenueGrowth = await calculateRevenueGrowth(currentMonth, lastMonth, companyFilter);
      
      // Calculate sales growth
      const salesGrowth = await calculateSalesGrowth(currentMonth, lastMonth, companyFilter);
      
      // Calculate customers growth
      const customersGrowth = await calculateCustomersGrowth(currentMonth, lastMonth, companyFilter);
      
      // Calculate messages growth
      const messagesGrowth = await calculateMessagesGrowth(currentMonth, lastMonth, companyFilter);

      setGrowthData({
        revenueGrowth,
        salesGrowth,
        customersGrowth,
        messagesGrowth
      });
    } catch (error) {
      console.error('Erro ao calcular dados de crescimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueGrowth = async (currentMonth: Date, lastMonth: Date, companyFilter: string) => {
    try {
      let currentQuery = supabase
        .from('sales')
        .select('amount')
        .eq('status', 'completed')
        .gte('sale_date', currentMonth.toISOString())
        .lt('sale_date', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      let lastQuery = supabase
        .from('sales')
        .select('amount')
        .eq('status', 'completed')
        .gte('sale_date', lastMonth.toISOString())
        .lt('sale_date', currentMonth.toISOString());

      if (companyFilter) {
        currentQuery = currentQuery.eq('company_id', companyFilter);
        lastQuery = lastQuery.eq('company_id', companyFilter);
      }

      const [currentResult, lastResult] = await Promise.all([
        currentQuery,
        lastQuery
      ]);

      const currentRevenue = currentResult.data?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
      const lastRevenue = lastResult.data?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;

      if (lastRevenue === 0) return currentRevenue > 0 ? 100 : 0;
      return Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100);
    } catch (error) {
      console.error('Erro ao calcular crescimento de receita:', error);
      return 0;
    }
  };

  const calculateSalesGrowth = async (currentMonth: Date, lastMonth: Date, companyFilter: string) => {
    try {
      let currentQuery = supabase
        .from('sales')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')
        .gte('sale_date', currentMonth.toISOString())
        .lt('sale_date', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      let lastQuery = supabase
        .from('sales')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')
        .gte('sale_date', lastMonth.toISOString())
        .lt('sale_date', currentMonth.toISOString());

      if (companyFilter) {
        currentQuery = currentQuery.eq('company_id', companyFilter);
        lastQuery = lastQuery.eq('company_id', companyFilter);
      }

      const [currentResult, lastResult] = await Promise.all([
        currentQuery,
        lastQuery
      ]);

      const currentCount = currentResult.count || 0;
      const lastCount = lastResult.count || 0;

      if (lastCount === 0) return currentCount > 0 ? 100 : 0;
      return Math.round(((currentCount - lastCount) / lastCount) * 100);
    } catch (error) {
      console.error('Erro ao calcular crescimento de vendas:', error);
      return 0;
    }
  };

  const calculateCustomersGrowth = async (currentMonth: Date, lastMonth: Date, companyFilter: string) => {
    try {
      let currentQuery = supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .gte('created_at', currentMonth.toISOString())
        .lt('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      let lastQuery = supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      if (companyFilter) {
        currentQuery = currentQuery.eq('company_id', companyFilter);
        lastQuery = lastQuery.eq('company_id', companyFilter);
      }

      const [currentResult, lastResult] = await Promise.all([
        currentQuery,
        lastQuery
      ]);

      const currentCount = currentResult.count || 0;
      const lastCount = lastResult.count || 0;

      if (lastCount === 0) return currentCount > 0 ? 100 : 0;
      return Math.round(((currentCount - lastCount) / lastCount) * 100);
    } catch (error) {
      console.error('Erro ao calcular crescimento de clientes:', error);
      return 0;
    }
  };

  const calculateMessagesGrowth = async (currentMonth: Date, lastMonth: Date, companyFilter: string) => {
    try {
      let currentQuery = supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .gte('created_at', currentMonth.toISOString())
        .lt('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      let lastQuery = supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      if (companyFilter) {
        currentQuery = currentQuery.eq('company_id', companyFilter);
        lastQuery = lastQuery.eq('company_id', companyFilter);
      }

      const [currentResult, lastResult] = await Promise.all([
        currentQuery,
        lastQuery
      ]);

      const currentCount = currentResult.count || 0;
      const lastCount = lastResult.count || 0;

      if (lastCount === 0) return currentCount > 0 ? 100 : 0;
      return Math.round(((currentCount - lastCount) / lastCount) * 100);
    } catch (error) {
      console.error('Erro ao calcular crescimento de mensagens:', error);
      return 0;
    }
  };

  return { growthData, loading };
};