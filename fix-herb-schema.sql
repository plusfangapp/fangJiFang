-- Fix herb table schema to match the data structure being sent
-- This migration adds missing columns and fixes column names

-- Add missing columns to herbs table
ALTER TABLE herbs 
ADD COLUMN IF NOT EXISTS references TEXT[],
ADD COLUMN IF NOT EXISTS tcm_actions JSONB;

-- Update existing references_list data to references if needed
UPDATE herbs 
SET references = references_list 
WHERE references IS NULL AND references_list IS NOT NULL;

-- Drop the old references_list column if it exists and we've migrated the data
-- ALTER TABLE herbs DROP COLUMN IF EXISTS references_list;

-- Ensure all JSONB columns can handle the data types being sent
-- The schema already supports JSONB for complex data structures

-- Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_herbs_pinyin_name_lower ON herbs(LOWER(pinyin_name));
CREATE INDEX IF NOT EXISTS idx_herbs_category_lower ON herbs(LOWER(category));

-- Verify the schema matches the expected structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'herbs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
