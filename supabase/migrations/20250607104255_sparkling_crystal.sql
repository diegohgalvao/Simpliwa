/*
  # Fix authentication and RLS policies

  1. Security Changes
    - Remove problematic recursive policies on profiles table
    - Create simple, non-recursive policies for profile access
    - Ensure proper RLS without infinite loops

  2. Policy Structure
    - Allow users to read/update their own profiles
    - Allow authenticated users to read profiles for company operations
    - Remove super admin recursive policies that cause loops
*/

-- Drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles for company operations" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile with role restrictions" ON profiles;

-- Create simple, non-recursive policies
-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow reading profiles for company operations (non-recursive)
-- This allows authenticated users to read other profiles for company member lookups
CREATE POLICY "Allow profile reads for company operations"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;