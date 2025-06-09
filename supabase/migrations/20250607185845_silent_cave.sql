/*
  # Fix RLS INSERT policies for profiles and customers

  1. Security Updates
    - Add INSERT policy for profiles table to allow users to create their own profile
    - Add INSERT policy for customers table to allow company members to create customers
    - These policies resolve the RLS violations preventing user registration and customer creation

  2. Changes Made
    - `profiles` table: Allow authenticated users to insert their own profile record
    - `customers` table: Allow company members to insert customers for their companies
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated user to insert their own profile" 
  ON profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Allow company members to insert customers for their companies
CREATE POLICY "Allow company members to insert customers for their company" 
  ON customers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Also add UPDATE and DELETE policies for customers to match the pattern used in other tables
CREATE POLICY "Allow company members to update customers for their company" 
  ON customers 
  FOR UPDATE 
  TO authenticated 
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow company members to delete customers for their company" 
  ON customers 
  FOR DELETE 
  TO authenticated 
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add SELECT policy for customers to allow company members to view their company's customers
CREATE POLICY "Allow company members to view customers for their company" 
  ON customers 
  FOR SELECT 
  TO authenticated 
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    ) OR user_is_super_admin()
  );