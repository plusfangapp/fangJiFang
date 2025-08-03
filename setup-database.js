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

    // Create formulas table
    const { error: formulasError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS formulas (
          id SERIAL PRIMARY KEY,
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

    // Create patients table
    const { error: patientsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
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

    // Create prescriptions table
    const { error: prescriptionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS prescriptions (
          id SERIAL PRIMARY KEY,
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

    console.log('🎉 Database setup completed!')
    
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase() 