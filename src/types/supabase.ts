export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          age: number | null
          gender: string | null
          occupation: string | null
          medical_conditions: Json | null
          pregnancy_trimester: number | null
          current_medications: string[] | null
          vital_signs: Json | null
          dental_chart: Json | null
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          age?: number | null
          gender?: string | null
          occupation?: string | null
          medical_conditions?: Json | null
          pregnancy_trimester?: number | null
          current_medications?: string[] | null
          vital_signs?: Json | null
          dental_chart?: Json | null
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          age?: number | null
          gender?: string | null
          occupation?: string | null
          medical_conditions?: Json | null
          pregnancy_trimester?: number | null
          current_medications?: string[] | null
          vital_signs?: Json | null
          dental_chart?: Json | null
          status?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          duration: number
          treatment_type: string | null
          notes: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          duration?: number
          treatment_type?: string | null
          notes?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          date?: string
          time?: string
          duration?: number
          treatment_type?: string | null
          notes?: string | null
          status?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          patient_id: string
          amount: number
          payment_date: string
          payment_method: string
          concept: string
          invoice_number: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          amount: number
          payment_date?: string
          payment_method: string
          concept: string
          invoice_number: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          concept?: string
          invoice_number?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          quantity: number
          minimum_quantity: number
          unit_price: number | null
          status: string
          supplier: string | null
          last_ordered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          quantity?: number
          minimum_quantity?: number
          unit_price?: number | null
          status?: string
          supplier?: string | null
          last_ordered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          quantity?: number
          minimum_quantity?: number
          unit_price?: number | null
          status?: string
          supplier?: string | null
          last_ordered_at?: string | null
          created_at?: string
        }
      }
    }
  }
}