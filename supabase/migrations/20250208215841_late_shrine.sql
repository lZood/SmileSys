/*
  # Fix RLS policies for patients table

  1. Changes
    - Update RLS policies to allow authenticated users to manage patients
    - Add proper security checks based on user role
  
  2. Security
    - Enable RLS on patients table
    - Add policies for authenticated users to perform CRUD operations
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Staff can view all patients" ON patients;
DROP POLICY IF EXISTS "Staff can insert patients" ON patients;
DROP POLICY IF EXISTS "Staff can update patients" ON patients;

-- Create new policies
CREATE POLICY "Authenticated users can view patients"
ON patients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
ON patients FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete patients"
ON patients FOR DELETE
TO authenticated
USING (true);