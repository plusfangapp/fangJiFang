import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ueoyqnnlpdjdmhkxyuik.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MDc4MCwiZXhwIjoyMDY5ODI2NzgwfQ.ByyBK6SnbWwnA8NVEAo5X4Dr-Jc7vmnCDA13n_JCY7Y'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('Testing authentication...')
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('Auth error:', authError)
      return
    }
    
    if (!user) {
      console.log('No user authenticated')
      return
    }
    
    console.log('User authenticated:', user.id)
    console.log('User email:', user.email)
    
    // Try to insert a test herb
    const testHerb = {
      pinyin_name: "Test Herb",
      chinese_name: "测试草药",
      english_name: "Test Herb",
      category: "Test Category",
      nature: "neutral",
      flavor: "sweet",
      user_id: user.id
    }
    
    const { data: herbData, error: herbError } = await supabase
      .from('herbs')
      .insert(testHerb)
      .select()
      .single()
    
    if (herbError) {
      console.log('Herb insert error:', herbError)
    } else {
      console.log('Herb inserted successfully:', herbData)
    }
    
    // Try to read herbs
    const { data: herbs, error: herbsError } = await supabase
      .from('herbs')
      .select('*')
      .limit(5)
    
    if (herbsError) {
      console.log('Herbs read error:', herbsError)
    } else {
      console.log('Herbs read successfully:', herbs.length, 'herbs found')
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testAuth()
