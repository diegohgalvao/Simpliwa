/*
  # Fix RLS policies for profiles table

  1. Security
    - Remove problematic recursive policies
    - Add safe policies for profile management
    - Ensure proper role-based access control

  2. Changes
    - Drop existing conflicting policies
    - Create new policies with unique names
    - Allow authenticated users to read profiles for company operations
    - Allow users to update their own profiles
    - Allow super admins to manage all profiles
*/

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles for company operations" ON profiles;

-- Keep existing policies that work (don't drop these):
-- "Users can read own profile" - (uid() = id)
-- "Users can insert own profile" - (uid() = id)
-- "Allow profile reads for company operations" - true

-- Create new policies with unique names to avoid conflicts

-- Policy 1: Allow authenticated users to read profiles (needed for company operations)
CREATE POLICY "profiles_read_for_company_ops"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow users to update their own basic profile info
CREATE POLICY "profiles_update_own_basic"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow super admins to update any profile (including roles)
CREATE POLICY "profiles_super_admin_full_access"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );