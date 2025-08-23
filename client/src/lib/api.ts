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
type InsertPrescription = Database['public']['Tables']['prescriptions']['Insert'] & {
  dateCreated?: string;
  items?: any[];
  diagnosis?: string;
  instructions?: string;
  duration?: string;
}
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
  },

  async import(herbsData: any[]) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Transform and clean the data before insertion
    const transformedHerbs = herbsData.map(herb => {
      const transformed = {
        ...herb,
        user_id: user.id
      };

      // Handle field transformations
      if (transformed.references && !transformed.reference_list) {
        transformed.reference_list = transformed.references;
        delete transformed.references; // Remove the old field name
      }

      // Ensure JSONB fields are properly formatted
      if (typeof transformed.contraindications === 'string') {
        try {
          transformed.contraindications = JSON.parse(transformed.contraindications);
        } catch (e) {
          // Keep as string if it's not valid JSON
        }
      }

      if (typeof transformed.cautions === 'string') {
        try {
          transformed.cautions = JSON.parse(transformed.cautions);
        } catch (e) {
          // Keep as string if it's not valid JSON
        }
      }

      // Remove any undefined or null values that might cause issues
      Object.keys(transformed).forEach(key => {
        if (transformed[key] === undefined) {
          delete transformed[key];
        }
      });

      return transformed;
    });

    const { data, error } = await supabase
      .from('herbs')
      .insert(transformedHerbs)
      .select()
    
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
  },

  async getFormulaWithComposition(id: number) {
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

    // Parse composition if it's a string
    if (data.composition && typeof data.composition === 'string') {
      try {
        data.composition = JSON.parse(data.composition);
      } catch (e) {
        console.error('Error parsing formula composition:', e);
      }
    }

    return data
  },

  async import(formulasData: any[]) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Transform the data to handle field mappings
    const transformedFormulas = formulasData.map(formula => {
      const transformed = { ...formula };
      
      // Handle field transformations
      if (transformed.references && !transformed.reference_list) {
        transformed.reference_list = transformed.references;
        delete transformed.references; // Remove the old field name
      }
      
      return transformed;
    });

    // Add user_id to all formulas
    const formulasWithUserId = transformedFormulas.map(formula => ({
      ...formula,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('formulas')
      .insert(formulasWithUserId)
      .select()
    
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

    // Transform the prescription data to match database schema
    const transformedPrescription = {
      ...prescription,
      user_id: user.id,
      // Map dateCreated to date_created if provided
      date_created: prescription.dateCreated || prescription.date_created || new Date().toISOString(),
      // Ensure status has a default value
      status: prescription.status || 'active'
    };

    // Remove items from the prescription data as it's stored in custom_formula
    const { items, ...prescriptionData } = transformedPrescription;

    const { data, error } = await supabase
      .from('prescriptions')
      .insert(prescriptionData)
      .select(`
        *,
        patient:patients(name),
        formula:formulas(pinyin_name, chinese_name)
      `)
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