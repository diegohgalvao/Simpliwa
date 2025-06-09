/*
  # Create function to get user ID by email

  1. New Functions
    - `get_user_id_by_email` - Safely retrieves user ID from auth.users table by email
  
  2. Security
    - Function uses SECURITY DEFINER to access auth.users table
    - Grant execute permission to authenticated users
    - Returns null if user not found (no error thrown)
*/

CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
RETURNS uuid AS $$
  SELECT id FROM auth.users WHERE email = p_email;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;