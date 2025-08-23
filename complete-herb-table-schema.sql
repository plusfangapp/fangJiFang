-- Complete Herb Table Schema
-- Drop and recreate the herbs table with all necessary columns

-- First, drop the existing herbs table (this will also drop all related constraints and indexes)
DROP TABLE IF EXISTS herbs CASCADE;

-- Create the herbs table with all necessary columns
CREATE TABLE herbs (
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
  reference_list TEXT[],
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

-- Enable Row Level Security (RLS)
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can insert own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can update own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can delete own herbs" ON herbs;

-- Create RLS policies for herbs
CREATE POLICY "Users can view own herbs" ON herbs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own herbs" ON herbs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own herbs" ON herbs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own herbs" ON herbs
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_herbs_user_id ON herbs(user_id);
CREATE INDEX IF NOT EXISTS idx_herbs_pinyin_name ON herbs(pinyin_name);
CREATE INDEX IF NOT EXISTS idx_herbs_category ON herbs(category);
CREATE INDEX IF NOT EXISTS idx_herbs_pinyin_name_lower ON herbs(LOWER(pinyin_name));
CREATE INDEX IF NOT EXISTS idx_herbs_category_lower ON herbs(LOWER(category));

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'herbs'
ORDER BY ordinal_position;

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
WHERE tablename = 'herbs'
ORDER BY policyname;

-- Show table structure summary
SELECT 
  'herbs' as table_name,
  COUNT(*) as column_count,
  'RLS enabled' as rls_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'herbs';
