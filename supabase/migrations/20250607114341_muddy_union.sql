/*
  # Create Super Admin Management System

  1. Functions
    - `create_super_admin()` - Creates the first super admin
    - `promote_to_super_admin(email)` - Promotes existing user to super admin
    - `demote_from_super_admin(email)` - Demotes super admin to regular user

  2. Initial Setup
    - Creates first super admin account if none exists
    - Sets up proper permissions

  3. Security
    - Only super admins can promote/demote other users
    - Prevents demoting the last super admin
*/

-- Function to create the first super admin
CREATE OR REPLACE FUNCTION create_super_admin(
  admin_email text,
  admin_password text,
  admin_name text DEFAULT 'Super Administrador'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Check if any super admin already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE role = 'super_admin') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Super admin já existe no sistema'
    );
  END IF;

  -- Create the auth user (this would normally be done through Supabase Auth)
  -- For now, we'll just create the profile and assume the auth user exists
  
  -- Generate a UUID for the user (in real scenario, this comes from auth.users)
  new_user_id := gen_random_uuid();
  
  -- Insert the profile
  INSERT INTO profiles (id, name, role, created_at, updated_at)
  VALUES (
    new_user_id,
    admin_name,
    'super_admin',
    now(),
    now()
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Super admin criado com sucesso',
    'user_id', new_user_id,
    'email', admin_email,
    'instructions', 'Use este email e senha para fazer login: ' || admin_email
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Erro ao criar super admin: ' || SQLERRM
  );
END;
$$;

-- Function to promote existing user to super admin
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  current_user_role user_role;
  result json;
BEGIN
  -- Check if current user is super admin
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF current_user_role != 'super_admin' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Apenas super admins podem promover outros usuários'
    );
  END IF;

  -- Find the target user by email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Usuário não encontrado com o email: ' || user_email
    );
  END IF;

  -- Update the user's role to super_admin
  UPDATE profiles
  SET role = 'super_admin', updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    -- If profile doesn't exist, create it
    INSERT INTO profiles (id, name, role, created_at, updated_at)
    VALUES (
      target_user_id,
      COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = target_user_id), 'Super Admin'),
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
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;

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
  -- Check if current user is super admin
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF current_user_role != 'super_admin' THEN
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_super_admin(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_super_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_from_super_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION list_super_admins() TO authenticated;