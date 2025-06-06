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
      console.log('Fetching user data for:', supabaseUser.id);
      
      // Buscar perfil do usuário com retry
      let profile = null;
      let retries = 3;
      
      while (retries > 0 && !profile) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              console.log('Profile not found, creating...');
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: supabaseUser.id,
                  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
                  avatar_url: supabaseUser.user_metadata?.avatar_url || null,
                  role: 'user'
                })
                .select()
                .single();

              if (createError) {
                console.error('Error creating profile:', createError);
                retries--;
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              
              profile = newProfile;
            } else {
              console.error('Error fetching profile:', profileError);
              retries--;
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            profile = profileData;
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!profile) {
        console.error('Failed to fetch or create profile after retries');
        return null;
      }

      console.log('Profile loaded:', profile);

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

      console.log('Auth user created:', authUser);
      return authUser;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const userData = await fetchUserData(supabaseUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Verificar usuário atual
    const getInitialUser = async () => {
      try {
        console.log('Getting initial user...');
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser && mounted) {
          console.log('Initial user found:', supabaseUser.id);
          const userData = await fetchUserData(supabaseUser);
          if (mounted) {
            setUser(userData);
          }
        } else {
          console.log('No initial user found');
        }
      } catch (error) {
        console.error('Error in getInitialUser:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          const userData = await fetchUserData(session.user);
          if (mounted) {
            setUser(userData);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Don't set loading for token refresh
          const userData = await fetchUserData(session.user);
          if (mounted) {
            setUser(userData);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      // Don't set loading to false here, let the auth state change handle it
      return {};
    } catch (error) {
      setLoading(false);
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Verificar se o Supabase está configurado
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setLoading(false);
        return { error: 'Configuração do Supabase não encontrada. Verifique as variáveis de ambiente.' };
      }

      console.log('Attempting to sign up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        setLoading(false);
        console.error('Sign up error:', error);
        
        // Traduzir erros comuns
        if (error.message.includes('User already registered')) {
          return { error: 'Este email já está cadastrado. Tente fazer login.' };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: 'A senha deve ter pelo menos 6 caracteres.' };
        }
        if (error.message.includes('Invalid email')) {
          return { error: 'Email inválido.' };
        }
        
        return { error: error.message };
      }

      if (data.user && !data.user.email_confirmed_at) {
        setLoading(false);
        return { 
          error: 'Conta criada! Verifique seu email para confirmar o cadastro antes de fazer login.' 
        };
      }

      setLoading(false);
      return {};
    } catch (error: any) {
      setLoading(false);
      console.error('Unexpected error during sign up:', error);
      return { error: 'Erro inesperado ao criar conta. Tente novamente.' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
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