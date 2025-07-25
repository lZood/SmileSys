/*
  # Fix orthodontic consents policies

  1. Security
    - Add policies for authenticated users if they don't exist
    - Safely handle existing policies
*/

DO $$ 
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orthodontic_consents' 
    AND policyname = 'Authenticated users can view orthodontic consents'
  ) THEN
    CREATE POLICY "Authenticated users can view orthodontic consents"
    ON orthodontic_consents FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orthodontic_consents' 
    AND policyname = 'Authenticated users can insert orthodontic consents'
  ) THEN
    CREATE POLICY "Authenticated users can insert orthodontic consents"
    ON orthodontic_consents FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orthodontic_consents' 
    AND policyname = 'Authenticated users can update orthodontic consents'
  ) THEN
    CREATE POLICY "Authenticated users can update orthodontic consents"
    ON orthodontic_consents FOR UPDATE
    TO authenticated
    USING (true);
  END IF;
END $$;