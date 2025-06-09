/*
  # Fix profiles table RLS policy for user creation

  1. Security Changes
    - Drop the existing restrictive INSERT policy on profiles table
    - Create a new INSERT policy that allows authenticated users to create their own profile
    - Ensure users can only insert profiles where the id matches their auth.uid()

  2. Changes Made
    - Remove existing INSERT policy that was preventing profile creation
    - Add new policy "Allow authenticated users to insert their own profile"
    - Policy allows INSERT for authenticated users with CHECK (auth.uid() = id)
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Create a new INSERT policy that allows authenticated users to create their own profile
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);