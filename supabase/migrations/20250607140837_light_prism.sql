/*
  # Fluxo de criação de empresa com admin

  1. Função para criar empresa com admin
  2. Trigger para processar dados de empresa no signup
  3. Políticas atualizadas para suportar criação de empresa
*/

-- Função para criar empresa e definir usuário como admin
CREATE OR REPLACE FUNCTION create_company_with_admin(
  user_id_param uuid,
  company_name text,
  company_segment text,
  company_plan plan_type DEFAULT 'starter'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id uuid;
BEGIN
  -- Criar a empresa
  INSERT INTO companies (name, segment, plan, monthly_revenue, employees, status)
  VALUES (company_name, company_segment, company_plan, 0, 1, 'trial')
  RETURNING id INTO new_company_id;

  -- Adicionar o usuário como admin da empresa
  INSERT INTO company_members (user_id, company_id, role)
  VALUES (user_id_param, new_company_id, 'admin');

  -- Criar permissões padrão para o admin (admin tem todas as permissões por padrão)
  -- Não precisa criar registros específicos pois admin tem acesso total

  RETURN new_company_id;
END;
$$;

-- Função para processar dados de empresa após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_data jsonb;
  new_company_id uuid;
BEGIN
  -- Verificar se há dados de empresa nos metadados
  company_data := NEW.raw_user_meta_data->'companyData';
  
  IF company_data IS NOT NULL THEN
    -- Criar empresa com o usuário como admin
    SELECT create_company_with_admin(
      NEW.id,
      company_data->>'name',
      company_data->>'segment',
      (company_data->>'plan')::plan_type
    ) INTO new_company_id;
    
    -- Log da criação
    RAISE LOG 'Created company % for user %', new_company_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para processar novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Atualizar política para permitir que usuários criem empresas
CREATE POLICY "Users can create companies during signup"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Permitir criação durante signup

-- Política para permitir que usuários se adicionem como membros durante signup
CREATE POLICY "Users can add themselves as company members"
  ON company_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Função para verificar se usuário pode criar empresa
CREATE OR REPLACE FUNCTION user_can_create_company()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário não é membro de nenhuma empresa ainda
  -- ou se é super admin
  RETURN NOT EXISTS (
    SELECT 1 FROM company_members 
    WHERE user_id = auth.uid()
  ) OR user_is_super_admin();
END;
$$;

-- Política mais restritiva para criação de empresas (após signup)
DROP POLICY IF EXISTS "Users can create companies during signup" ON companies;
CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (user_can_create_company());