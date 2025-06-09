/*
  # Fix Function Dependencies Migration

  This migration recreates all the helper functions and triggers while properly handling
  all dependent RLS policies that need to be dropped and recreated.

  1. Drop all dependent RLS policies first
  2. Drop and recreate all functions
  3. Recreate all RLS policies
  4. Set up triggers and permissions
*/

-- First, drop ALL dependent RLS policies across all tables
-- Companies table policies
DROP POLICY IF EXISTS "users_can_read_own_companies" ON companies;
DROP POLICY IF EXISTS "company_admins_can_update" ON companies;
DROP POLICY IF EXISTS "super_admin_full_companies_access" ON companies;
DROP POLICY IF EXISTS "Allow trigger to create companies" ON companies;

-- Company members table policies
DROP POLICY IF EXISTS "users_can_view_company_members" ON company_members;
DROP POLICY IF EXISTS "Super admins can manage all memberships" ON company_members;
DROP POLICY IF EXISTS "Super admins can view all memberships" ON company_members;
DROP POLICY IF EXISTS "Users can add themselves as company members" ON company_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON company_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON company_members;
DROP POLICY IF EXISTS "super_admin_full_members_access" ON company_members;
DROP POLICY IF EXISTS "users_insert_own_memberships" ON company_members;
DROP POLICY IF EXISTS "Allow trigger to create memberships" ON company_members;

-- Products table policies
DROP POLICY IF EXISTS "users_can_read_company_products" ON products;
DROP POLICY IF EXISTS "company_admins_can_insert_products" ON products;
DROP POLICY IF EXISTS "company_admins_can_update_products" ON products;
DROP POLICY IF EXISTS "company_admins_can_delete_products" ON products;
DROP POLICY IF EXISTS "super_admin_full_products_access" ON products;

-- Profiles table policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Customers table policies
DROP POLICY IF EXISTS "Allow company members to view customers for their company" ON customers;
DROP POLICY IF EXISTS "Allow company members to insert customers for their company" ON customers;
DROP POLICY IF EXISTS "Allow company members to update customers for their company" ON customers;
DROP POLICY IF EXISTS "Allow company members to delete customers for their company" ON customers;
DROP POLICY IF EXISTS "super_admin_full_customers_access" ON customers;

-- Sales table policies
DROP POLICY IF EXISTS "super_admin_full_sales_access" ON sales;

-- Messages table policies
DROP POLICY IF EXISTS "super_admin_full_messages_access" ON messages;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS public.user_has_company_access(uuid);
DROP FUNCTION IF EXISTS public.user_is_company_admin(uuid);
DROP FUNCTION IF EXISTS public.user_is_super_admin();
DROP FUNCTION IF EXISTS public.user_can_create_company();
DROP FUNCTION IF EXISTS public.user_has_permission(uuid, text, text);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_company_member();
DROP FUNCTION IF EXISTS public.handle_company_member_role_change();
DROP FUNCTION IF EXISTS public.prevent_super_admin_company_membership();

