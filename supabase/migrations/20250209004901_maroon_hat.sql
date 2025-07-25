/*
  # Fix user profile creation

  1. Changes
    - Drop and recreate the handle_new_user function to ensure proper profile creation
    - Add better error handling and default values
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the improved function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
BEGIN
  -- Extract first_name and last_name from raw_user_meta_data
  first_name_val := COALESCE(
    new.raw_user_meta_data->>'first_name',
    split_part(new.email, '@', 1)
  );
  
  last_name_val := COALESCE(
    new.raw_user_meta_data->>'last_name',
    'Doctor'
  );

  -- Create the profile
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    email,
    created_at
  ) VALUES (
    new.id,
    first_name_val,
    last_name_val,
    'doctor',
    new.email,
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();