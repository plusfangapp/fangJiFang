-- Update Prescriptions Table Schema
-- Add missing fields to the prescriptions table

-- Add diagnosis column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'diagnosis') THEN
    ALTER TABLE prescriptions ADD COLUMN diagnosis TEXT;
    RAISE NOTICE 'Added diagnosis column to prescriptions table';
  ELSE
    RAISE NOTICE 'diagnosis column already exists in prescriptions table';
  END IF;
END $$;

-- Add instructions column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'instructions') THEN
    ALTER TABLE prescriptions ADD COLUMN instructions TEXT;
    RAISE NOTICE 'Added instructions column to prescriptions table';
  ELSE
    RAISE NOTICE 'instructions column already exists in prescriptions table';
  END IF;
END $$;

-- Add duration column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'duration') THEN
    ALTER TABLE prescriptions ADD COLUMN duration TEXT;
    RAISE NOTICE 'Added duration column to prescriptions table';
  ELSE
    RAISE NOTICE 'duration column already exists in prescriptions table';
  END IF;
END $$;

-- Update status column to have default value if it doesn't have one
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'status' AND column_default IS NOT NULL) THEN
    ALTER TABLE prescriptions ALTER COLUMN status SET DEFAULT 'active';
    RAISE NOTICE 'Updated status column to have default value';
  ELSE
    RAISE NOTICE 'status column already has default value';
  END IF;
END $$;

-- Verify the updated schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'prescriptions'
ORDER BY ordinal_position;
