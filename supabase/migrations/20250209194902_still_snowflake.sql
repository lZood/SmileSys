-- Create storage bucket for orthodontic consents if it doesn't exist
DO $$
BEGIN
    -- Only create bucket if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'orthodontic-consents'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('orthodontic-consents', 'orthodontic-consents', true);
    END IF;

    -- Enable RLS on objects if not already enabled
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Authenticated users can upload PDFs" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view PDFs" ON storage.objects;

    -- Create new policies
    CREATE POLICY "Authenticated users can upload PDFs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'orthodontic-consents'
        AND (storage.extension(name) = 'pdf')
    );

    CREATE POLICY "Anyone can view PDFs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'orthodontic-consents');
END $$;