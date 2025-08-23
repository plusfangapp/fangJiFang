-- Complete Prescription Table Schema
-- Drop and recreate the prescriptions table with all necessary fields

-- First, drop the existing prescriptions table if it exists
DROP TABLE IF EXISTS prescriptions CASCADE;

-- Create the prescriptions table with all necessary columns
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  formula_id INTEGER REFERENCES formulas(id) ON DELETE SET NULL,
  custom_formula JSONB,
  name TEXT,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT DEFAULT 'active',
  diagnosis TEXT,
  instructions TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can delete own prescriptions" ON prescriptions;

-- Create RLS policies for prescriptions
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_formula_id ON prescriptions(formula_id);
CREATE INDEX idx_prescriptions_date_created ON prescriptions(date_created);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_name ON prescriptions(name);

-- Create composite indexes for common queries
CREATE INDEX idx_prescriptions_user_patient ON prescriptions(user_id, patient_id);
CREATE INDEX idx_prescriptions_user_date ON prescriptions(user_id, date_created);
CREATE INDEX idx_prescriptions_user_status ON prescriptions(user_id, status);

-- Create trigger function for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at column
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns for documentation
COMMENT ON TABLE prescriptions IS 'Stores prescription data with patient and formula relationships';
COMMENT ON COLUMN prescriptions.id IS 'Primary key for prescriptions';
COMMENT ON COLUMN prescriptions.user_id IS 'Foreign key to auth.users for user isolation';
COMMENT ON COLUMN prescriptions.patient_id IS 'Foreign key to patients table';
COMMENT ON COLUMN prescriptions.formula_id IS 'Optional foreign key to formulas table';
COMMENT ON COLUMN prescriptions.custom_formula IS 'JSONB field storing complete custom formula data';
COMMENT ON COLUMN prescriptions.name IS 'Name of the prescription';
COMMENT ON COLUMN prescriptions.date_created IS 'Date when prescription was created';
COMMENT ON COLUMN prescriptions.notes IS 'Additional notes for the prescription';
COMMENT ON COLUMN prescriptions.status IS 'Status of the prescription (active, inactive, completed, etc.)';
COMMENT ON COLUMN prescriptions.diagnosis IS 'Patient diagnosis for this prescription';
COMMENT ON COLUMN prescriptions.instructions IS 'Usage instructions for the prescription';
COMMENT ON COLUMN prescriptions.duration IS 'Duration of the treatment';
COMMENT ON COLUMN prescriptions.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN prescriptions.updated_at IS 'Timestamp when record was last updated';

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'prescriptions'
ORDER BY ordinal_position;

-- Show the created indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'prescriptions';

-- Show the created policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'prescriptions';
