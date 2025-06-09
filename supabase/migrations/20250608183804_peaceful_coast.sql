/*
  # Create products storage bucket

  1. Storage Setup
    - Create 'products' bucket for product images
    - Configure public access and file restrictions
    - Set up security policies for image management

  2. Security
    - Enable public read access for product images
    - Allow authenticated users to upload images
    - Restrict file types to images only
*/

-- Create the products storage bucket using the storage API
SELECT storage.create_bucket('products', '{"public": true, "file_size_limit": 5242880, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif"]}');

-- Create policies for the products bucket
-- Note: These policies will be created automatically by Supabase for storage buckets
-- But we can ensure they exist with these statements

-- Allow public read access to product images
CREATE POLICY IF NOT EXISTS "Public read access for product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their product images
CREATE POLICY IF NOT EXISTS "Authenticated users can update product images"
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
CREATE POLICY IF NOT EXISTS "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);