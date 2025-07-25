/*
  # Add Google Calendar Settings

  1. Changes
    - Add google_calendar_enabled boolean column to profiles
    - Add google_calendar_refresh_token column to profiles
    - Add google_calendar_expires_at column to profiles

  2. Security
    - Maintain existing RLS policies
*/

-- Add Google Calendar related columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_expires_at TIMESTAMPTZ;