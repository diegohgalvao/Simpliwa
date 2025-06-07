import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthUser, User, Company, CompanyMember } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, companyData?: {
    name: string;
    segment: string;
    plan: 'starter' | 'professional' | 'enterprise';
  }) => Promise<{ error?: string }>;
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
  const [initialized, setInitialized] = useState(false);

  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    try {
      console.log('Fetching user data for:', supabaseUser.id);
      
      // First, try to get the profile
      let profile: User | null = null;
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        if (!profileData) {
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
            profile = {
              id: supabaseUser.id,
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
              email: supabaseUser.email!,
              role: 'user',
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          } else {
            profile = newProfile;
          }
        } else {
          profile = profileData;
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        profile = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email!,
          role: 'user',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      console.log('Profile loaded:', profile);

      // Now fetch companies based on role
      let companyMembers: CompanyMember[] = [];
      let currentCompany: Company | undefined;

      try {
        if (profile.role === 'super_admin') {
          console.log('Super admin detected - no company assignment');
        } else {
          // For regular users, get their company memberships
          const { data: memberData, error: memberError } = await supabase
            .from('company_members')
            .select(`
              id,
              user_id,
              company_id,
              role,
              created_at,
              companies:company_id (
                id,
                name,
                segment,
                plan,
                monthly_revenue,
                employees,
                status,
                created_at,
                updated_at
              )
            `)
            .eq('user_id', supabaseUser.id);

          if (memberError) {
            console.warn('Error fetching company memberships:', memberError);
          } else if (memberData && memberData.length > 0) {
            companyMembers = memberData;
            currentCompany = memberData[0]?.companies as Company;
            
            // Se o usuário é admin de uma empresa, atualizar o role no profile
            const isAdmin = memberData.some(cm => cm.role === 'admin');
            if (isAdmin && profile.role === 'user') {
              console.log('User is admin, updating profile role...');
              try {
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ role: 'admin' })
                  .eq('id', supabaseUser.id);
                
                if (!updateError) {
                  profile.role = 'admin';
                }
              } catch (updateError) {
                console.warn('Could not update profile role:', updateError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        profile,
        companies: companyMembers,
        currentCompany: profile.role === 'super_admin' ? undefined : currentCompany
      };

      console.log('Auth user created:', authUser);
      return authUser;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
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

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          await supabase.auth.signOut();
          if (mounted) {
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('Initial session found:', session.user.id);
          
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !currentUser) {
            console.log('Session invalid, clearing...');
            await supabase.auth.signOut();
            if (mounted) {
              setUser(null);
            }
          } else {
            const userData = await fetchUserData(currentUser);
            if (mounted) {
              setUser(userData);
            }
          }
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted || !initialized) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          try {
            const userData = await fetchUserData(session.user);
            if (mounted) {
              setUser(userData);
            }
          } catch (error) {
            console.error('Error handling sign in:', error);
            if (mounted) {
              setUser(null);
            }
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            const userData = await fetchUserData(session.user);
            if (mounted) {
              setUser(userData);
            }
          } catch (error) {
            console.error('Error handling token refresh:', error);
            await supabase.auth.signOut();
            if (mounted) {
              setUser(null);
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email ou senha incorretos' };
        } else if (error.message.includes('Email not confirmed') || 
                   error.message.includes('email_not_confirmed') ||
                   (error as any).code === 'email_not_confirmed') {
          return { error: 'Email not confirmed' };
        } else if (error.message.includes('Too many requests')) {
          return { error: 'Muitas tentativas de login. Aguarde alguns minutos.' };
        } else {
          return { error: error.message };
        }
      }

      return {};
    } catch (error: any) {
      setLoading(false);
      
      const errorStr = String(error);
      if (errorStr.includes('email_not_confirmed') || 
          errorStr.includes('Email not confirmed') ||
          (error?.code === 'email_not_confirmed')) {
        return { error: 'Email not confirmed' };
      }
      
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    companyData?: {
      name: string;
      segment: string;
      plan: 'starter' | 'professional' | 'enterprise';
    }
  ) => {
    try {
      setLoading(true);
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setLoading(false);
        return { error: 'Configuração do Supabase não encontrada.' };
      }

      console.log('Attempting to sign up user:', email, 'with company data:', companyData);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            companyData,
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        setLoading(false);
        console.error('Sign up error:', error);
        
        if (error.message.includes('User already registered')) {
          return { error: 'Este email já está cadastrado. Tente fazer login ou use outro email.' };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: 'A senha deve ter pelo menos 6 caracteres.' };
        }
        if (error.message.includes('Invalid email')) {
          return { error: 'Email inválido. Verifique o formato do email.' };
        }
        
        return { error: error.message };
      }

      // Se há companyData e o usuário foi criado, aguardar um pouco e tentar criar a empresa manualmente
      if (data.user && companyData && !data.user.email_confirmed_at) {
        console.log('User created, will create company after email confirmation');
        setLoading(false);
        return { 
          error: `Conta criada! Plano ${companyData.plan} selecionado. Verifique seu email para confirmar o cadastro antes de fazer login.` 
        };
      }

      // Se o usuário foi criado e confirmado imediatamente, criar empresa
      if (data.user && companyData && data.user.email_confirmed_at) {
        console.log('User created and confirmed, creating company...');
        try {
          // Aguardar um pouco para garantir que o trigger foi executado
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar se a empresa já foi criada pelo trigger
          const { data: existingMembership } = await supabase
            .from('company_members')
            .select('id')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!existingMembership) {
            // Criar empresa manualmente se o trigger não funcionou
            console.log('Creating company manually...');
            const { data: companyResult, error: companyError } = await supabase
              .from('companies')
              .insert({
                name: companyData.name,
                segment: companyData.segment,
                plan: companyData.plan,
                monthly_revenue: 0,
                employees: 1,
                status: 'trial'
              })
              .select()
              .single();

            if (companyError) {
              console.error('Error creating company:', companyError);
            } else if (companyResult) {
              // Adicionar o usuário como admin da empresa
              const { error: memberError } = await supabase
                .from('company_members')
                .insert({
                  user_id: data.user.id,
                  company_id: companyResult.id,
                  role: 'admin'
                });

              if (memberError) {
                console.error('Error adding user as company admin:', memberError);
              } else {
                console.log('Company and membership created successfully');
              }
            }
          } else {
            console.log('Company membership already exists (created by trigger)');
          }
        } catch (companyCreationError) {
          console.error('Error in company creation process:', companyCreationError);
        }
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
    try {
      // First check if there's an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // No valid session exists, just clear local state
        console.log('No active session found, clearing local state');
        setUser(null);
        setLoading(false);
        return;
      }

      // If session exists, attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('user_not_found') || 
            error.message.includes('User from sub claim in JWT does not exist')) {
          console.warn('User account not found during logout - clearing local session');
        } else {
          console.error('Error signing out:', error);
        }
      }
      
      // Always clear local state regardless of server response
      setUser(null);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('user_not_found') || 
          errorMessage.includes('User from sub claim in JWT does not exist')) {
        console.warn('User account not found during logout - clearing local session');
      } else {
        console.error('Unexpected error signing out:', error);
      }
      // Always clear local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchCompany = (companyId: string) => {
    if (!user || user.profile?.role === 'super_admin') {
      return;
    }

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