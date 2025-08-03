import { useCallback } from "react";

export function useAuth() {
  // Usuario administrador simulado
  const user = {
    id: 1,
    email: "admin@example.com",
    role: "admin",
    fullName: "Administrador"
  };
  
  // Función de cierre de sesión que no hace nada
  const logout = useCallback(() => {
    console.log('Logout simulado');
  }, []);
  
  // Función refetch simulada
  const refetch = useCallback(() => {
    console.log('Refetch simulado');
    return Promise.resolve({ data: user });
  }, []);

  return {
    user,
    isLoading: false,
    isAuthenticated: true,
    isAdmin: true,
    logout,
    refetch,
  };
}