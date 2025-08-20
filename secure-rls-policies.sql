-- Secure RLS Policies for User-Specific Data Access
-- This script sets up proper Row Level Security policies to ensure users only see their own data

-- Enable RLS on all tables
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

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

-- Herbs policies
CREATE POLICY "Users can view own herbs" ON herbs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own herbs" ON herbs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own herbs" ON herbs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own herbs" ON herbs
  FOR DELETE USING (auth.uid() = user_id);

-- Formulas policies
CREATE POLICY "Users can view own formulas" ON formulas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own formulas" ON formulas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own formulas" ON formulas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (auth.uid() = user_id);

-- Patients policies
CREATE POLICY "Users can view own patients" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients" ON patients
  FOR DELETE USING (auth.uid() = user_id);

-- Prescriptions policies
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Verify policies are created
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
WHERE tablename IN ('herbs', 'formulas', 'patients', 'prescriptions')
ORDER BY tablename, policyname;
