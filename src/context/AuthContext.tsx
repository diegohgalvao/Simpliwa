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
              // If we can't create profile, return a basic user object
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
            console.error('Error fetching profile:', profileError);
            // Create a fallback profile object
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
        } else {
          profile = profileData;
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        // Create a fallback profile object
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
          // For super admin, get the first company as context
          const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .limit(1);
          
          if (companies && companies.length > 0) {
            currentCompany = companies[0];
          }
        } else {
          // For regular users, get their company memberships with explicit column selection to avoid RLS recursion
          const { data: memberData } = await supabase
            .from('company_members')
            .select('id, user_id, company_id, role, created_at')
            .eq('user_id', supabaseUser.id);

          if (memberData && memberData.length > 0) {
            // Fetch companies separately to avoid RLS recursion
            const companyIds = memberData.map(member => member.company_id);
            const { data: companiesData } = await supabase
              .from('companies')
              .select('*')
              .in('id', companyIds);

            // Combine the data
            companyMembers = memberData.map(member => ({
              ...member,
              companies: companiesData?.find(company => company.id === member.company_id)
            }));

            currentCompany = companyMembers[0]?.companies;
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        // Continue without companies - the app should still work
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        profile,
        companies: companyMembers,
        currentCompany
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
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Initial session found:', session.user.id);
          const userData = await fetchUserData(session.user);
          if (mounted) {
            setUser(userData);
          }
        } else {
          console.log('No initial session found');
          // Clear any stale tokens to prevent refresh token errors
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted || !initialized) return;

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
          // Don't show loading for token refresh
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
        
        // Handle specific error codes
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

      // Success - auth state change will handle the rest
      return {};
    } catch (error: any) {
      setLoading(false);
      
      // Check for email confirmation errors in catch block too
      const errorStr = String(error);
      if (errorStr.includes('email_not_confirmed') || 
          errorStr.includes('Email not confirmed') ||
          (error?.code === 'email_not_confirmed')) {
        return { error: 'Email not confirmed' };
      }
      
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setLoading(false);
        return { error: 'Configuração do Supabase não encontrada.' };
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