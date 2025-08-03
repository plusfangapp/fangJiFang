import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

// Define el tipo para el contexto
type SidebarContextType = {
  sidebarExpanded: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
};

// Crea el contexto con un valor por defecto
const SidebarContext = createContext<SidebarContextType>({
  sidebarExpanded: true,
  isMobile: false,
  toggleSidebar: () => {}
});

// Hook personalizado para usar el contexto
export const useSidebar = () => useContext(SidebarContext);

// Proveedor del contexto
interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const isMobile = useIsMobile();

  // En dispositivos móviles, la barra lateral está cerrada por defecto
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setSidebarExpanded(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      // En móvil, abre/cierra el panel completamente
      setSidebarOpen(!sidebarOpen);
    } else {
      // En escritorio, expande/colapsa el panel (siempre visible)
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  return (
    <SidebarContext.Provider 
      value={{ 
        sidebarExpanded: isMobile ? sidebarOpen : sidebarExpanded,
        isMobile,
        toggleSidebar 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};