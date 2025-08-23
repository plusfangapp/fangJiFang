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
      // Map camelCase field names to snake_case field names
      const transformed = {
        user_id: user.id,
        // Basic Information
        pinyin_name: herb.pinyinName || herb.pinyin_name,
        chinese_name: herb.chineseName || herb.chinese_name,
        latin_name: herb.latinName || herb.latin_name,
        english_name: herb.englishName || herb.english_name,
        category: herb.category,
        
        // TCM Properties
        nature: herb.nature,
        flavor: herb.flavor,
        toxicity: herb.toxicity,
        meridians: herb.meridians,
        
        // Usage Information
        dosage: herb.dosage,
        preparation: herb.preparation,
        
        // Detailed Properties
        primary_functions: herb.primaryFunctions || herb.primary_functions,
        clinical_patterns: herb.clinicalPatterns || herb.clinical_patterns,
        therapeutic_actions: herb.therapeuticActions || herb.therapeutic_actions,
        tcm_actions: herb.tcmActions || herb.tcm_actions,
        combinations: herb.combinations,
        synergistic_pairs: herb.synergisticPairs || herb.synergistic_pairs,
        antagonistic_pairs: herb.antagonisticPairs || herb.antagonistic_pairs,
        
        // Clinical Information
        standard_indications: herb.standardIndications || herb.standard_indications,
        special_indications: herb.specialIndications || herb.special_indications,
        preparation_methods: herb.preparationMethods || herb.preparation_methods,
        contraindications: herb.contraindications,
        cautions: herb.cautions,
        pregnancy_considerations: herb.pregnancyConsiderations || herb.pregnancy_considerations,
        
        // Research and Evidence
        biological_effects: herb.biologicalEffects || herb.biological_effects,
        clinical_evidence: herb.clinicalEvidence || herb.clinical_evidence,
        herb_drug_interactions: herb.herbDrugInteractions || herb.herb_drug_interactions,
        references_list: herb.referenceList || herb.references || herb.references_list,
        
        // Additional Information
        properties: herb.properties,
        notes: herb.notes,
        functions: herb.functions,
        applications: herb.applications,
        secondary_actions: herb.secondaryActions || herb.secondary_actions,
        common_combinations: herb.commonCombinations || herb.common_combinations,
        pharmacological_effects: herb.pharmacologicalEffects || herb.pharmacological_effects,
        laboratory_effects: herb.laboratoryEffects || herb.laboratory_effects,
        clinical_studies_and_research: herb.clinicalStudiesAndResearch || herb.clinical_studies_and_research
      };

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
        if ((transformed as any)[key] === undefined) {
          delete (transformed as any)[key];
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
      // Map camelCase field names to snake_case field names
      const transformed = {
        user_id: user.id,
        // Basic Information
        pinyin_name: formula.pinyinName || formula.pinyin_name,
        chinese_name: formula.chineseName || formula.chinese_name || formula.pinyin_name || 'Unknown',
        english_name: formula.englishName || formula.english_name,
        category: formula.category,
        
        // Clinical Information
        actions: formula.actions,
        indications: formula.indications,
        clinical_manifestations: formula.clinicalManifestations || formula.clinical_manifestations,
        clinical_applications: formula.clinicalApplications || formula.clinical_applications,
        contraindications: formula.contraindications,
        cautions: formula.cautions,
        
        // Research and Effects
        pharmacological_effects: formula.pharmacologicalEffects || formula.pharmacological_effects,
        research: formula.research,
        herb_drug_interactions: formula.herbDrugInteractions || formula.herb_drug_interactions,
        references_list: formula.referenceList || formula.references || formula.references_list,
        
        // Composition
        composition: formula.composition ? (Array.isArray(formula.composition) ? formula.composition.map((herb: any) => ({
          herbId: herb.herbId || herb.herb_id || '',
          pinyinName: herb.pinyinName || herb.pinyin_name || herb.name || '',
          dosage: herb.dosage || '',
          function: herb.function || '',
          percentage: herb.percentage || '',
          grams: herb.grams || '',
          chineseName: herb.chineseName || herb.chinese_name || ''
        })) : formula.composition) : []
      };

      // Ensure proper data types for specific fields
      if (transformed.clinical_manifestations && Array.isArray(transformed.clinical_manifestations)) {
        transformed.clinical_manifestations = transformed.clinical_manifestations.join('; ');
      }

      if (transformed.clinical_applications && Array.isArray(transformed.clinical_applications)) {
        transformed.clinical_applications = transformed.clinical_applications.join('; ');
      }

      if (transformed.pharmacological_effects && Array.isArray(transformed.pharmacological_effects)) {
        transformed.pharmacological_effects = transformed.pharmacological_effects.join('; ');
      }

      if (transformed.herb_drug_interactions && Array.isArray(transformed.herb_drug_interactions)) {
        transformed.herb_drug_interactions = transformed.herb_drug_interactions.join('; ');
      }

      // Ensure references_list is always an array
      if (transformed.references_list && !Array.isArray(transformed.references_list)) {
        transformed.references_list = [transformed.references_list];
      }

      // Ensure required fields have values
      if (!transformed.pinyin_name) {
        transformed.pinyin_name = 'Unknown Formula';
      }
      
      if (!transformed.chinese_name) {
        transformed.chinese_name = transformed.pinyin_name || 'Unknown';
      }

      // Remove any undefined or null values that might cause issues
      Object.keys(transformed).forEach(key => {
        if ((transformed as any)[key] === undefined) {
          delete (transformed as any)[key];
        }
      });
      
      return transformed;
    });

    const { data, error } = await supabase
      .from('formulas')
      .insert(transformedFormulas)
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
        patient:patients(name)
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
        patient:patients(*)
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
        patient:patients(name)
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
  },

  async getFormulaDetails(formulaId: number) {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('id', formulaId)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
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