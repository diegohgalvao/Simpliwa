/*
  # Configuração de Super Admin

  Esta migração cria funções utilitárias para gerenciar super admins de forma segura.
  
  ## Como usar após aplicar a migração:
  
  1. Primeiro, cadastre o usuário normalmente via interface do SimpliWa
  2. Depois, execute no SQL Editor do Supabase:
     SELECT promote_to_super_admin('email@do-admin.com');
  
  ## Ou via Dashboard Supabase:
  
  1. Vá em Authentication > Users
  2. Copie o User UID
  3. Vá em Table Editor > profiles
  4. Edite o registro e mude role para 'super_admin'
*/

-- Função para promover usuário existente a super admin
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  user_name text;
  result json;
BEGIN
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
    'message', 'Usuário promovido a super admin com sucesso!',
    'user_id', user_id,
    'email', user_email,
    'name', user_name
  );
  
  RETURN result;
END;
$$;

-- Função para listar todos os super admins
CREATE OR REPLACE FUNCTION list_super_admins()
RETURNS table(
  user_id uuid,
  name text,
  email text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    u.email,
    p.created_at,
    p.updated_at
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.role = 'super_admin'
  ORDER BY p.created_at;
END;
$$;

-- Função para remover privilégios de super admin (downgrade para admin)
CREATE OR REPLACE FUNCTION demote_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Se usuário não encontrado, retornar erro
  IF user_id IS NULL THEN
    result := json_build_object(
      'success', false,
      'message', 'Usuário não encontrado com email: ' || user_email
    );
    RETURN result;
  END IF;
  
  -- Atualizar role para admin
  UPDATE profiles 
  SET role = 'admin', updated_at = now()
  WHERE id = user_id AND role = 'super_admin';
  
  -- Verificar se a atualização foi feita
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'message', 'Usuário não é super admin ou não possui perfil'
    );
    RETURN result;
  END IF;
    
  result := json_build_object(
    'success', true,
    'message', 'Super admin rebaixado para admin com sucesso!',
    'user_id', user_id,
    'email', user_email
  );
  
  RETURN result;
END;
$$;

-- Comentários com instruções de uso
COMMENT ON FUNCTION promote_to_super_admin(text) IS 'Promove um usuário existente para super admin. Uso: SELECT promote_to_super_admin(''email@exemplo.com'');';
COMMENT ON FUNCTION list_super_admins() IS 'Lista todos os super admins do sistema. Uso: SELECT * FROM list_super_admins();';
COMMENT ON FUNCTION demote_super_admin(text) IS 'Remove privilégios de super admin (rebaixa para admin). Uso: SELECT demote_super_admin(''email@exemplo.com'');';