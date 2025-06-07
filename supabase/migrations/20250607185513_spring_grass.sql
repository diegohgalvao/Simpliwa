/*
  # Add RLS policies for products table

  1. Security Policies
    - Allow company members to read products from their company
    - Allow company admins/managers to insert products for their company
    - Allow company admins/managers to update products from their company
    - Allow company admins/managers to delete products from their company
    - Allow super admins full access to all products

  2. Changes
    - Add SELECT policy for company members and super admins
    - Add INSERT policy for company admins/managers and super admins
    - Add UPDATE policy for company admins/managers and super admins
    - Add DELETE policy for company admins/managers and super admins
*/

-- Allow users to read products from companies they have access to
CREATE POLICY "users_can_read_company_products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    user_has_company_access(company_id) OR user_is_super_admin()
  );

-- Allow company admins/managers to insert products for their company
CREATE POLICY "company_admins_can_insert_products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    ) OR user_is_super_admin()
  );

-- Allow company admins/managers to update products from their company
CREATE POLICY "company_admins_can_update_products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    ) OR user_is_super_admin()
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    ) OR user_is_super_admin()
  );

-- Allow company admins/managers to delete products from their company
CREATE POLICY "company_admins_can_delete_products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    ) OR user_is_super_admin()
  );

-- Allow super admins full access to all products
CREATE POLICY "super_admin_full_products_access"
  ON products
  FOR ALL
  TO authenticated
  USING (user_is_super_admin())
  WITH CHECK (user_is_super_admin());