-- Create helper functions for RLS policies first
CREATE OR REPLACE FUNCTION public.user_has_company_access(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE user_id = auth.uid() AND company_members.company_id = user_has_company_access.company_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_is_company_admin(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND company_members.company_id = user_is_company_admin.company_id 
    AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_can_create_company()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Users can create companies if they don't already have one or are super admin
  RETURN NOT EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE user_id = auth.uid()
  ) OR user_is_super_admin();
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_permission(company_id uuid, permission_type text, action text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins have all permissions
  IF user_is_super_admin() THEN
    RETURN true;
  END IF;

  -- Check specific permission
  RETURN EXISTS (
    SELECT 1 FROM public.user_permissions up
    WHERE up.user_id = auth.uid() 
    AND up.company_id = user_has_permission.company_id
    AND up.permission_type = user_has_permission.permission_type
    AND (
      (action = 'read' AND up.can_read = true) OR
      (action = 'write' AND up.can_write = true) OR
      (action = 'delete' AND up.can_delete = true)
    )
  );
END;
$$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_data jsonb;
  new_company_id uuid;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );

  -- Check if there's company data in user metadata
  company_data := NEW.raw_user_meta_data->'companyData';
  
  IF company_data IS NOT NULL THEN
    -- Create the company
    INSERT INTO public.companies (name, segment, plan, monthly_revenue, employees, status)
    VALUES (
      company_data->>'name',
      company_data->>'segment',
      (company_data->>'plan')::plan_type,
      0,
      1,
      'trial'
    )
    RETURNING id INTO new_company_id;

    -- Add user as admin of the company
    INSERT INTO public.company_members (user_id, company_id, role)
    VALUES (NEW.id, new_company_id, 'admin');

    -- Update user profile to admin role
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the handle_new_company_member function
CREATE OR REPLACE FUNCTION public.handle_new_company_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default permissions for the new company member
  INSERT INTO public.user_permissions (user_id, company_id, permission_type, can_read, can_write, can_delete)
  VALUES 
    (NEW.user_id, NEW.company_id, 'products', true, CASE WHEN NEW.role IN ('admin', 'manager') THEN true ELSE false END, CASE WHEN NEW.role = 'admin' THEN true ELSE false END),
    (NEW.user_id, NEW.company_id, 'customers', true, CASE WHEN NEW.role IN ('admin', 'manager', 'operator') THEN true ELSE false END, CASE WHEN NEW.role = 'admin' THEN true ELSE false END),
    (NEW.user_id, NEW.company_id, 'sales', true, CASE WHEN NEW.role IN ('admin', 'manager', 'operator') THEN true ELSE false END, CASE WHEN NEW.role = 'admin' THEN true ELSE false END),
    (NEW.user_id, NEW.company_id, 'messages', true, CASE WHEN NEW.role IN ('admin', 'manager', 'operator') THEN true ELSE false END, false)
  ON CONFLICT (user_id, company_id, permission_type) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the member creation
    RAISE LOG 'Error in handle_new_company_member: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the handle_company_member_role_change function
CREATE OR REPLACE FUNCTION public.handle_company_member_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Update permissions based on new role
    UPDATE public.user_permissions 
    SET 
      can_write = CASE WHEN NEW.role IN ('admin', 'manager') THEN true ELSE false END,
      can_delete = CASE WHEN NEW.role = 'admin' THEN true ELSE false END,
      updated_at = now()
    WHERE user_id = NEW.user_id AND company_id = NEW.company_id AND permission_type = 'products';

    UPDATE public.user_permissions 
    SET 
      can_write = CASE WHEN NEW.role IN ('admin', 'manager', 'operator') THEN true ELSE false END,
      can_delete = CASE WHEN NEW.role = 'admin' THEN true ELSE false END,
      updated_at = now()
    WHERE user_id = NEW.user_id AND company_id = NEW.company_id AND permission_type IN ('customers', 'sales');

    -- Update profile role if user becomes admin
    IF NEW.role = 'admin' THEN
      UPDATE public.profiles 
      SET role = 'admin', updated_at = now()
      WHERE id = NEW.user_id;
    ELSIF OLD.role = 'admin' AND NEW.role != 'admin' THEN
      -- Check if user is admin of any other company
      IF NOT EXISTS (
        SELECT 1 FROM public.company_members 
        WHERE user_id = NEW.user_id AND role = 'admin' AND id != NEW.id
      ) THEN
        UPDATE public.profiles 
        SET role = 'user', updated_at = now()
        WHERE id = NEW.user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the update
    RAISE LOG 'Error in handle_company_member_role_change: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the prevent_super_admin_company_membership function
CREATE OR REPLACE FUNCTION public.prevent_super_admin_company_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user is a super admin
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.user_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Super admins cannot be members of specific companies';
  END IF;

  RETURN NEW;
END;
$$;

-- Now recreate ALL the RLS policies that depend on these functions

-- Companies table policies
CREATE POLICY "users_can_read_own_companies" ON companies
  FOR SELECT TO authenticated
  USING (user_has_company_access(id) OR user_is_super_admin());

CREATE POLICY "company_admins_can_update" ON companies
  FOR UPDATE TO authenticated
  USING (id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = 'admin'::user_role))))
  WITH CHECK (id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = 'admin'::user_role))));

