/*
  # Add treatment type to appointments

  1. Changes
    - Add treatment_type column to appointments table
*/

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS treatment_type TEXT;