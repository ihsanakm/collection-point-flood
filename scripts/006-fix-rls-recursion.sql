-- Fix RLS Infinite Recursion
-- This script creates a secure function to check admin status and updates policies to use it.

-- 1. Create a SECURITY DEFINER function to check if a user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/superuser)
-- This bypasses RLS on the admin_users table itself when called, breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Policies for 'collection_points'
DROP POLICY IF EXISTS "Admins can manage all collection points" ON collection_points;

CREATE POLICY "Admins can manage all collection points" ON collection_points
  FOR ALL USING (
    is_admin()
  );

-- 3. Update Policies for 'item_categories'
DROP POLICY IF EXISTS "Admins can manage item categories" ON item_categories;

CREATE POLICY "Admins can manage item categories" ON item_categories
  FOR ALL USING (
    is_admin()
  );

-- 4. Update Policies for 'reports'
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;

CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (
    is_admin()
  );

-- 5. Update Policies for 'admin_users'
-- We also need to fix the policies on the admin_users table itself
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Admins can view other admins
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    is_admin()
  );

-- Only super admins can manage admin users
-- We can't easily make a "is_super_admin" helper without another lookup, 
-- but since we already broke the recursion with is_admin() for the SELECT,
-- we can be careful here. 
-- However, for safety, let's create a helper for this too.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    is_super_admin()
  );
