/*
  # Add storage bucket and policies for orthodontic consents

  1. Storage
    - Create orthodontic-consents bucket
    - Add policies for authenticated users to:
      - Upload PDFs
      - Download PDFs
      - View PDFs
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('orthodontic-consents', 'orthodontic-consents')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for orthodontic-consents bucket
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'orthodontic-consents'
  AND (storage.extension(name) = 'pdf')
);

CREATE POLICY "Authenticated users can view PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'orthodontic-consents');

CREATE POLICY "Authenticated users can update PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'orthodontic-consents');