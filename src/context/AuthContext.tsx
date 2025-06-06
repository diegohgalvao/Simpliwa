import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthUser, User, Company, CompanyMember } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchCompany: (companyId: string) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    try {
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Buscar empresas do usuário
      const { data: companyMembers, error: companiesError } = await supabase
        .from('company_members')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', supabaseUser.id);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
      }

      // Para super admin, buscar todas as empresas
      let allCompanies: Company[] = [];
      if (profile.role === 'super_admin') {
        const { data: companies, error: allCompaniesError } = await supabase
          .from('companies')
          .select('*');
        
        if (!allCompaniesError) {
          allCompanies = companies || [];
        }
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        profile,
        companies: companyMembers || [],
        currentCompany: companyMembers?.[0]?.companies || allCompanies[0]
      };

      return authUser;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const userData = await fetchUserData(supabaseUser);
      setUser(userData);
    }
  };

  useEffect(() => {
    // Verificar usuário atual
    const getInitialUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        const userData = await fetchUserData(supabaseUser);
        setUser(userData);
      }
      
      setLoading(false);
    };

    getInitialUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await fetchUserData(session.user);
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao criar conta' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const switchCompany = (companyId: string) => {
    if (!user) return;

    const company = user.companies?.find(cm => cm.company_id === companyId)?.companies;
    if (company) {
      setUser({
        ...user,
        currentCompany: company
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      switchCompany,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};