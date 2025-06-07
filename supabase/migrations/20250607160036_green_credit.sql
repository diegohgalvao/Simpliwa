/*
  # Corrigir fluxo de criação de empresa

  1. Melhorar trigger de criação de usuário
  2. Adicionar função para processar dados de empresa
  3. Garantir que usuário vire admin automaticamente
*/

-- Função melhorada para processar novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_data jsonb;
  new_company_id uuid;
  profile_created boolean := false;
BEGIN
  -- Log do início do processo
  RAISE LOG 'Processing new user: %', NEW.id;
  
  -- Primeiro, criar o perfil se não existir
  INSERT INTO profiles (id, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Verificar se há dados de empresa nos metadados
  company_data := NEW.raw_user_meta_data->'companyData';
  
  IF company_data IS NOT NULL THEN
    RAISE LOG 'Company data found: %', company_data;
    
    -- Criar empresa com o usuário como admin
    INSERT INTO companies (name, segment, plan, monthly_revenue, employees, status)
    VALUES (
      company_data->>'name',
      company_data->>'segment',
      (company_data->>'plan')::plan_type,
      0,
      1,
      'trial'
    )
    RETURNING id INTO new_company_id;
    
    RAISE LOG 'Created company: %', new_company_id;
    
    -- Adicionar o usuário como admin da empresa
    INSERT INTO company_members (user_id, company_id, role)
    VALUES (NEW.id, new_company_id, 'admin');
    
    RAISE LOG 'Added user as admin of company: %', new_company_id;
    
    -- Atualizar o perfil para admin
    UPDATE profiles 
    SET role = 'admin', updated_at = now()
    WHERE id = NEW.id;
    
    RAISE LOG 'Updated user profile to admin: %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Função para verificar e corrigir usuários existentes sem empresa
CREATE OR REPLACE FUNCTION fix_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record record;
  company_data jsonb;
  new_company_id uuid;
BEGIN
  -- Buscar usuários que têm dados de empresa mas não são membros de nenhuma empresa
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN company_members cm ON cm.user_id = au.id
    WHERE cm.id IS NULL 
    AND au.raw_user_meta_data->'companyData' IS NOT NULL
  LOOP
    company_data := user_record.raw_user_meta_data->'companyData';
    
    IF company_data IS NOT NULL THEN
      RAISE LOG 'Fixing user without company: %', user_record.id;
      
      -- Criar empresa
      INSERT INTO companies (name, segment, plan, monthly_revenue, employees, status)
      VALUES (
        company_data->>'name',
        company_data->>'segment',
        (company_data->>'plan')::plan_type,
        0,
        1,
        'trial'
      )
      RETURNING id INTO new_company_id;
      
      -- Adicionar como admin
      INSERT INTO company_members (user_id, company_id, role)
      VALUES (user_record.id, new_company_id, 'admin');
      
      -- Atualizar perfil
      UPDATE profiles 
      SET role = 'admin', updated_at = now()
      WHERE id = user_record.id;
      
      RAISE LOG 'Fixed user: % with company: %', user_record.id, new_company_id;
    END IF;
  END LOOP;
END;
$$;

-- Executar a correção para usuários existentes
SELECT fix_existing_users();

-- Política para permitir que o trigger funcione
CREATE POLICY "Allow trigger to create companies"
  ON companies
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow trigger to create memberships"
  ON company_members
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Função para debug - verificar status de um usuário
CREATE OR REPLACE FUNCTION debug_user_status(user_email text)
RETURNS table(
  user_id uuid,
  profile_role user_role,
  company_name text,
  member_role user_role,
  company_status company_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    p.role,
    c.name,
    cm.role,
    c.status
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  LEFT JOIN company_members cm ON cm.user_id = au.id
  LEFT JOIN companies c ON c.id = cm.company_id
  WHERE au.email = user_email;
END;
$$;