CREATE POLICY "super_admin_full_companies_access" ON companies
  FOR ALL TO authenticated
  USING (user_is_super_admin())
  WITH CHECK (user_is_super_admin());

CREATE POLICY "Allow trigger to create companies" ON companies
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Company members table policies
CREATE POLICY "users_can_view_company_members" ON company_members
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR user_has_company_access(company_id) OR user_is_super_admin());

CREATE POLICY "Super admins can manage all memberships" ON company_members
  FOR ALL TO authenticated
  USING (user_is_super_admin());

CREATE POLICY "Super admins can view all memberships" ON company_members
  FOR SELECT TO authenticated
  USING (user_is_super_admin());

CREATE POLICY "Users can add themselves as company members" ON company_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships" ON company_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own memberships" ON company_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "super_admin_full_members_access" ON company_members
  FOR ALL TO authenticated
  USING (user_is_super_admin());

CREATE POLICY "users_insert_own_memberships" ON company_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow trigger to create memberships" ON company_members
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Products table policies
CREATE POLICY "users_can_read_company_products" ON products
  FOR SELECT TO authenticated
  USING (user_has_company_access(company_id) OR user_is_super_admin());

CREATE POLICY "company_admins_can_insert_products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))) OR user_is_super_admin()));

CREATE POLICY "company_admins_can_update_products" ON products
  FOR UPDATE TO authenticated
  USING (((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))) OR user_is_super_admin()))
  WITH CHECK (((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))) OR user_is_super_admin()));

CREATE POLICY "company_admins_can_delete_products" ON products
  FOR DELETE TO authenticated
  USING (((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))) OR user_is_super_admin()));

CREATE POLICY "super_admin_full_products_access" ON products
  FOR ALL TO authenticated
  USING (user_is_super_admin())
  WITH CHECK (user_is_super_admin());

-- Profiles table policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING ((auth.uid() = id) OR user_is_super_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING ((auth.uid() = id) OR user_is_super_admin())
  WITH CHECK ((auth.uid() = id) OR user_is_super_admin());

CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE TO authenticated
  USING (user_is_super_admin());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Customers table policies
CREATE POLICY "Allow company members to view customers for their company" ON customers
  FOR SELECT TO authenticated
  USING (((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE (company_members.user_id = auth.uid()))) OR user_is_super_admin()));

CREATE POLICY "Allow company members to insert customers for their company" ON customers
  FOR INSERT TO authenticated
  WITH CHECK ((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE (company_members.user_id = auth.uid()))));

CREATE POLICY "Allow company members to update customers for their company" ON customers
  FOR UPDATE TO authenticated
  USING ((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE (company_members.user_id = auth.uid()))))
  WITH CHECK ((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE (company_members.user_id = auth.uid()))));

CREATE POLICY "Allow company members to delete customers for their company" ON customers
  FOR DELETE TO authenticated
  USING ((company_id IN ( SELECT company_members.company_id
   FROM company_members
  WHERE (company_members.user_id = auth.uid()))));

CREATE POLICY "super_admin_full_customers_access" ON customers
  FOR ALL TO authenticated
  USING (user_is_super_admin());

-- Sales table policies
CREATE POLICY "super_admin_full_sales_access" ON sales
  FOR ALL TO authenticated
  USING (user_is_super_admin());

-- Messages table policies
CREATE POLICY "super_admin_full_messages_access" ON messages
  FOR ALL TO authenticated
  USING (user_is_super_admin());

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_company_member() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_company_member_role_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_super_admin_company_membership() TO service_role;

-- Grant permissions to helper functions
GRANT EXECUTE ON FUNCTION public.user_has_company_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_create_company() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text) TO authenticated;