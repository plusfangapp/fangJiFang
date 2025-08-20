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
  composition JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  identifier TEXT,
  date_of_birth TEXT,
  gender TEXT,
  contact_info TEXT,
  medical_history TEXT,
  medications JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  formula_id INTEGER REFERENCES formulas(id),
  custom_formula JSONB,
  name TEXT,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create user-specific policies for data isolation
CREATE POLICY "Users can read their own herbs" ON herbs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own herbs" ON herbs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own herbs" ON herbs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own herbs" ON herbs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own formulas" ON formulas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own formulas" ON formulas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own formulas" ON formulas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own formulas" ON formulas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own patients" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patients" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patients" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patients" ON patients FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own prescriptions" ON prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prescriptions" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prescriptions" ON prescriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prescriptions" ON prescriptions FOR DELETE USING (auth.uid() = user_id);

-- Migration commands to add user_id to existing tables (run these if upgrading existing database)
-- ALTER TABLE herbs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE formulas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- If you need to assign existing data to a specific user, you would run something like:
-- UPDATE herbs SET user_id = 'your-user-uuid' WHERE user_id IS NULL;
-- UPDATE formulas SET user_id = 'your-user-uuid' WHERE user_id IS NULL;
-- UPDATE patients SET user_id = 'your-user-uuid' WHERE user_id IS NULL;
-- UPDATE prescriptions SET user_id = 'your-user-uuid' WHERE user_id IS NULL; 