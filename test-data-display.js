import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ueoyqnnlpdjdmhkxyuik.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MDc4MCwiZXhwIjoyMDY5ODI2NzgwfQ.ByyBK6SnbWwnA8NVEAo5X4Dr-Jc7vmnCDA13n_JCY7Y'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDataDisplay() {
  console.log('Testing data display...')
  
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
    
    // Test the same query that your app uses
    console.log('Testing herbs query (same as your app)...')
    const { data: herbs, error: herbsError } = await supabase
      .from('herbs')
      .select('*')
      .order('pinyin_name')
    
    if (herbsError) {
      console.log('Herbs query error:', herbsError)
    } else {
      console.log('✅ Herbs query successful!')
      console.log('Number of herbs returned:', herbs.length)
      console.log('First herb:', herbs[0])
      
      if (herbs.length > 0) {
        console.log('All herb names:')
        herbs.forEach((herb, index) => {
          console.log(`${index + 1}. ${herb.pinyin_name} (${herb.chinese_name}) - User ID: ${herb.user_id}`)
        })
      }
    }
    
    // Test with user_id filter (like the old queryClient was doing)
    console.log('\nTesting herbs query with user_id filter...')
    const { data: herbsWithFilter, error: herbsFilterError } = await supabase
      .from('herbs')
      .select('*')
      .eq('user_id', user.id)
      .order('pinyin_name')
    
    if (herbsFilterError) {
      console.log('Herbs with filter query error:', herbsFilterError)
    } else {
      console.log('✅ Herbs with filter query successful!')
      console.log('Number of herbs with filter:', herbsWithFilter.length)
    }
    
    // Test the API endpoint that your app uses
    console.log('\nTesting API endpoint /api/herbs...')
    const response = await fetch('https://ueoyqnnlpdjdmhkxyuik.supabase.co/rest/v1/herbs?select=*&user_id=eq.' + user.id, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    if (response.ok) {
      const apiData = await response.json()
      console.log('✅ API endpoint successful!')
      console.log('Number of herbs from API:', apiData.length)
    } else {
      console.log('❌ API endpoint failed:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testDataDisplay()
