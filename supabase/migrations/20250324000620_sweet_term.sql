/*
  # Add Initial Profile Record

  1. Changes
    - Insert initial profile record for admin user
    - Set role as 'doctor'
    - Add basic profile information
*/

-- Insert initial profile if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'demo@dentalcare.com'
  ) THEN
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
      gen_random_uuid(),
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
      (SELECT id FROM auth.users WHERE email = 'demo@dentalcare.com'),
      'Demo',
      'Doctor',
      'doctor',
      now(),
      now()
    );
  END IF;
END $$;