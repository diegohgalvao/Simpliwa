/*
  # Simple Super Admin Creation

  1. Functions
    - `create_first_super_admin(email)` - Promove um usuário existente a super admin
    - `check_super_admin_status()` - Verifica se já existe um super admin

  2. Security
    - Apenas permite criar 1 super admin
    - Usuário deve existir na base antes de ser promovido
    - Função segura que não permite múltiplos super admins
*/

-- Drop existing complex functions
DROP FUNCTION IF EXISTS create_super_admin(text, text, text);
DROP FUNCTION IF EXISTS promote_to_super_admin(text);
DROP FUNCTION IF EXISTS demote_from_super_admin(text);
DROP FUNCTION IF EXISTS list_super_admins();
DROP FUNCTION IF EXISTS has_super_admin();

-- Simple function to create the first (and only) super admin
CREATE OR REPLACE FUNCTION create_first_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  target_user_name text;
  result json;
BEGIN
  -- Check if any super admin already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE role = 'super_admin') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Já existe um super admin no sistema'
    );
  END IF;

  -- Find the target user by email in auth.users
  SELECT id, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
  INTO target_user_id, target_user_name
  FROM auth.users 
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Usuário não encontrado. O usuário deve primeiro se cadastrar no sistema.'
    );
  END IF;

  -- Check if user already has a profile
  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
    -- Update existing profile
    UPDATE profiles
    SET role = 'super_admin', updated_at = now()
    WHERE id = target_user_id;
  ELSE
    -- Create new profile
    INSERT INTO profiles (id, name, role, created_at, updated_at)
    VALUES (
      target_user_id,
      target_user_name,
      'super_admin',
      now(),
      now()
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Super admin criado com sucesso! Agora você pode fazer login com este email.',
    'email', user_email,
    'user_id', target_user_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Erro ao criar super admin: ' || SQLERRM
  );
END;
$$;

-- Function to check super admin status
CREATE OR REPLACE FUNCTION check_super_admin_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
  admin_email text;
BEGIN
  SELECT COUNT(*), MAX(au.email)
  INTO admin_count, admin_email
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.role = 'super_admin';

  RETURN json_build_object(
    'has_super_admin', admin_count > 0,
    'admin_count', admin_count,
    'admin_email', CASE WHEN admin_count > 0 THEN admin_email ELSE null END
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_first_super_admin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_super_admin_status() TO anon, authenticated;