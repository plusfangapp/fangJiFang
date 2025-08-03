import { QueryClient } from "@tanstack/react-query";

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Error desconocido en la solicitud API");
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
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
