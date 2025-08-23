-- Simple Prescription Table Schema
-- Quick setup for prescriptions table

-- Drop the existing prescriptions table if it exists
DROP TABLE IF EXISTS prescriptions CASCADE;

-- Create the prescriptions table
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

-- Enable Row Level Security
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create basic indexes
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_date_created ON prescriptions(date_created);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'Prescriptions table created successfully!' as status;
