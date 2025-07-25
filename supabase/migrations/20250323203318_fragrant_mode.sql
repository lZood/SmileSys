/*
  # Add Google Calendar Token to Profiles

  1. Changes
    - Add google_calendar_token column to profiles table
    - This column will store the Google OAuth token for calendar integration

  2. Security
    - Column can be null (not all users will connect Google Calendar)
    - Maintain existing RLS policies
*/

-- Add Google Calendar token column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_token TEXT;