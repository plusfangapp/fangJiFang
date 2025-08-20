import { supabase } from './supabase'
import type { Database } from './supabase'

type Herb = Database['public']['Tables']['herbs']['Row']
type InsertHerb = Database['public']['Tables']['herbs']['Insert']
type UpdateHerb = Database['public']['Tables']['herbs']['Update']

type Formula = Database['public']['Tables']['formulas']['Row']
type InsertFormula = Database['public']['Tables']['formulas']['Insert']
type UpdateFormula = Database['public']['Tables']['formulas']['Update']

type Patient = Database['public']['Tables']['patients']['Row']
type InsertPatient = Database['public']['Tables']['patients']['Insert']
type UpdatePatient = Database['public']['Tables']['patients']['Update']

type Prescription = Database['public']['Tables']['prescriptions']['Row']
type InsertPrescription = Database['public']['Tables']['prescriptions']['Insert']
type UpdatePrescription = Database['public']['Tables']['prescriptions']['Update']

type User = Database['public']['Tables']['users']['Row']
type InsertUser = Database['public']['Tables']['users']['Insert']
type UpdateUser = Database['public']['Tables']['users']['Update']

// Herbs API
export const herbsApi = {
  async getAll() {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('herbs')
      .select('*')
      .eq('user_id', user.id)
      .order('pinyin_name')
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('herbs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(herb: InsertHerb) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('herbs')
      .insert({ ...herb, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, herb: UpdateHerb) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('herbs')
      .update(herb)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('herbs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  },

  async search(query: string) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('herbs')
      .select('*')
      .eq('user_id', user.id)
      .or(`pinyin_name.ilike.%${query}%,chinese_name.ilike.%${query}%,english_name.ilike.%${query}%`)
      .order('pinyin_name')
    
    if (error) throw error
    return data
  }
}

// Formulas API
export const formulasApi = {
  async getAll() {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('user_id', user.id)
      .order('pinyin_name')
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(formula: InsertFormula) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('formulas')
      .insert({ ...formula, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, formula: UpdateFormula) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('formulas')
      .update(formula)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('formulas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  },

  async search(query: string) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('user_id', user.id)
      .or(`pinyin_name.ilike.%${query}%,chinese_name.ilike.%${query}%,english_name.ilike.%${query}%`)
      .order('pinyin_name')
    
    if (error) throw error
    return data
  }
}

// Patients API
export const patientsApi = {
  async getAll() {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(patient: InsertPatient) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('patients')
      .insert({ ...patient, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, patient: UpdatePatient) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

// Prescriptions API
export const prescriptionsApi = {
  async getAll() {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(name),
        formula:formulas(pinyin_name, chinese_name)
      `)
      .eq('user_id', user.id)
      .order('date_created', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(*),
        formula:formulas(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(prescription: InsertPrescription) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({ ...prescription, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, prescription: UpdatePrescription) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .update(prescription)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

// Users API
export const usersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username')
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(user: InsertUser) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, user: UpdateUser) {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
} 