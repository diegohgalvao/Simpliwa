/*
  # Fix profiles RLS policies

  This migration fixes the infinite recursion issue in profiles policies by:
  1. Removing recursive super admin policies
  2. Adding a simple read policy for authenticated users
  3. Keeping user self-management policies
  4. Removing role protection (will be handled in application logic)

  ## Changes
  - Drop problematic recursive policies
  - Add authenticated read access
  - Simplify update policies
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

-- Keep the existing update policy simple - role protection will be handled in application logic
-- The existing "Users can update their own profile" policy should work fine
-- If it doesn't exist, create it
DO $$
BEGIN
  -- Check if the policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;