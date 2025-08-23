-- Complete Herb Table Schema (Simplified)
-- Drop and recreate the herbs table

DROP TABLE IF EXISTS herbs CASCADE;

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

-- Enable RLS
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own herbs" ON herbs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own herbs" ON herbs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own herbs" ON herbs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own herbs" ON herbs
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_herbs_user_id ON herbs(user_id);
CREATE INDEX idx_herbs_pinyin_name ON herbs(pinyin_name);
CREATE INDEX idx_herbs_category ON herbs(category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
