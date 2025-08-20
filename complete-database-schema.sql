-- Complete Database Schema for User-Specific Application
-- This includes all tables with user_id columns and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create herbs table
CREATE TABLE IF NOT EXISTS herbs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pinyin_name TEXT NOT NULL,
  chinese_name TEXT NOT NULL,
  latin_name TEXT,
  english_name TEXT,
  category TEXT,
  nature TEXT,
  flavor TEXT,
  toxicity TEXT,
  meridians TEXT[],
  dosage TEXT,
  preparation TEXT,
  primary_functions JSONB,
  clinical_patterns JSONB,
  therapeutic_actions JSONB,
  tcm_actions JSONB,
  combinations JSONB,
  synergistic_pairs JSONB,
  antagonistic_pairs JSONB,
  standard_indications TEXT,
  special_indications JSONB,
  preparation_methods JSONB,
  contraindications TEXT,
  cautions TEXT,
  pregnancy_considerations TEXT,
  biological_effects JSONB,
  clinical_evidence JSONB,
  herb_drug_interactions JSONB,
  references_list TEXT[],
  properties TEXT,
  notes TEXT,
  functions TEXT[],
  applications TEXT,
  secondary_actions JSONB,
  common_combinations JSONB,
  pharmacological_effects TEXT[],
  laboratory_effects TEXT[],
  clinical_studies_and_research TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create formulas table
CREATE TABLE IF NOT EXISTS formulas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pinyin_name TEXT NOT NULL,
  chinese_name TEXT NOT NULL,
  english_name TEXT,
  category TEXT,
  actions TEXT[],
  indications TEXT,
  clinical_manifestations TEXT,
  clinical_applications TEXT,
  contraindications TEXT,
  cautions TEXT,
  pharmacological_effects TEXT,
  research TEXT,
  herb_drug_interactions TEXT,
  references_list TEXT[],
  composition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  identifier TEXT,
  date_of_birth DATE,
  gender TEXT,
  contact_info TEXT,
  medical_history TEXT,
  medications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  formula_id INTEGER REFERENCES formulas(id) ON DELETE SET NULL,
  custom_formula JSONB,
  name TEXT,
  date_created DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (if you need a custom users table)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can insert own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can update own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can delete own herbs" ON herbs;

DROP POLICY IF EXISTS "Users can view own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;

DROP POLICY IF EXISTS "Users can view own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
DROP POLICY IF EXISTS "Users can update own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON patients;

DROP POLICY IF EXISTS "Users can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can delete own prescriptions" ON prescriptions;

DROP POLICY IF EXISTS "Users can view own user profile" ON users;
DROP POLICY IF EXISTS "Users can insert own user profile" ON users;
DROP POLICY IF EXISTS "Users can update own user profile" ON users;
DROP POLICY IF EXISTS "Users can delete own user profile" ON users;

-- Create RLS policies for herbs
CREATE POLICY "Users can view own herbs" ON herbs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own herbs" ON herbs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own herbs" ON herbs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own herbs" ON herbs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for formulas
CREATE POLICY "Users can view own formulas" ON formulas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own formulas" ON formulas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own formulas" ON formulas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patients
CREATE POLICY "Users can view own patients" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients" ON patients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for prescriptions
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for users (if using custom users table)
CREATE POLICY "Users can view own user profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own user profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own user profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own user profile" ON users
  FOR DELETE USING (auth.uid() = auth_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_herbs_user_id ON herbs(user_id);
CREATE INDEX IF NOT EXISTS idx_herbs_pinyin_name ON herbs(pinyin_name);
CREATE INDEX IF NOT EXISTS idx_herbs_category ON herbs(category);

CREATE INDEX IF NOT EXISTS idx_formulas_user_id ON formulas(user_id);
CREATE INDEX IF NOT EXISTS idx_formulas_pinyin_name ON formulas(pinyin_name);
CREATE INDEX IF NOT EXISTS idx_formulas_category ON formulas(category);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_formula_id ON prescriptions(formula_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date_created ON prescriptions(date_created);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('herbs', 'formulas', 'patients', 'prescriptions', 'users')
ORDER BY table_name, ordinal_position;

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('herbs', 'formulas', 'patients', 'prescriptions', 'users')
ORDER BY tablename, policyname;
