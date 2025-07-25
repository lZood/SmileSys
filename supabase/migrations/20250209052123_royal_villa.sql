/*
  # Add Orthodontic Consents Table

  1. New Tables
    - `orthodontic_consents`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `treatment` (text)
      - `duration` (text)
      - `total_cost` (decimal)
      - `monthly_payment` (decimal)
      - `pdf_document` (text)
      - `accepted_terms` (boolean)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create orthodontic_consents table
CREATE TABLE orthodontic_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  treatment TEXT NOT NULL,
  duration TEXT NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  monthly_payment DECIMAL(10,2) NOT NULL,
  pdf_document TEXT NOT NULL,
  accepted_terms BOOLEAN NOT NULL DEFAULT false,
  status TEXT CHECK (status IN ('pending_signature', 'signed', 'cancelled')) NOT NULL DEFAULT 'pending_signature',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE orthodontic_consents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view orthodontic consents"
ON orthodontic_consents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert orthodontic consents"
ON orthodontic_consents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update orthodontic consents"
ON orthodontic_consents FOR UPDATE
TO authenticated
USING (true);