/*
  # Fix User and Profile Creation

  1. Changes
    - Check for both user and profile existence
    - Use transaction to ensure data consistency
    - Better error handling
*/

DO $$ 
DECLARE
  new_user_id uuid;
BEGIN
  -- Only proceed if neither user nor profile exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'demo@dentalcare.com'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE first_name = 'Demo' AND last_name = 'Doctor'
  ) THEN
    -- Generate new UUID
    new_user_id := gen_random_uuid();
    
    -- Insert auth user
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

    -- Insert profile
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