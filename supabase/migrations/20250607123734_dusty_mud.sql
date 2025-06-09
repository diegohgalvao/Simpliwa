/*
  # Criar Super Admin

  Este arquivo contém diferentes métodos para criar um super admin no sistema.
  Escolha o método mais apropriado para sua situação.
*/

-- MÉTODO 1: Criar super admin diretamente no banco (RECOMENDADO para setup inicial)
-- Substitua 'seu-email@exemplo.com' pelo email real do super admin

-- Primeiro, certifique-se de que o usuário existe na tabela auth.users
-- (isso acontece automaticamente quando o usuário se cadastra)

-- Depois, insira ou atualize o perfil para super_admin
INSERT INTO profiles (id, name, role, avatar_url, created_at, updated_at)
VALUES (
  -- Substitua este UUID pelo ID real do usuário da tabela auth.users
  '00000000-0000-0000-0000-000000000000',
  'Super Administrador',
  'super_admin',
  null,
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'super_admin',
  updated_at = now();

-- MÉTODO 2: Atualizar usuário existente para super admin
-- Use este comando se o usuário já existe no sistema
/*
UPDATE profiles 
SET role = 'super_admin', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'seu-email@exemplo.com'
);
*/

-- MÉTODO 3: Função para promover usuário a super admin
-- Esta função pode ser chamada pelo dashboard ou API
/*
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Se usuário não encontrado, retornar false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Atualizar ou inserir perfil como super_admin
  INSERT INTO profiles (id, name, role, created_at, updated_at)
  VALUES (
    user_id,
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_id), 'Super Admin'),
    'super_admin',
    now(),
    now()
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'super_admin',
    updated_at = now();
    
  RETURN true;
END;
$$;

-- Para usar a função:
-- SELECT promote_to_super_admin('seu-email@exemplo.com');
*/