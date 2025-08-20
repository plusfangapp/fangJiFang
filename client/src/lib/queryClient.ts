import { QueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Error desconocido en la solicitud API");
  }
}

// Legacy apiRequest function - keeping for backward compatibility but it will be deprecated
export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  console.warn('apiRequest is deprecated. Use Supabase API functions instead.');
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    credentials: 'include',
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  return fetch(url, options);
}

// Cache para reducir consultas repetidas a la API
const responseCache = new Map();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        
        // Handle Supabase API calls
        if (url.startsWith('/api/')) {
          // Map old API endpoints to Supabase functions
          const endpoint = url.replace('/api/', '');
          
          try {
            let data;
            
            // Get current authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
              throw new Error('User not authenticated');
            }

            switch (endpoint) {
              case 'herbs':
                const { data: herbs, error: herbsError } = await supabase
                  .from('herbs')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('pinyin_name');
                if (herbsError) throw herbsError;
                data = herbs;
                break;
                
              case 'formulas':
                const { data: formulas, error: formulasError } = await supabase
                  .from('formulas')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('pinyin_name');
                if (formulasError) throw formulasError;
                data = formulas;
                break;
                
              case 'patients':
                const { data: patients, error: patientsError } = await supabase
                  .from('patients')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('name');
                if (patientsError) throw patientsError;
                data = patients;
                break;
                
              case 'prescriptions':
                const { data: prescriptions, error: prescriptionsError } = await supabase
                  .from('prescriptions')
                  .select(`
                    *,
                    patient:patients(name),
                    formula:formulas(pinyin_name, chinese_name)
                  `)
                  .eq('user_id', user.id)
                  .order('date_created', { ascending: false });
                if (prescriptionsError) throw prescriptionsError;
                data = prescriptions;
                break;
                
              default:
                // For specific ID requests
                if (endpoint.includes('/')) {
                  const parts = endpoint.split('/');
                  
                  if (parts.length === 2) {
                    // Simple ID request like "patients/123"
                    const [table, id] = parts;
                    const { data: item, error } = await supabase
                      .from(table)
                      .select('*')
                      .eq('id', id)
                      .eq('user_id', user.id)
                      .single();
                    if (error) throw error;
                    data = item;
                  } else if (parts.length === 3 && parts[0] === 'patients' && parts[2] === 'prescriptions') {
                    // Handle patient prescriptions like "patients/123/prescriptions"
                    const patientId = parts[1];
                    const { data: patientPrescriptions, error } = await supabase
                      .from('prescriptions')
                      .select(`
                        *,
                        patient:patients(name),
                        formula:formulas(pinyin_name, chinese_name)
                      `)
                      .eq('patient_id', patientId)
                      .eq('user_id', user.id)
                      .order('date_created', { ascending: false });
                    if (error) throw error;
                    data = patientPrescriptions;
                  } else {
                    throw new Error(`Unknown endpoint: ${endpoint}`);
                  }
                } else {
                  throw new Error(`Unknown endpoint: ${endpoint}`);
                }
            }
            
            return data;
          } catch (error) {
            console.warn("CRITICAL_LOG", `Error en solicitud a ${url}:`, error);
            throw error;
          }
        }
        
        // Verificar si la respuesta está en caché y es reciente (menos de 2 minutos)
        const cachedData = responseCache.get(url);
        if (cachedData && (Date.now() - cachedData.timestamp < 120000)) {
          return cachedData.data;
        }
        
        try {
          const response = await apiRequest('GET', url, null);
          if (!response.ok) {
            throw new Error('Error en la solicitud');
          }
          
          const data = await response.json();
          
          // Guardar en caché con timestamp
          responseCache.set(url, {
            data,
            timestamp: Date.now()
          });
          
          return data;
        } catch (error) {
          console.warn("CRITICAL_LOG", `Error en solicitud a ${url}:`, error);
          throw error;
        }
      },
      // Desactivar recargas automáticas para mejorar rendimiento
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
      staleTime: 2 * 60 * 1000, // 2 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1, // Solo un intento de reintento
    },
  },
});
