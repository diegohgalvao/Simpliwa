/*
  # Sistema Completo de Hierarquia de Usuários - SimpliWa

  1. Novos Tipos de Usuário
    - `super_admin`: Acesso total ao sistema (equipe SimpliWa)
    - `admin`: Admin da Empresa (proprietário/responsável)
    - `manager`: Usuário Gerente (gestores de setor)
    - `operator`: Usuário Operacional (vendedores/atendentes)
    - `viewer`: Usuário Leitura/Consulta (sócios/consultores)

  2. Tabelas Atualizadas
    - Atualização do enum user_role
    - Nova tabela user_permissions para controle granular
    - Atualização das políticas RLS

  3. Segurança
    - RLS atualizado para novos perfis
    - Políticas específicas por nível de acesso
    - Controle de permissões granular
*/

-- Atualizar enum de roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';

-- Criar tabela de permissões por usuário
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  permission_type text NOT NULL,
  can_read boolean DEFAULT true,
  can_write boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id, permission_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_company ON user_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_type ON user_permissions(permission_type);

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_permissions
CREATE POLICY "Users can view own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_is_company_admin(company_id) OR
    user_is_super_admin()
  );

CREATE POLICY "Admins can manage permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    user_is_company_admin(company_id) OR
    user_is_super_admin()
  )
  WITH CHECK (
    user_is_company_admin(company_id) OR
    user_is_super_admin()
  );

-- Função para verificar se usuário é gerente
CREATE OR REPLACE FUNCTION user_is_manager(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members cm
    JOIN profiles p ON p.id = cm.user_id
    WHERE cm.user_id = auth.uid()
    AND cm.company_id = target_company_id
    AND cm.role IN ('admin', 'manager')
  );
END;
$$;

-- Função para verificar permissão específica
CREATE OR REPLACE FUNCTION user_has_permission(
  target_company_id uuid,
  permission_type text,
  action_type text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_val user_role;
  has_permission boolean := false;
BEGIN
  -- Super admin tem todas as permissões
  IF user_is_super_admin() THEN
    RETURN true;
  END IF;

  -- Verificar se usuário tem acesso à empresa
  IF NOT user_has_company_access(target_company_id) THEN
    RETURN false;
  END IF;

  -- Buscar role do usuário na empresa
  SELECT cm.role INTO user_role_val
  FROM company_members cm
  WHERE cm.user_id = auth.uid()
  AND cm.company_id = target_company_id;

  -- Admin da empresa tem todas as permissões
  IF user_role_val = 'admin' THEN
    RETURN true;
  END IF;

  -- Verificar permissões específicas na tabela user_permissions
  IF action_type = 'read' THEN
    SELECT COALESCE(up.can_read, false) INTO has_permission
    FROM user_permissions up
    WHERE up.user_id = auth.uid()
    AND up.company_id = target_company_id
    AND up.permission_type = permission_type;
  ELSIF action_type = 'write' THEN
    SELECT COALESCE(up.can_write, false) INTO has_permission
    FROM user_permissions up
    WHERE up.user_id = auth.uid()
    AND up.company_id = target_company_id
    AND up.permission_type = permission_type;
  ELSIF action_type = 'delete' THEN
    SELECT COALESCE(up.can_delete, false) INTO has_permission
    FROM user_permissions up
    WHERE up.user_id = auth.uid()
    AND up.company_id = target_company_id
    AND up.permission_type = permission_type;
  END IF;

  -- Se não há permissão específica, usar permissões padrão por role
  IF has_permission IS NULL THEN
    CASE user_role_val
      WHEN 'manager' THEN
        -- Gerentes podem ler e escrever na maioria das coisas
        has_permission := (action_type IN ('read', 'write'));
      WHEN 'operator' THEN
        -- Operadores podem ler e escrever apenas operações básicas
        has_permission := (
          action_type = 'read' OR 
          (action_type = 'write' AND permission_type IN ('sales', 'customers', 'messages'))
        );
      WHEN 'viewer' THEN
        -- Viewers apenas leem
        has_permission := (action_type = 'read');
      ELSE
        has_permission := false;
    END CASE;
  END IF;

  RETURN COALESCE(has_permission, false);
END;
$$;

-- Atualizar políticas existentes para usar o novo sistema de permissões

-- Produtos
DROP POLICY IF EXISTS "users_can_access_company_products" ON products;
CREATE POLICY "users_can_access_company_products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    user_has_permission(company_id, 'products', 'read')
  );

CREATE POLICY "users_can_manage_company_products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_permission(company_id, 'products', 'write')
  );

CREATE POLICY "users_can_update_company_products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    user_has_permission(company_id, 'products', 'write')
  )
  WITH CHECK (
    user_has_permission(company_id, 'products', 'write')
  );

CREATE POLICY "users_can_delete_company_products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    user_has_permission(company_id, 'products', 'delete')
  );

