/*
  # Fix infinite recursion in company_members RLS policies

  1. Problem
    - The current RLS policy on company_members creates infinite recursion
    - Policy tries to query company_members table from within company_members policy
    - This causes a circular dependency when evaluating access rules

  2. Solution
    - Remove the problematic policy that causes recursion
    - Simplify policies to use direct auth.uid() checks
    - Ensure policies don't create circular dependencies between tables

  3. Changes
    - Drop existing problematic policies on company_members
    - Create new simplified policies that avoid recursion
    - Maintain security while preventing circular queries
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Company admins can view company memberships" ON company_members;
DROP POLICY IF EXISTS "Super admins can view all memberships" ON company_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON company_members;

-- Create new simplified policies without recursion
CREATE POLICY "Users can view their own memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships"
  ON company_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Super admins can view all memberships (using direct profile check)
CREATE POLICY "Super admins can view all memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
    )
  );

-- Super admins can manage all memberships
CREATE POLICY "Super admins can manage all memberships"
  ON company_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
    )
  );