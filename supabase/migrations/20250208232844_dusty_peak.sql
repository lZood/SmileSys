/*
  # Add patient status column

  1. Changes
    - Add status column to patients table with default value 'active'
    - Add check constraint to ensure valid status values

  2. Notes
    - Valid status values: active, inactive, pending, archived
*/

-- Add status column with check constraint
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status TEXT 
CHECK (status IN ('active', 'inactive', 'pending', 'archived'))
DEFAULT 'active';

-- Update existing rows to have the default status if needed
UPDATE patients SET status = 'active' WHERE status IS NULL;