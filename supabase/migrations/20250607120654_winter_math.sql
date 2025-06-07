/*
  # Fix Super Admin Creation System

  1. Functions
    - Update create_super_admin function to work with existing auth users only
    - Add better error handling and validation
    - Create helper functions for super admin management

  2. Security
    - Ensure proper validation of existing users
    - Maintain referential integrity with auth.users table
*/

-- Drop existing functions to recreate them with better logic
DROP FUNCTION IF EXISTS create_super_admin(text, text, text);
DROP FUNCTION IF EXISTS promote_to_super_admin(text);
DROP FUNCTION IF EXISTS demote_from_super_admin(text);
DROP FUNCTION IF EXISTS list_super_admins();

-- Function to promote existing user to super admin
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  target_user_name text;
  current_user_role user_role;
  result json;
BEGIN
  -- Check if current user is super admin (allow if no super admins exist yet)
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  -- Allow if current user is super admin OR if no super admins exist yet
  IF current_user_role != 'super_admin' AND EXISTS (SELECT 1 FROM profiles WHERE role = 'super_admin') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Apenas super admins podem promover outros usuários'
    );
  END IF;

  -- Find the target user by email in auth.users
  SELECT id, COALESCE(raw_user_meta_data->>'name', email) 
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
    'message', 'Usuário promovido a super admin com sucesso',
    'email', user_email,
    'user_id', target_user_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Erro ao promover usuário: ' || SQLERRM
  );
END;
$$;

-- Function to demote super admin to regular user
CREATE OR REPLACE FUNCTION demote_from_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  current_user_role user_role;
  super_admin_count integer;
  result json;
BEGIN
  -- Check if current user is super admin
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF current_user_role != 'super_admin' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Apenas super admins podem rebaixar outros usuários'
    );
  END IF;

  -- Count total super admins
  SELECT COUNT(*) INTO super_admin_count
  FROM profiles
  WHERE role = 'super_admin';

  IF super_admin_count <= 1 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Não é possível rebaixar o último super admin do sistema'
    );
  END IF;

  -- Find the target user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Usuário não encontrado com o email: ' || user_email
    );
  END IF;

  -- Prevent self-demotion if it would leave no super admins
  IF target_user_id = auth.uid() AND super_admin_count = 1 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Você não pode rebaixar a si mesmo sendo o último super admin'
    );
  END IF;

  -- Update the user's role to regular user
  UPDATE profiles
  SET role = 'user', updated_at = now()
  WHERE id = target_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Super admin rebaixado para usuário regular com sucesso',
    'email', user_email,
    'user_id', target_user_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Erro ao rebaixar usuário: ' || SQLERRM
  );
END;
$$;

-- Function to list all super admins
CREATE OR REPLACE FUNCTION list_super_admins()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  admins_list json;
BEGIN
  -- Check if current user is super admin (allow if no super admins exist yet)
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  -- Allow if current user is super admin OR if no super admins exist yet
  IF current_user_role != 'super_admin' AND EXISTS (SELECT 1 FROM profiles WHERE role = 'super_admin') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Apenas super admins podem listar outros super admins'
    );
  END IF;

  -- Get all super admins with their details
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name,
      'email', au.email,
      'created_at', p.created_at,
      'last_sign_in_at', au.last_sign_in_at
    )
  ) INTO admins_list
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.role = 'super_admin';

  RETURN json_build_object(
    'success', true,
    'data', COALESCE(admins_list, '[]'::json)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Erro ao listar super admins: ' || SQLERRM
  );
END;
$$;

-- Function to check if any super admin exists
CREATE OR REPLACE FUNCTION has_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE role = 'super_admin');
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION promote_to_super_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_from_super_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION list_super_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION has_super_admin() TO authenticated;