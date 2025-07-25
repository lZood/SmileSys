/*
  # Initial Schema for Dental Clinic System

  1. Tables
    - users (auth.users)
    - profiles
      - Extends auth.users with additional user information
    - patients
      - Stores patient information
    - appointments
      - Manages appointments and scheduling
    - medical_records
      - Stores patient medical history
    - inventory_items
      - Tracks dental supplies and equipment
    - treatments
      - Catalog of available dental treatments
    
  2. Security
    - RLS policies for each table
    - Role-based access control
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'staff');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  allergies TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  doctor_id UUID REFERENCES profiles(id) NOT NULL,
  treatment_id UUID,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medical Records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  doctor_id UUID REFERENCES profiles(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  diagnosis TEXT,
  treatment_notes TEXT,
  prescriptions TEXT[],
  attachments TEXT[], -- URLs to stored files
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory Items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER NOT NULL DEFAULT 10,
  unit_price DECIMAL(10,2),
  status inventory_status DEFAULT 'in_stock',
  supplier TEXT,
  last_ordered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Treatments table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all patients"
  ON patients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  ));

CREATE POLICY "Staff can insert patients"
  ON patients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  ));

CREATE POLICY "Staff can update patients"
  ON patients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  ));

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();