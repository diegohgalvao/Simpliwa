-- Allow company members to read sales for their company
CREATE POLICY "company_members_can_read_sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = auth.uid()
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
      WHERE company_members.user_id = auth.uid()
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
      WHERE company_members.user_id = auth.uid()
        AND company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role])
    ) OR user_is_super_admin()
  )
  WITH CHECK (
    company_id IN (
      SELECT company_members.company_id
      FROM company_members
      WHERE company_members.user_id = auth.uid()
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
      WHERE company_members.user_id = auth.uid()
        AND company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role])
    ) OR user_is_super_admin()
  );