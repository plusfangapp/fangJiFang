import { z } from 'zod'

// Herb types
export interface Herb {
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

// Formula types
export interface Formula {
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

// Patient types
export interface Patient {
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

// Prescription types
export interface Prescription {
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
  patient?: { id: number; name: string }
  formula?: { id: number; pinyin_name: string; chinese_name: string }
}

// User types
export interface User {
  id: number
  username: string
  password: string
  full_name?: string
  email?: string
  role?: string
  created_at?: string
  updated_at?: string
}

// Medication types
export interface Medication {
  id: number
  name: string
  dosage?: string
  frequency?: string
  instructions?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

// Formula with herbs
export interface FormulaWithHerbs extends Formula {
  herbs: (Herb & { grams?: number; percentage?: number })[]
  totalGrams?: number
  nature?: string
}

// Herb with grams
export interface HerbWithGrams extends Herb {
  grams?: number
  percentage?: number
}

// Zod schemas
export const insertHerbSchema = z.object({
  pinyin_name: z.string().min(1, "Pinyin name is required"),
  chinese_name: z.string().min(1, "Chinese name is required"),
  latin_name: z.string().optional(),
  english_name: z.string().optional(),
  category: z.string().optional(),
  nature: z.string().optional(),
  flavor: z.string().optional(),
  toxicity: z.string().optional(),
  meridians: z.array(z.string()).optional(),
  dosage: z.string().optional(),
  preparation: z.string().optional(),
  primary_functions: z.any().optional(),
  clinical_patterns: z.any().optional(),
  therapeutic_actions: z.any().optional(),
  tcm_actions: z.any().optional(),
  combinations: z.any().optional(),
  synergistic_pairs: z.any().optional(),
  antagonistic_pairs: z.any().optional(),
  standard_indications: z.string().optional(),
  special_indications: z.any().optional(),
  preparation_methods: z.any().optional(),
  contraindications: z.string().optional(),
  cautions: z.string().optional(),
  pregnancy_considerations: z.string().optional(),
  biological_effects: z.any().optional(),
  clinical_evidence: z.any().optional(),
  herb_drug_interactions: z.any().optional(),
  references: z.array(z.string()).optional(),
  properties: z.string().optional(),
  notes: z.string().optional(),
  functions: z.array(z.string()).optional(),
  applications: z.string().optional(),
  secondary_actions: z.any().optional(),
  common_combinations: z.any().optional(),
  pharmacological_effects: z.array(z.string()).optional(),
  laboratory_effects: z.array(z.string()).optional(),
  clinical_studies_and_research: z.array(z.string()).optional(),
})

export const insertFormulaSchema = z.object({
  pinyin_name: z.string().min(1, "Pinyin name is required"),
  chinese_name: z.string().min(1, "Chinese name is required"),
  english_name: z.string().optional(),
  category: z.string().optional(),
  actions: z.array(z.string()).optional(),
  indications: z.string().optional(),
  clinical_manifestations: z.string().optional(),
  clinical_applications: z.string().optional(),
  contraindications: z.string().optional(),
  cautions: z.string().optional(),
  pharmacological_effects: z.string().optional(),
  research: z.string().optional(),
  herb_drug_interactions: z.string().optional(),
  references: z.array(z.string()).optional(),
  composition: z.any().default([]),
})

export const insertPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  identifier: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  contact_info: z.string().optional(),
  medical_history: z.string().optional(),
  medications: z.any().default([]),
})

export const insertPrescriptionSchema = z.object({
  patient_id: z.number().min(1, "Patient is required"),
  formula_id: z.number().optional(),
  custom_formula: z.any().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
})

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().default("user"),
})

export const insertMedicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
  active: z.boolean().default(true),
})