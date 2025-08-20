import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export interface Database {
  public: {
    Tables: {
      herbs: {
        Row: {
          id: number
          user_id?: string
          pinyin_name: string
          chinese_name: string
          latin_name?: string
          english_name?: string
          category?: string
          nature?: string
          flavor?: string
          toxicity?: string
          meridians?: string[]
          dosage?: string
          preparation?: string
          primary_functions?: any
          clinical_patterns?: any
          therapeutic_actions?: any
          tcm_actions?: any
          combinations?: any
          synergistic_pairs?: any
          antagonistic_pairs?: any
          standard_indications?: string
          special_indications?: any
          preparation_methods?: any
          contraindications?: string
          cautions?: string
          pregnancy_considerations?: string
          biological_effects?: any
          clinical_evidence?: any
          herb_drug_interactions?: any
          references?: string[]
          properties?: string
          notes?: string
          functions?: string[]
          applications?: string
          secondary_actions?: any
          common_combinations?: any
          pharmacological_effects?: string[]
          laboratory_effects?: string[]
          clinical_studies_and_research?: string[]
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          user_id?: string
          pinyin_name: string
          chinese_name: string
          latin_name?: string
          english_name?: string
          category?: string
          nature?: string
          flavor?: string
          toxicity?: string
          meridians?: string[]
          dosage?: string
          preparation?: string
          primary_functions?: any
          clinical_patterns?: any
          therapeutic_actions?: any
          tcm_actions?: any
          combinations?: any
          synergistic_pairs?: any
          antagonistic_pairs?: any
          standard_indications?: string
          special_indications?: any
          preparation_methods?: any
          contraindications?: string
          cautions?: string
          pregnancy_considerations?: string
          biological_effects?: any
          clinical_evidence?: any
          herb_drug_interactions?: any
          references?: string[]
          properties?: string
          notes?: string
          functions?: string[]
          applications?: string
          secondary_actions?: any
          common_combinations?: any
          pharmacological_effects?: string[]
          laboratory_effects?: string[]
          clinical_studies_and_research?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          pinyin_name?: string
          chinese_name?: string
          latin_name?: string
          english_name?: string
          category?: string
          nature?: string
          flavor?: string
          toxicity?: string
          meridians?: string[]
          dosage?: string
          preparation?: string
          primary_functions?: any
          clinical_patterns?: any
          therapeutic_actions?: any
          tcm_actions?: any
          combinations?: any
          synergistic_pairs?: any
          antagonistic_pairs?: any
          standard_indications?: string
          special_indications?: any
          preparation_methods?: any
          contraindications?: string
          cautions?: string
          pregnancy_considerations?: string
          biological_effects?: any
          clinical_evidence?: any
          herb_drug_interactions?: any
          references?: string[]
          properties?: string
          notes?: string
          functions?: string[]
          applications?: string
          secondary_actions?: any
          common_combinations?: any
          pharmacological_effects?: string[]
          laboratory_effects?: string[]
          clinical_studies_and_research?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      formulas: {
        Row: {
          id: number
          user_id?: string
          pinyin_name: string
          chinese_name: string
          english_name?: string
          category?: string
          actions?: string[]
          indications?: string
          clinical_manifestations?: string
          clinical_applications?: string
          contraindications?: string
          cautions?: string
          pharmacological_effects?: string
          research?: string
          herb_drug_interactions?: string
          references?: string[]
          composition?: any
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          user_id?: string
          pinyin_name: string
          chinese_name: string
          english_name?: string
          category?: string
          actions?: string[]
          indications?: string
          clinical_manifestations?: string
          clinical_applications?: string
          contraindications?: string
          cautions?: string
          pharmacological_effects?: string
          research?: string
          herb_drug_interactions?: string
          references?: string[]
          composition?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          pinyin_name?: string
          chinese_name?: string
          english_name?: string
          category?: string
          actions?: string[]
          indications?: string
          clinical_manifestations?: string
          clinical_applications?: string
          contraindications?: string
          cautions?: string
          pharmacological_effects?: string
          research?: string
          herb_drug_interactions?: string
          references?: string[]
          composition?: any
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: number
          user_id?: string
          name: string
          identifier?: string
          date_of_birth?: string
          gender?: string
          contact_info?: string
          medical_history?: string
          medications?: any
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          user_id?: string
          name: string
          identifier?: string
          date_of_birth?: string
          gender?: string
          contact_info?: string
          medical_history?: string
          medications?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          identifier?: string
          date_of_birth?: string
          gender?: string
          contact_info?: string
          medical_history?: string
          medications?: any
          created_at?: string
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: number
          user_id?: string
          patient_id: number
          formula_id?: number
          custom_formula?: any
          name?: string
          date_created?: string
          notes?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          user_id?: string
          patient_id: number
          formula_id?: number
          custom_formula?: any
          name?: string
          date_created?: string
          notes?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          patient_id?: number
          formula_id?: number
          custom_formula?: any
          name?: string
          date_created?: string
          notes?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: number
          username: string
          password: string
          full_name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          username: string
          password: string
          full_name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          username?: string
          password?: string
          full_name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 