-- Formula Table Schema (Simplified)
-- Drop and recreate the formulas table

DROP TABLE IF EXISTS formulas CASCADE;

CREATE TABLE formulas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pinyin_name TEXT NOT NULL,
  chinese_name TEXT NOT NULL,
  english_name TEXT,
  category TEXT,
  actions TEXT[],
  indications TEXT,
  contraindications TEXT,
  composition JSONB,
  clinical_manifestations TEXT,
  clinical_applications TEXT,
  cautions TEXT,
  pharmacological_effects TEXT,
  research TEXT,
  herb_drug_interactions TEXT,
  reference_list TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own formulas" ON formulas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own formulas" ON formulas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own formulas" ON formulas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_formulas_user_id ON formulas(user_id);
CREATE INDEX idx_formulas_pinyin_name ON formulas(pinyin_name);
CREATE INDEX idx_formulas_category ON formulas(category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
