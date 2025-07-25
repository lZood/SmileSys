/*
  # Fix Profile Trigger and Add Demo User

  1. Changes
    - Drop and recreate handle_new_user function
    - Insert demo user with proper UUID handling
    - Create corresponding profile
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
    created_at,
    updated_at
  ) VALUES (
    new.id,
    first_name_val,
    last_name_val,
    'doctor',
    now(),
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo user if it doesn't exist
DO $$ 
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'demo@dentalcare.com'
  ) THEN
    -- Insert auth user with pre-generated UUID
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'demo@dentalcare.com',
      crypt('demo1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      '',
      '',
      ''
    );

    -- Insert corresponding profile
    INSERT INTO public.profiles (
      id,
      first_name,
      last_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      'Demo',
      'Doctor',
      'doctor',
      now(),
      now()
    );
  END IF;
END $$;