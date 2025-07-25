export interface Patient {
  id: string;
  created_at: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  // Personal Information
  first_name: string;
  last_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  phone: string;
  address: string;
  email?: string;

  // Medical History
  medical_conditions: {
    diabetes: boolean;
    heart_disease: boolean;
    hypertension: boolean;
    hypotension: boolean;
    seizures: boolean;
    arthritis: boolean;
    allergies: boolean;
    bleeding_disorders: boolean;
    hepatitis: boolean;
    hiv: boolean;
    tuberculosis: boolean;
  };
  pregnancy_trimester?: 1 | 2 | 3 | null;
  current_medications?: string[];

  // Vital Signs
  vital_signs?: {
    blood_pressure: string;
    pulse: number;
    temperature: number;
    indicated_anesthesia?: string;
    medical_diagnosis?: string;
  };

  // Oral Cavity Examination
  oral_examination?: {
    soft_tissues: string;
    alveolar_process: string;
    tmj_condition: string;
    occlusion: string;
    periodontal_condition: string;
    bacterial_plaque: boolean;
    dental_calculus: {
      supragingival: boolean;
      subgingival: boolean;
    };
    radiological_needs: string;
    study_models_needed: boolean;
  };

  // Dental Conditions
  dental_conditions?: {
    missing_teeth: string[];
    restorations: string[];
    cavities: string[];
    trauma: string[];
    pain: string[];
    malocclusion: string[];
    extractions: string[];
    defective_restorations: string[];
    mobility: string[];
    prosthetics: {
      fixed: string[];
      removable: string[];
    };
    food_impact_areas: string[];
  };

  // Treatment and Payment
  treatment_plan?: string;
  total_cost?: number;
  payments?: Array<{
    date: string;
    amount: number;
    patient_signature: boolean;
    doctor_signature: boolean;
  }>;
}

export interface Appointment {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  treatment_type: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'staff';
  first_name: string;
  last_name: string;
}

export interface DentalTreatment {
  id: string;
  date: string;
  type: 'restoration' | 'extraction' | 'cleaning' | 'root-canal' | 'crown' | 'bridge' | 'implant' | 'other';
  description: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  cost: number;
  notes?: string;
}

export interface ToothCondition {
  missing?: boolean;
  restoration?: boolean;
  cavity?: boolean;
  fixedProsthesis?: boolean;
  removableProsthesis?: boolean;
  foodImpact?: boolean;
  treatments?: DentalTreatment[];
}