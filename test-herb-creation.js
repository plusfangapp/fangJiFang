import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ueoyqnnlpdjdmhkxyuik.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MDc4MCwiZXhwIjoyMDY5ODI2NzgwfQ.ByyBK6SnbWwnA8NVEAo5X4Dr-Jc7vmnCDA13n_JCY7Y'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testHerbCreation() {
  console.log('Testing herb creation with user_id...')
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('Auth error:', authError)
      return
    }
    
    if (!user) {
      console.log('No user authenticated - please log in first')
      return
    }
    
    console.log('User authenticated:', user.id)
    console.log('User email:', user.email)
    
    // Test herb data (similar to what your app sends)
    const testHerb = {
      pinyin_name: "Test Herb",
      chinese_name: "测试草药",
      latin_name: "Test",
      english_name: "Test",
      category: "Clearing Herbs",
      nature: "hot",
      flavor: "bitter",
      toxicity: "Baja toxicidad",
      meridians: ["Lung", "Spleen", "Bladder", "Triple Burner"],
      dosage: "Test",
      contraindications: "Test",
      pregnancy_considerations: "Test",
      herb_drug_interactions: [],
      notes: "Test",
      functions: ["Test"],
      applications: "Test",
      pharmacological_effects: [],
      laboratory_effects: []
    }
    
    console.log('Attempting to insert herb with user_id:', user.id)
    
    // Try to insert the herb (this should include user_id automatically)
    const { data: herbData, error: herbError } = await supabase
      .from('herbs')
      .insert({ ...testHerb, user_id: user.id })
      .select()
      .single()
    
    if (herbError) {
      console.log('Herb insert error:', herbError)
      console.log('Error details:', herbError.details)
      console.log('Error hint:', herbError.hint)
    } else {
      console.log('✅ Herb inserted successfully!')
      console.log('Inserted herb data:', herbData)
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testHerbCreation()
