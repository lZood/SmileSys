/*
  # Fix appointments and profiles setup

  1. Changes
    - Drop and recreate appointments table with simpler structure
    - Add proper indexes and constraints
    - Update RLS policies
*/

-- Drop existing table and its dependencies
DROP TABLE IF EXISTS appointments CASCADE;

-- Create new simplified appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  doctor_id UUID NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  treatment_type TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view appointments"
ON appointments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Authenticated users can update appointments"
ON appointments FOR UPDATE
TO authenticated
USING (auth.uid() = doctor_id);

CREATE POLICY "Authenticated users can delete appointments"
ON appointments FOR DELETE
TO authenticated
USING (auth.uid() = doctor_id);

-- Create index for common queries
CREATE INDEX appointments_date_time_idx ON appointments(date, time);
CREATE INDEX appointments_patient_id_idx ON appointments(patient_id);
CREATE INDEX appointments_doctor_id_idx ON appointments(doctor_id);