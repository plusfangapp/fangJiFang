# Supabase Configuration Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note down your project URL and anon key

## Step 2: Environment Variables

Create a `.env` file in the `client` directory with:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

## Step 3: Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create herbs table
CREATE TABLE herbs (
  id SERIAL PRIMARY KEY,
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
  references TEXT[],
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
CREATE TABLE formulas (
  id SERIAL PRIMARY KEY,
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
  references TEXT[],
  composition JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
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
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
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
CREATE TABLE users (
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

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to herbs" ON herbs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to formulas" ON formulas FOR SELECT USING (true);
CREATE POLICY "Allow public read access to patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public read access to prescriptions" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);

-- For write access, you might want to restrict based on authentication
-- CREATE POLICY "Allow authenticated users to insert herbs" ON herbs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Step 4: Run the Frontend

```bash
npm run dev:frontend
```

This will start the frontend on `http://localhost:5173` (or another port if 5173 is busy). 