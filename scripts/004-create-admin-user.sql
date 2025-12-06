-- Note: First create a user in Supabase Auth, then run this script
-- The admin user needs to sign up through the app first

-- For testing purposes, we'll insert a placeholder admin
-- You should replace the ID with an actual Supabase Auth user ID after signing up

-- Create an admin user (replace the UUID with actual auth user ID)
-- To get a real admin:
-- 1. Go to /admin/login and sign up with email/password
-- 2. Get the user ID from Supabase Auth dashboard
-- 3. Update this record or insert a new one

INSERT INTO admin_users (id, display_name, role)
VALUES 
  -- This is a placeholder UUID - replace with real auth user ID
  ('6dfa8fc4-087b-4259-8881-335420cce44f', 'Super Admin', 'super_admin'),
  ('02695a9e-2379-4917-b4fb-83ac3fdb3a24', 'Test Moderator', 'moderator')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;

-- To make yourself an admin after signing up:
-- UPDATE admin_users SET id = 'YOUR_ACTUAL_AUTH_USER_ID' WHERE id = '00000000-0000-0000-0000-000000000001';
