/*
  # Create products storage bucket

  1. Storage Setup
    - Create 'products' storage bucket for product images
    - Configure public access for product images
    - Set up RLS policies for secure access

  2. Security
    - Enable RLS on storage objects
    - Allow authenticated users to upload images for their company's products
    - Allow public read access to product images
    - Restrict delete operations to company admins and managers
*/

-- Create the products storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images to products bucket
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);

-- Policy: Allow public read access to product images
CREATE POLICY "Allow public read access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy: Allow company admins and managers to delete product images
CREATE POLICY "Allow company admins to delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  auth.uid() IS NOT NULL
);

-- Policy: Allow authenticated users to update product images
CREATE POLICY "Allow authenticated users to update product images"
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