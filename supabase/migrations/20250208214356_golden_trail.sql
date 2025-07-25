/*
  # Add patient medical fields

  1. Changes
    - Add age field to patients table
    - Add gender field to patients table
    - Add occupation field to patients table
    - Add medical_conditions JSONB field
    - Add vital_signs JSONB field
    - Add oral_examination JSONB field
    - Add dental_conditions JSONB field
    - Add treatment_plan and payment fields

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE patients ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Add medical history fields
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_conditions JSONB DEFAULT '{
  "diabetes": false,
  "heart_disease": false,
  "hypertension": false,
  "hypotension": false,
  "seizures": false,
  "arthritis": false,
  "allergies": false,
  "bleeding_disorders": false,
  "hepatitis": false,
  "hiv": false,
  "tuberculosis": false
}'::jsonb;

ALTER TABLE patients ADD COLUMN IF NOT EXISTS pregnancy_trimester INTEGER CHECK (pregnancy_trimester IN (1, 2, 3));
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_medications TEXT[];

-- Add vital signs
ALTER TABLE patients ADD COLUMN IF NOT EXISTS vital_signs JSONB DEFAULT '{
  "blood_pressure": null,
  "pulse": null,
  "temperature": null,
  "indicated_anesthesia": null,
  "medical_diagnosis": null
}'::jsonb;

-- Add oral examination fields
ALTER TABLE patients ADD COLUMN IF NOT EXISTS oral_examination JSONB DEFAULT '{
  "soft_tissues": null,
  "alveolar_process": null,
  "tmj_condition": null,
  "occlusion": null,
  "periodontal_condition": null,
  "bacterial_plaque": false,
  "dental_calculus": {
    "supragingival": false,
    "subgingival": false
  },
  "radiological_needs": null,
  "study_models_needed": false
}'::jsonb;

-- Add dental conditions
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dental_conditions JSONB DEFAULT '{
  "missing_teeth": [],
  "restorations": [],
  "cavities": [],
  "trauma": [],
  "pain": [],
  "malocclusion": [],
  "extractions": [],
  "defective_restorations": [],
  "mobility": [],
  "prosthetics": {
    "fixed": [],
    "removable": []
  },
  "food_impact_areas": []
}'::jsonb;

-- Add treatment and payment fields
ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_plan TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb;