/*
  # Add payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `amount` (decimal)
      - `payment_date` (timestamptz)
      - `payment_method` (text)
      - `concept` (text)
      - `invoice_number` (text)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users to manage payments
*/

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer')) NOT NULL,
  concept TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'cancelled')) NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for common queries
CREATE INDEX payments_patient_id_idx ON payments(patient_id);
CREATE INDEX payments_payment_date_idx ON payments(payment_date);
CREATE INDEX payments_status_idx ON payments(status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view payments"
ON payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
ON payments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete payments"
ON payments FOR DELETE
TO authenticated
USING (true);