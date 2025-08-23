-- Fix herb table schema to match the data structure being sent
-- Run this in the Supabase SQL Editor

-- Add missing columns to herbs table
ALTER TABLE herbs 
ADD COLUMN IF NOT EXISTS references TEXT[],
ADD COLUMN IF NOT EXISTS tcm_actions JSONB;

-- Update existing references_list data to references if needed
UPDATE herbs 
SET references = references_list 
WHERE references IS NULL AND references_list IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_herbs_pinyin_name_lower ON herbs(LOWER(pinyin_name));
CREATE INDEX IF NOT EXISTS idx_herbs_category_lower ON herbs(LOWER(category));

-- Verify the schema
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'herbs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
