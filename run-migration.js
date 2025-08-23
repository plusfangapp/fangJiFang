import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://ueoyqnnlpdjdmhkxyuik.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MDc4MCwiZXhwIjoyMDY5ODI2NzgwfQ.ByyBK6SnbWwnA8NVEAo5X4Dr-Jc7vmnCDA13n_JCY7Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running herb schema migration...')
  
  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync('fix-herb-schema.sql', 'utf8')
    
    console.log('Executing migration...')
    
    // Execute the migration using RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      console.error('Migration error:', error)
      return
    }
    
    console.log('✅ Migration completed successfully')
    console.log('Schema verification results:', data)
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigration()
