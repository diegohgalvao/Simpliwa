/*
  # Configure Avatar Storage Bucket and RLS Policies

  1. Storage Setup
    - Create avatars bucket if it doesn't exist
    - Enable RLS on the avatars bucket
    
  2. Storage Policies
    - Allow authenticated users to upload their own avatars
    - Allow authenticated users to update their own avatars  
    - Allow authenticated users to delete their own avatars
    - Allow public access to view avatars
    
  3. Security
    - File names must start with user's ID to ensure users can only manage their own avatars
    - Public read access for avatar display
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on avatars bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;

-- Policy for uploading avatars (INSERT)
CREATE POLICY "Allow authenticated users to upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND name LIKE (auth.uid()::text || '-%')
);

-- Policy for updating avatars (UPDATE)
CREATE POLICY "Allow authenticated users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND name LIKE (auth.uid()::text || '-%')
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND name LIKE (auth.uid()::text || '-%')
);

-- Policy for deleting avatars (DELETE)
CREATE POLICY "Allow authenticated users to delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND name LIKE (auth.uid()::text || '-%')
);

-- Policy for viewing avatars (SELECT) - public access
CREATE POLICY "Allow public access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');