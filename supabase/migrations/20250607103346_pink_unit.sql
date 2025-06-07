/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The existing "Super admins can view all profiles" policy creates infinite recursion
    - It queries the profiles table from within a profiles table policy
    - This causes the "infinite recursion detected in policy" error

  2. Solution
    - Remove the recursive policies that reference profiles table within profiles policies
    - Create simpler policies that avoid recursion
    - Use auth.uid() instead of uid() function
    - Allow authenticated users to read profiles (needed for app functionality)
    - Maintain security by restricting role changes

  3. Changes
    - Drop problematic recursive policies
    - Add non-recursive policy for reading profiles
    - Add secure policy for profile updates with role protection
*/

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;

-- Keep existing user policies (these work fine):
-- "Users can view their own profile" - (auth.uid() = id)
-- "Users can update their own profile" - (auth.uid() = id) 
-- "Users can insert their own profile" - (auth.uid() = id)

-- Add a policy that allows reading profiles for authenticated users
-- This is needed for the application to function properly (company operations, etc.)
CREATE POLICY "Authenticated users can read profiles for company operations"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Replace the existing update policy with one that has role protection
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update own profile with role restrictions"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (
      -- Prevent role escalation: users can only keep their current role
      -- or change it if they're already a super_admin
      OLD.role = NEW.role OR
      OLD.role = 'super_admin'
    )
  );