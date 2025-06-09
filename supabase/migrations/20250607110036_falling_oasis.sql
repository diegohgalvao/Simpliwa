/*
  # Fix infinite recursion in company_members RLS policies

  1. Problem
    - The "Company admins can view their company memberships" policy creates infinite recursion
    - It queries company_members table from within a policy on the same table
    
  2. Solution
    - Drop the problematic policy
    - Create simpler, non-recursive policies
    - Users can view their own memberships (no recursion)
    - Super admins can view all memberships (using profiles table check)
    
  3. Security
    - Maintains proper access control without recursion
    - Users see only their own memberships
    - Super admins see all memberships
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Company admins can view their company memberships" ON company_members;

-- Create a simple policy for users to view their own memberships
-- This policy already exists but we'll recreate it to be sure
DROP POLICY IF EXISTS "Users can view their own memberships" ON company_members;
CREATE POLICY "Users can view their own memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Keep the super admin policy as it doesn't cause recursion
-- (it only checks the profiles table, not company_members)
-- This policy should already exist, but we'll ensure it's correct
DROP POLICY IF EXISTS "Super admins can view all memberships" ON company_members;
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

-- For company operations, we'll need to handle admin access differently
-- We can create a function to check if a user is an admin of a specific company
-- without causing recursion by using a direct query approach
CREATE OR REPLACE FUNCTION is_company_admin(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
    AND company_id = company_uuid
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Now create a policy for company admins that uses the function
-- This avoids recursion by using a function call instead of a subquery
CREATE POLICY "Company admins can view company memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (is_company_admin(company_id));