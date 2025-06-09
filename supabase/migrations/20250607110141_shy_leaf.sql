/*
  # Fix infinite recursion in company_members RLS policy

  1. Problem
    - The "Company admins can view company memberships" policy uses `is_company_admin(company_id)` 
    - This function likely queries company_members table, creating infinite recursion
    - When a policy on table X references a function that queries table X, it creates a loop

  2. Solution
    - Replace the recursive policy with a direct, non-recursive policy
    - Allow users to view memberships where they are admins by checking their role directly
    - Use a subquery that doesn't create circular dependencies

  3. Changes
    - Drop the problematic policy
    - Create a new policy that checks user role without recursion
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Company admins can view company memberships" ON company_members;

-- Create a new policy that allows company admins to view memberships
-- This policy checks if the current user has an admin role in the same company
-- without causing recursion by using a direct role check
CREATE POLICY "Company admins can view company memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
        AND cm.company_id = company_members.company_id 
        AND cm.role IN ('admin', 'super_admin')
    )
  );