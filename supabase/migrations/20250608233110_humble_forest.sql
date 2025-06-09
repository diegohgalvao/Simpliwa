/*
  # Create Products Storage Bucket and Policies

  1. Storage Setup
    - Create products bucket for storing product images
    - Set public access and file size limits
    - Configure allowed MIME types for images

  2. Security Policies
    - Public read access for product images
    - Authenticated users can upload, update, and delete product images
    - Proper RLS policies for storage objects
*/

-- Create the products storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    -- Ignore if policies don't exist
    NULL;
END $$;

-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);