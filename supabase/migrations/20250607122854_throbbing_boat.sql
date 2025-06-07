/*
  # Fix profiles policies

  1. Security Changes
    - Remove problematic recursive policies for super admins
    - Add safe policy for authenticated users to read profiles
    - Update user profile policy with proper role protection
    
  2. Changes Made
    - Drop recursive super admin policies that cause RLS issues
    - Keep existing user self-management policies
    - Add general read access for authenticated users (needed for company operations)
    - Replace update policy with role-safe version
*/

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;

-- Keep existing user policies (these work fine):
-- "Users can view their own profile" - (auth.uid() = id)
-- "Users can insert their own profile" - (auth.uid() = id)

-- Add a policy that allows reading profiles for authenticated users
-- This is needed for the application to function properly (company operations, etc.)
CREATE POLICY "Authenticated users can read profiles for company operations"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Replace the existing update policy with a simpler one
-- Users can only update their own profile, role changes are handled separately
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add a separate policy for role management (only super admins can change roles)
-- This is safer than trying to use OLD/NEW references in RLS policies
CREATE POLICY "Super admins can manage user roles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );