/*
  # Sistema de Autenticação e Multi-Tenancy

  1. Tabelas Principais
    - `companies` - Empresas cadastradas no sistema
    - `profiles` - Perfis de usuários vinculados ao auth.users
    - `company_members` - Relacionamento usuários-empresas com roles
    - `sales` - Vendas das empresas
    - `customers` - Clientes das empresas
    - `messages` - Mensagens WhatsApp das empresas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em company_id para isolamento de dados
    - Diferentes níveis de acesso (super_admin, admin, user)

  3. Funcionalidades
    - Multi-tenancy seguro
    - Controle de acesso granular
    - Auditoria de ações
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para tipos de planos
CREATE TYPE plan_type AS ENUM ('starter', 'professional', 'enterprise');

-- Enum para status de empresas
CREATE TYPE company_status AS ENUM ('active', 'trial', 'suspended', 'cancelled');

-- Enum para roles de usuários
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');

-- Enum para status de vendas
CREATE TYPE sale_status AS ENUM ('completed', 'pending', 'cancelled');

-- Enum para tipos de mensagem
CREATE TYPE message_type AS ENUM ('incoming', 'outgoing');

-- Enum para status de mensagem
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  segment text NOT NULL,
  plan plan_type NOT NULL DEFAULT 'starter',
  monthly_revenue numeric(10,2) DEFAULT 0,
  employees integer DEFAULT 1,
  status company_status NOT NULL DEFAULT 'trial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de perfis de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de relacionamento usuários-empresas
CREATE TABLE IF NOT EXISTS company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  total_purchases numeric(10,2) DEFAULT 0,
  last_purchase_date timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  product text NOT NULL,
  customer_name text NOT NULL,
  payment_method text,
  status sale_status NOT NULL DEFAULT 'pending',
  sale_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  content text NOT NULL,
  type message_type NOT NULL,
  status message_status NOT NULL DEFAULT 'sent',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para companies
CREATE POLICY "Super admins can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Company members can view their company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- Políticas para company_members
CREATE POLICY "Users can view their own memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Company admins can view their company memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('admin', 'super_admin')
    )
  );

-- Políticas para customers
CREATE POLICY "Company members can view their company customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can manage their company customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para sales
CREATE POLICY "Company members can view their company sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can manage their company sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para messages
CREATE POLICY "Company members can view their company messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can manage their company messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    CASE 
      WHEN new.email = 'admin@simpliwa.com.br' THEN 'super_admin'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();