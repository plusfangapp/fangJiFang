-- Formula Table Schema
-- Drop and recreate the formulas table with all necessary columns

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

-- Enable Row Level Security (RLS)
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;

-- Create RLS policies for formulas
CREATE POLICY "Users can view own formulas" ON formulas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own formulas" ON formulas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own formulas" ON formulas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_formulas_user_id ON formulas(user_id);
CREATE INDEX IF NOT EXISTS idx_formulas_pinyin_name ON formulas(pinyin_name);
CREATE INDEX IF NOT EXISTS idx_formulas_category ON formulas(category);
CREATE INDEX IF NOT EXISTS idx_formulas_pinyin_name_lower ON formulas(LOWER(pinyin_name));
CREATE INDEX IF NOT EXISTS idx_formulas_category_lower ON formulas(LOWER(category));

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'formulas'
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
WHERE tablename = 'formulas'
ORDER BY policyname;

-- Show table structure summary
SELECT 
  'formulas' as table_name,
  COUNT(*) as column_count,
  'RLS enabled' as rls_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'formulas';
