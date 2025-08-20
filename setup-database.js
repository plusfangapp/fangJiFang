import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ueoyqnnlpdjdmhkxyuik.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MDc4MCwiZXhwIjoyMDY5ODI2NzgwfQ.ByyBK6SnbWwnA8NVEAo5X4Dr-Jc7vmnCDA13n_JCY7Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database...')
  
  try {
    // Create herbs table
    const { error: herbsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS herbs (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          pinyin_name TEXT NOT NULL,
          chinese_name TEXT NOT NULL,
          latin_name TEXT,
          english_name TEXT,
          category TEXT,
          nature TEXT,
          flavor TEXT,
          toxicity TEXT,
          meridians TEXT[],
          dosage TEXT,
          preparation TEXT,
          primary_functions JSONB,
          clinical_patterns JSONB,
          therapeutic_actions JSONB,
          tcm_actions JSONB,
          combinations JSONB,
          synergistic_pairs JSONB,
          antagonistic_pairs JSONB,
          standard_indications TEXT,
          special_indications JSONB,
          preparation_methods JSONB,
          contraindications TEXT,
          cautions TEXT,
          pregnancy_considerations TEXT,
          biological_effects JSONB,
          clinical_evidence JSONB,
          herb_drug_interactions JSONB,
          references TEXT[],
          properties TEXT,
          notes TEXT,
          functions TEXT[],
          applications TEXT,
          secondary_actions JSONB,
          common_combinations JSONB,
          pharmacological_effects TEXT[],
          laboratory_effects TEXT[],
          clinical_studies_and_research TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (herbsError) {
      console.log('Herbs table error:', herbsError)
    } else {
      console.log('✅ Herbs table created')
    }

    // Add user_id column to herbs if it doesn't exist
    const { error: herbsAlterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'herbs' AND column_name = 'user_id') THEN
            ALTER TABLE herbs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
    })
    
    if (herbsAlterError) {
      console.log('Herbs alter table error:', herbsAlterError)
    } else {
      console.log('✅ Herbs user_id column added')
    }

    // Create formulas table
    const { error: formulasError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS formulas (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          pinyin_name TEXT NOT NULL,
          chinese_name TEXT NOT NULL,
          english_name TEXT,
          category TEXT,
          actions TEXT[],
          indications TEXT,
          clinical_manifestations TEXT,
          clinical_applications TEXT,
          contraindications TEXT,
          cautions TEXT,
          pharmacological_effects TEXT,
          research TEXT,
          herb_drug_interactions TEXT,
          references TEXT[],
          composition JSONB DEFAULT '[]'::jsonb NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (formulasError) {
      console.log('Formulas table error:', formulasError)
    } else {
      console.log('✅ Formulas table created')
    }

    // Add user_id column to formulas if it doesn't exist
    const { error: formulasAlterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'formulas' AND column_name = 'user_id') THEN
            ALTER TABLE formulas ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
    })
    
    if (formulasAlterError) {
      console.log('Formulas alter table error:', formulasAlterError)
    } else {
      console.log('✅ Formulas user_id column added')
    }

    // Create patients table
    const { error: patientsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          identifier TEXT,
          date_of_birth TEXT,
          gender TEXT,
          contact_info TEXT,
          medical_history TEXT,
          medications JSONB DEFAULT '[]'::jsonb NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (patientsError) {
      console.log('Patients table error:', patientsError)
    } else {
      console.log('✅ Patients table created')
    }

    // Add user_id column to patients if it doesn't exist
    const { error: patientsAlterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'user_id') THEN
            ALTER TABLE patients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
    })
    
    if (patientsAlterError) {
      console.log('Patients alter table error:', patientsAlterError)
    } else {
      console.log('✅ Patients user_id column added')
    }

    // Create prescriptions table
    const { error: prescriptionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS prescriptions (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          patient_id INTEGER NOT NULL REFERENCES patients(id),
          formula_id INTEGER REFERENCES formulas(id),
          custom_formula JSONB,
          name TEXT,
          date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          status TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (prescriptionsError) {
      console.log('Prescriptions table error:', prescriptionsError)
    } else {
      console.log('✅ Prescriptions table created')
    }

    // Add user_id column to prescriptions if it doesn't exist
    const { error: prescriptionsAlterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'user_id') THEN
            ALTER TABLE prescriptions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
    })
    
    if (prescriptionsAlterError) {
      console.log('Prescriptions alter table error:', prescriptionsAlterError)
    } else {
      console.log('✅ Prescriptions user_id column added')
    }

    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT,
          email TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (usersError) {
      console.log('Users table error:', usersError)
    } else {
      console.log('✅ Users table created')
    }

    // Enable Row Level Security (RLS)
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
        ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
        ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
      `
    })
    
    if (rlsError) {
      console.log('RLS enable error:', rlsError)
    } else {
      console.log('✅ RLS enabled on all tables')
    }

    // Create RLS policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        -- Create new policies
        CREATE POLICY "Users can read their own herbs" ON herbs FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own herbs" ON herbs FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own herbs" ON herbs FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own herbs" ON herbs FOR DELETE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can read their own formulas" ON formulas FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own formulas" ON formulas FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own formulas" ON formulas FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own formulas" ON formulas FOR DELETE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can read their own patients" ON patients FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own patients" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own patients" ON patients FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own patients" ON patients FOR DELETE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can read their own prescriptions" ON prescriptions FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own prescriptions" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own prescriptions" ON prescriptions FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own prescriptions" ON prescriptions FOR DELETE USING (auth.uid() = user_id);
      `
    })
    
    if (policiesError) {
      console.log('Policies error:', policiesError)
    } else {
      console.log('✅ RLS policies created')
    }

    console.log('🎉 Database setup completed!')
    
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase() 