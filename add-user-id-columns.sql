-- Add user_id columns to existing tables
-- Run this script in your Supabase SQL editor

-- Add user_id column to herbs table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'herbs' AND column_name = 'user_id') THEN
    ALTER TABLE herbs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to herbs table';
  ELSE
    RAISE NOTICE 'user_id column already exists in herbs table';
  END IF;
END $$;

-- Add user_id column to formulas table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'formulas' AND column_name = 'user_id') THEN
    ALTER TABLE formulas ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to formulas table';
  ELSE
    RAISE NOTICE 'user_id column already exists in formulas table';
  END IF;
END $$;

-- Add user_id column to patients table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'user_id') THEN
    ALTER TABLE patients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to patients table';
  ELSE
    RAISE NOTICE 'user_id column already exists in patients table';
  END IF;
END $$;

-- Add user_id column to prescriptions table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'user_id') THEN
    ALTER TABLE prescriptions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to prescriptions table';
  ELSE
    RAISE NOTICE 'user_id column already exists in prescriptions table';
  END IF;
END $$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can insert their own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can update their own herbs" ON herbs;
DROP POLICY IF EXISTS "Users can delete their own herbs" ON herbs;

DROP POLICY IF EXISTS "Users can read their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete their own formulas" ON formulas;

DROP POLICY IF EXISTS "Users can read their own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert their own patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete their own patients" ON patients;

DROP POLICY IF EXISTS "Users can read their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON prescriptions;

-- Create more permissive RLS policies for now
-- Allow authenticated users to read all records (for debugging)
CREATE POLICY "Allow authenticated users to read herbs" ON herbs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert herbs" ON herbs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update herbs" ON herbs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete herbs" ON herbs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read formulas" ON formulas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert formulas" ON formulas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update formulas" ON formulas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete formulas" ON formulas FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read patients" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert patients" ON patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update patients" ON patients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete patients" ON patients FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read prescriptions" ON prescriptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert prescriptions" ON prescriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update prescriptions" ON prescriptions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete prescriptions" ON prescriptions FOR DELETE USING (auth.role() = 'authenticated');

-- Update existing records to assign them to a default user (optional)
-- You may want to run this if you have existing data that needs to be assigned to a user
-- Replace 'your-user-id-here' with an actual user ID from your auth.users table
-- UPDATE herbs SET user_id = 'your-user-id-here' WHERE user_id IS NULL;
-- UPDATE formulas SET user_id = 'your-user-id-here' WHERE user_id IS NULL;
-- UPDATE patients SET user_id = 'your-user-id-here' WHERE user_id IS NULL;
-- UPDATE prescriptions SET user_id = 'your-user-id-here' WHERE user_id IS NULL;
