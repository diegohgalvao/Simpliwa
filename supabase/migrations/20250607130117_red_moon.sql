/*
  # Fix profiles table RLS policies

  1. Security Updates
    - Remove conflicting/duplicate policies on profiles table
    - Add proper policies for authenticated users to manage their own profiles
    - Ensure super admins can manage all profiles
    - Allow profile creation during user registration

  2. Policy Changes
    - Clean up existing policies that may be causing conflicts
    - Add clear, non-conflicting policies for CRUD operations
    - Maintain super admin access while allowing user self-management
*/

-- First, drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow profile reads for company operations" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_read_for_company_ops" ON profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "super_admin_can_manage_profiles" ON profiles;

-- Create clean, non-conflicting policies
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR user_is_super_admin());

CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR user_is_super_admin());

CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR user_is_super_admin())
  WITH CHECK (auth.uid() = id OR user_is_super_admin());

CREATE POLICY "profiles_delete_super_admin_only"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (user_is_super_admin());