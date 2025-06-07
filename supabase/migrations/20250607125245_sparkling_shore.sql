/*
  # Fix RLS Policies and Authentication Issues

  1. Security Functions
    - Create SECURITY DEFINER functions to prevent RLS recursion
    - Add helper functions for user access validation

  2. Profile Management
    - Fix profile creation policies
    - Ensure proper RLS for profile operations

  3. Company Access
    - Implement non-recursive company access checks
    - Update all related policies

  4. System Cleanup
    - Remove problematic recursive policies
    - Add proper indexes for performance
*/

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "company_members_own_customers_access" ON customers;
DROP POLICY IF EXISTS "company_members_own_sales_access" ON sales;
DROP POLICY IF EXISTS "company_members_own_messages_access" ON messages;
DROP POLICY IF EXISTS "company_members_own_company_access" ON companies;

-- Create SECURITY DEFINER functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION user_has_company_access(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is a member of the target company
  RETURN EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION user_is_company_admin(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is an admin of the target company
  RETURN EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id 
    AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION user_is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is a super admin
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$;

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_basic" ON profiles;
DROP POLICY IF EXISTS "profiles_super_admin_full_access" ON profiles;

-- Allow users to insert their own profile
CREATE POLICY "users_can_insert_own_profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own basic profile info (but not role)
CREATE POLICY "users_can_update_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (OLD.role = NEW.role OR user_is_super_admin())
  );

-- Super admin can update any profile
CREATE POLICY "super_admin_can_manage_profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (user_is_super_admin())
  WITH CHECK (user_is_super_admin());

-- Fix companies table policies using new functions
CREATE POLICY "users_can_read_own_companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (user_has_company_access(id) OR user_is_super_admin());

CREATE POLICY "admins_can_update_own_companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (user_is_company_admin(id) OR user_is_super_admin())
  WITH CHECK (user_is_company_admin(id) OR user_is_super_admin());

-- Fix customers table policies
CREATE POLICY "users_can_access_company_customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (user_has_company_access(company_id) OR user_is_super_admin())
  WITH CHECK (user_has_company_access(company_id) OR user_is_super_admin());

-- Fix sales table policies
CREATE POLICY "users_can_access_company_sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (user_has_company_access(company_id) OR user_is_super_admin())
  WITH CHECK (user_has_company_access(company_id) OR user_is_super_admin());

-- Fix messages table policies
CREATE POLICY "users_can_access_company_messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (user_has_company_access(company_id) OR user_is_super_admin())
  WITH CHECK (user_has_company_access(company_id) OR user_is_super_admin());

-- Ensure company_members policies are simple and don't cause recursion
DROP POLICY IF EXISTS "company_admins_manage_members" ON company_members;
DROP POLICY IF EXISTS "users_view_own_company_members" ON company_members;

-- Simple policy for viewing company members
CREATE POLICY "users_can_view_company_members"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    user_has_company_access(company_id) OR 
    user_is_super_admin()
  );

-- Policy for inserting company members
CREATE POLICY "users_can_insert_own_membership"
  ON company_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_is_super_admin());

-- Policy for updating company members (admins can manage their company)
CREATE POLICY "admins_can_manage_company_members"
  ON company_members
  FOR UPDATE
  TO authenticated
  USING (user_is_company_admin(company_id) OR user_is_super_admin())
  WITH CHECK (user_is_company_admin(company_id) OR user_is_super_admin());

-- Policy for deleting company members
CREATE POLICY "admins_can_remove_company_members"
  ON company_members
  FOR DELETE
  TO authenticated
  USING (user_is_company_admin(company_id) OR user_is_super_admin());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_members_user_company ON company_members(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_sales_company ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_company ON messages(company_id);

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION user_has_company_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_super_admin() TO authenticated;