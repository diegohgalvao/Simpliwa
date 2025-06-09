/*
  # Restrição de Super Admin Único + Configuração Completa de Acessos

  1. Segurança
    - Apenas 1 super admin permitido no sistema
    - Trigger para validar essa restrição
    - Políticas RLS refinadas por role

  2. Acessos por Role
    - Super Admin: Acesso total (todas empresas, usuários, análises)
    - Admin: Acesso apenas à sua empresa
    - User: Acesso limitado dentro da empresa
*/

-- =====================================================
-- 1. RESTRIÇÃO DE SUPER ADMIN ÚNICO
-- =====================================================

-- Função para validar apenas 1 super admin
CREATE OR REPLACE FUNCTION validate_single_super_admin()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se está tentando criar/atualizar para super_admin
  IF NEW.role = 'super_admin' THEN
    -- Verificar se já existe outro super admin (excluindo o próprio registro)
    IF EXISTS (
      SELECT 1 FROM profiles 
      WHERE role = 'super_admin' 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Apenas um super administrador é permitido no sistema. Remova o super admin atual antes de criar outro.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para validar super admin único
DROP TRIGGER IF EXISTS ensure_single_super_admin ON profiles;
CREATE TRIGGER ensure_single_super_admin
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_single_super_admin();

-- =====================================================
-- 2. ATUALIZAR FUNÇÕES DE GESTÃO DE SUPER ADMIN
-- =====================================================

-- Atualizar função de promoção para validar restrição
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  user_name text;
  existing_super_admin_count integer;
  result json;
BEGIN
  -- Verificar se já existe um super admin
  SELECT COUNT(*) INTO existing_super_admin_count
  FROM profiles 
  WHERE role = 'super_admin';
  
  IF existing_super_admin_count > 0 THEN
    result := json_build_object(
      'success', false,
      'message', 'Já existe um super administrador no sistema. Apenas um é permitido.',
      'user_id', null
    );
    RETURN result;
  END IF;

  -- Buscar o ID do usuário pelo email
  SELECT id, COALESCE(raw_user_meta_data->>'name', email) 
  INTO user_id, user_name
  FROM auth.users
  WHERE email = user_email;
  
  -- Se usuário não encontrado, retornar erro
  IF user_id IS NULL THEN
    result := json_build_object(
      'success', false,
      'message', 'Usuário não encontrado com email: ' || user_email,
      'user_id', null
    );
    RETURN result;
  END IF;
  
  -- Atualizar ou inserir perfil como super_admin
  INSERT INTO profiles (id, name, role, created_at, updated_at)
  VALUES (
    user_id,
    user_name,
    'super_admin',
    now(),
    now()
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'super_admin',
    updated_at = now();
    
  result := json_build_object(
    'success', true,
    'message', 'Usuário promovido a super admin com sucesso! Este é agora o único super admin do sistema.',
    'user_id', user_id,
    'email', user_email,
    'name', user_name
  );
  
  RETURN result;
END;
$$;

-- =====================================================
-- 3. POLÍTICAS RLS REFINADAS POR ROLE
-- =====================================================

-- Limpar políticas existentes das tabelas principais
DROP POLICY IF EXISTS "Company members can view their company" ON companies;
DROP POLICY IF EXISTS "Super admins can manage all companies" ON companies;
DROP POLICY IF EXISTS "Super admins can view all companies" ON companies;

DROP POLICY IF EXISTS "Company members can manage their company customers" ON customers;
DROP POLICY IF EXISTS "Company members can view their company customers" ON customers;

DROP POLICY IF EXISTS "Company members can manage their company sales" ON sales;
DROP POLICY IF EXISTS "Company members can view their company sales" ON sales;

DROP POLICY IF EXISTS "Company members can manage their company messages" ON messages;
DROP POLICY IF EXISTS "Company members can view their company messages" ON messages;

-- =====================================================
-- POLÍTICAS PARA COMPANIES
-- =====================================================

-- Super admin: acesso total
CREATE POLICY "super_admin_full_companies_access"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Admin/User: apenas sua empresa
CREATE POLICY "company_members_own_company_access"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Apenas admins podem atualizar dados da empresa
CREATE POLICY "company_admins_can_update"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA CUSTOMERS
-- =====================================================

-- Super admin: acesso total
CREATE POLICY "super_admin_full_customers_access"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Membros da empresa: apenas clientes da sua empresa
CREATE POLICY "company_members_own_customers_access"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS PARA SALES
-- =====================================================

-- Super admin: acesso total
CREATE POLICY "super_admin_full_sales_access"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Membros da empresa: apenas vendas da sua empresa
CREATE POLICY "company_members_own_sales_access"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS PARA MESSAGES
-- =====================================================

-- Super admin: acesso total
CREATE POLICY "super_admin_full_messages_access"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Membros da empresa: apenas mensagens da sua empresa
CREATE POLICY "company_members_own_messages_access"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS PARA COMPANY_MEMBERS
-- =====================================================

-- Super admin: acesso total
CREATE POLICY "super_admin_full_members_access"
  ON company_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Usuários podem ver membros das suas empresas
CREATE POLICY "users_view_own_company_members"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem inserir a si mesmos em empresas
CREATE POLICY "users_insert_own_memberships"
  ON company_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Apenas admins podem gerenciar membros da empresa
CREATE POLICY "company_admins_manage_members"
  ON company_members
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- 4. FUNÇÃO PARA VERIFICAR PERMISSÕES
-- =====================================================

-- Função para verificar se usuário tem acesso a uma empresa
CREATE OR REPLACE FUNCTION user_has_company_access(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  has_access boolean := false;
BEGIN
  -- Buscar role do usuário atual
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Super admin tem acesso a tudo
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Verificar se é membro da empresa
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id
  ) INTO has_access;
  
  RETURN has_access;
END;
$$;

-- Função para verificar se usuário é admin de uma empresa
CREATE OR REPLACE FUNCTION user_is_company_admin(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  is_admin boolean := false;
BEGIN
  -- Buscar role do usuário atual
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Super admin tem acesso de admin a tudo
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin da empresa
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id
    AND role = 'admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION validate_single_super_admin() IS 'Trigger function que garante apenas 1 super admin no sistema';
COMMENT ON FUNCTION user_has_company_access(uuid) IS 'Verifica se usuário tem acesso a uma empresa específica';
COMMENT ON FUNCTION user_is_company_admin(uuid) IS 'Verifica se usuário é admin de uma empresa específica';