-- Vendas
DROP POLICY IF EXISTS "users_can_access_company_sales" ON sales;
CREATE POLICY "users_can_access_company_sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    user_has_permission(company_id, 'sales', 'read')
  );

CREATE POLICY "users_can_create_company_sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_permission(company_id, 'sales', 'write')
  );

CREATE POLICY "users_can_update_company_sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (
    user_has_permission(company_id, 'sales', 'write')
  )
  WITH CHECK (
    user_has_permission(company_id, 'sales', 'write')
  );

CREATE POLICY "users_can_delete_company_sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (
    user_has_permission(company_id, 'sales', 'delete')
  );

-- Clientes
DROP POLICY IF EXISTS "users_can_access_company_customers" ON customers;
CREATE POLICY "users_can_access_company_customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    user_has_permission(company_id, 'customers', 'read')
  );

CREATE POLICY "users_can_create_company_customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_permission(company_id, 'customers', 'write')
  );

CREATE POLICY "users_can_update_company_customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    user_has_permission(company_id, 'customers', 'write')
  )
  WITH CHECK (
    user_has_permission(company_id, 'customers', 'write')
  );

CREATE POLICY "users_can_delete_company_customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    user_has_permission(company_id, 'customers', 'delete')
  );

-- Mensagens
DROP POLICY IF EXISTS "users_can_access_company_messages" ON messages;
CREATE POLICY "users_can_access_company_messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    user_has_permission(company_id, 'messages', 'read')
  );

CREATE POLICY "users_can_create_company_messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_permission(company_id, 'messages', 'write')
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar permissões padrão para um usuário
CREATE OR REPLACE FUNCTION create_default_permissions(
  target_user_id uuid,
  target_company_id uuid,
  user_role_val user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar permissões existentes
  DELETE FROM user_permissions 
  WHERE user_id = target_user_id AND company_id = target_company_id;

  -- Criar permissões baseadas no role
  CASE user_role_val
    WHEN 'admin' THEN
      -- Admin tem todas as permissões (não precisa de registros específicos)
      NULL;
    
    WHEN 'manager' THEN
      -- Gerente: pode ler/escrever na maioria, deletar algumas coisas
      INSERT INTO user_permissions (user_id, company_id, permission_type, can_read, can_write, can_delete)
      VALUES 
        (target_user_id, target_company_id, 'products', true, true, true),
        (target_user_id, target_company_id, 'sales', true, true, false),
        (target_user_id, target_company_id, 'customers', true, true, false),
        (target_user_id, target_company_id, 'messages', true, true, false),
        (target_user_id, target_company_id, 'reports', true, false, false),
        (target_user_id, target_company_id, 'team', true, false, false);
    
    WHEN 'operator' THEN
      -- Operador: pode ler/escrever operações básicas
      INSERT INTO user_permissions (user_id, company_id, permission_type, can_read, can_write, can_delete)
      VALUES 
        (target_user_id, target_company_id, 'products', true, false, false),
        (target_user_id, target_company_id, 'sales', true, true, false),
        (target_user_id, target_company_id, 'customers', true, true, false),
        (target_user_id, target_company_id, 'messages', true, true, false),
        (target_user_id, target_company_id, 'reports', true, false, false);
    
    WHEN 'viewer' THEN
      -- Viewer: apenas leitura
      INSERT INTO user_permissions (user_id, company_id, permission_type, can_read, can_write, can_delete)
      VALUES 
        (target_user_id, target_company_id, 'products', true, false, false),
        (target_user_id, target_company_id, 'sales', true, false, false),
        (target_user_id, target_company_id, 'customers', true, false, false),
        (target_user_id, target_company_id, 'messages', true, false, false),
        (target_user_id, target_company_id, 'reports', true, false, false);
    
    ELSE
      -- User padrão: permissões básicas
      INSERT INTO user_permissions (user_id, company_id, permission_type, can_read, can_write, can_delete)
      VALUES 
        (target_user_id, target_company_id, 'products', true, false, false),
        (target_user_id, target_company_id, 'sales', true, false, false),
        (target_user_id, target_company_id, 'customers', true, false, false),
        (target_user_id, target_company_id, 'messages', true, false, false);
  END CASE;
END;
$$;

-- Trigger para criar permissões padrão quando um membro é adicionado
CREATE OR REPLACE FUNCTION handle_new_company_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar permissões padrão para o novo membro
  PERFORM create_default_permissions(NEW.user_id, NEW.company_id, NEW.role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_member_created
  AFTER INSERT ON company_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_company_member();

-- Trigger para atualizar permissões quando role muda
CREATE OR REPLACE FUNCTION handle_company_member_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o role mudou, recriar permissões
  IF OLD.role != NEW.role THEN
    PERFORM create_default_permissions(NEW.user_id, NEW.company_id, NEW.role);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_member_role_updated
  AFTER UPDATE ON company_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_company_member_role_change();