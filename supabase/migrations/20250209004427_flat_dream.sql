/*
  # Add RLS policies for appointments table

  1. Security
    - Enable RLS on appointments table
    - Add policies for authenticated users to:
      - View all appointments
      - Create new appointments
      - Update appointments
      - Delete appointments
*/

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
WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
ON appointments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete appointments"
ON appointments FOR DELETE
TO authenticated
USING (true);