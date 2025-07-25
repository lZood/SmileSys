/*
  # Add trigger to create profile on user signup

  1. New Functions
    - Create function to handle new user signup
    - Automatically create profile entry when new user signs up
  
  2. Triggers
    - Add trigger on auth.users to call the handler function
*/

-- Create the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'last_name', new.email),
    'doctor'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();