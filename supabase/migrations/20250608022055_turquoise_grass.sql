/*
  # Add RLS policies for sales table

  1. Security
    - Add policy for company members to read sales for their company
    - Add policy for company members to insert sales for their company  
    - Add policy for company admins/managers to update sales for their company
    - Add policy for company admins/managers to delete sales for their company

  2. Changes
    - Enable company members to view sales for companies they belong to
    - Enable company members to create new sales for companies they belong to
    - Enable company admins and managers to update and delete sales for their companies
*/

-- Allow company members to read sales for their company
CREATE POLICY "company_members_can_read_sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = uid()
    ) OR user_is_super_admin()
  );

-- Allow company members to insert sales for their company
CREATE POLICY "company_members_can_insert_sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = uid()
    ) OR user_is_super_admin()
  );

-- Allow company admins and managers to update sales for their company
CREATE POLICY "company_admins_can_update_sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = uid()
        AND company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role])
    ) OR user_is_super_admin()
  )
  WITH CHECK (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = uid()
        AND company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role])
    ) OR user_is_super_admin()
  );

-- Allow company admins and managers to delete sales for their company
CREATE POLICY "company_admins_can_delete_sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = uid()
        AND company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role])
    ) OR user_is_super_admin()
  );