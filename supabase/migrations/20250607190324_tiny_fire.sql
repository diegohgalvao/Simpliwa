/*
  # Fix profiles table RLS policies

  1. Security Updates
    - Drop existing conflicting INSERT policies on profiles table
    - Create comprehensive RLS policies for profiles table
    - Allow authenticated users to insert their own profile
    - Allow users to read their own profile
    - Allow users to update their own profile
    - Allow super admins full access to all profiles

  2. Policy Details
    - INSERT: Users can only create profiles for themselves (auth.uid() = id)
    - SELECT: Users can read their own profile, super admins can read all
    - UPDATE: Users can update their own profile, super admins can update all
    - DELETE: Only super admins can delete profiles
*/

-- Drop existing INSERT policies that might be conflicting
DROP POLICY IF EXISTS "Allow authenticated user to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR user_is_super_admin());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR user_is_super_admin())
  WITH CHECK (auth.uid() = id OR user_is_super_admin());

CREATE POLICY "Super admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (user_is_super_admin());

-- Ensure the user_is_super_admin function exists and works correctly
CREATE OR REPLACE FUNCTION user_is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'::user_role
  );
$$;