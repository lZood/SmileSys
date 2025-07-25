/*
  # Add dental chart column to patients table

  1. Changes
    - Add `dental_chart` JSONB column to patients table to store odontogram data
*/

ALTER TABLE patients ADD COLUMN IF NOT EXISTS dental_chart JSONB DEFAULT '{}'::jsonb;