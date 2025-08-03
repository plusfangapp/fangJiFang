/**
 * Funciones de optimización de rendimiento para mejorar la 
 * velocidad de la aplicación en entornos con recursos limitados
 */

// Objeto para almacenar en caché los resultados de funciones costosas
const memoCache = new Map();

/**
 * Función para memoizar resultados de funciones costosas
 */
export function memoize<T>(fn: (...args: any[]) => T, keyFn?: (...args: any[]) => string): (...args: any[]) => T {
  return (...args: any[]): T => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    const result = fn(...args);
    memoCache.set(key, result);
    return result;
  };
}

/**
 * Limitar el número de logs en consola para mejorar rendimiento
 */
export function setupPerformanceMode(): void {
  // Guardar los métodos originales
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleDebug = console.debug;

  // Reemplazar console.log para reducir logs no críticos
  console.log = function(...args: any[]) {
    if (args[0] === "CRITICAL_LOG") {
      originalConsoleLog.apply(console, args.slice(1));
    }
  };

  // Reemplazar console.debug completamente
  console.debug = function() {};
  
  // Reemplazar console.info para mostrar solo logs críticos
  console.info = function(...args: any[]) {
    if (args[0] === "CRITICAL_INFO") {
      originalConsoleInfo.apply(console, args.slice(1));
    }
  };

  // Advertir que el modo de rendimiento está activado
  console.warn("Performance mode enabled: console logs disabled");
}

/**
 * Función para debounce de eventos
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Optimizar arrays grandes aplicando técnicas de paginación en memoria
 */
export function optimizeArrayProcessing<T, R>(
  array: T[],
  processFn: (item: T) => R,
  batchSize: number = 100
): R[] {
  const result: R[] = [];
  const totalItems = array.length;
  
  // Procesar por lotes para evitar bloquear el hilo principal
  for (let i = 0; i < totalItems; i += batchSize) {
    const end = Math.min(i + batchSize, totalItems);
    const batch = array.slice(i, end);
    
    // Procesar cada elemento del lote
    batch.forEach(item => {
      result.push(processFn(item));
    });
  }
  
  return result;
}

/**
 * Optimizar renderizado de listas largas
 */
export function optimizeListRendering<T>(
  items: T[],
  pageSize: number = 20
): { 
  getVisibleItems: (page: number) => T[],
  getTotalPages: () => number 
} {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    getVisibleItems: (page: number) => {
      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, totalItems);
      return items.slice(start, end);
    },
    getTotalPages: () => totalPages
  };
}