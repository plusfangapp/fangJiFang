-- Temporarily disable RLS for testing
-- WARNING: This removes security - only use for development/testing

-- Disable RLS on all tables
ALTER TABLE herbs DISABLE ROW LEVEL SECURITY;
ALTER TABLE formulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;

-- This will allow all operations without authentication checks
-- Remember to re-enable RLS when you're ready for production
