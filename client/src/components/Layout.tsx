import { Link, useLocation } from "wouter";
import Sidebar from "./Sidebar";
import { X, AlignJustify, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSelector } from "./color-selector";
import { useLanguage } from "@/lib/language-context";
import { useSidebar } from "@/lib/sidebar-context";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import WelcomePopup from "./WelcomePopup";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useLanguage();
  const { sidebarExpanded, isMobile, toggleSidebar } = useSidebar();
  // Simulamos un usuario autenticado para acceder a todas las secciones
  const user = { fullName: 'Medicina China', role: 'admin' };
  const isAuthenticated = true;
  const [location, setLocation] = useLocation();

  const logout = () => {
    // Esta función no hace nada realmente, solo está para evitar errores
    console.log('Función de logout llamada');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 border-b bg-white h-16 flex items-center px-4 md:px-6 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="shrink-0"
                aria-label={sidebarExpanded ? t('layout.hide_sidebar') : t('layout.show_sidebar')}
              >
                <AlignJustify className="h-5 w-5" />
              </Button>
            )}
            <Link href="/" className="font-bold text-xl flex items-center">
              <span className="text-primary">{t('app.title')}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">


            {/* Perfil de usuario - menú desplegable */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer rounded-full p-1">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    {localStorage.getItem('userImage') ? (
                      <img 
                        src={localStorage.getItem('userImage') || ''} 
                        alt="Avatar de usuario" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          localStorage.removeItem('userImage');
                          // Forzar re-renderizado tras un error
                          setTimeout(() => {
                            window.location.reload();
                          }, 100);
                        }}
                      />
                    ) : (
                      <div 
                        className="h-full w-full flex items-center justify-center text-white"
                        style={{ backgroundColor: localStorage.getItem('avatarColor') || '#4F46E5' }}
                      >
                        <span className="font-medium text-xs">
                          {user?.fullName 
                            ? user.fullName.split(' ').map((name: string) => name.charAt(0)).join('').substring(0, 2).toUpperCase()
                            : (localStorage.getItem('userName') || 'DU')
                              .split(' ')
                              .map((name: string) => name.charAt(0))
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline pr-2">
                    {user?.fullName || localStorage.getItem('userName') || 'Usuario'}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/account" className="w-full cursor-pointer">
                    My Account
                  </Link>
                </DropdownMenuItem>
                {isAuthenticated && user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full cursor-pointer">
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative pt-16">
        {/* Panel lateral móvil (superposición) */}
        {isMobile && sidebarExpanded && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-lg">
              <div className="flex h-16 items-center justify-between px-4">
                <Link href="/" className="font-bold text-xl">
                  <span className="text-primary">{t('app.title')}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Sidebar onClose={() => toggleSidebar()} expanded={true} />
            </div>
          </div>
        )}

        {/* Panel lateral de escritorio (siempre visible, pero expansible/colapsable) */}
        {!isMobile && (
          <div 
            className={`fixed left-0 top-16 bottom-0 border-r bg-white transition-all duration-300 ease-in-out shadow-sm z-30 ${
              sidebarExpanded ? 'w-72' : 'w-20'
            }`}
          >
            <Sidebar 
              expanded={sidebarExpanded} 
              onToggle={toggleSidebar}
            />
          </div>
        )}

        <main className={`flex-1 h-[calc(100vh-4rem)] overflow-auto p-6 ${!isMobile ? (sidebarExpanded ? 'ml-72' : 'ml-16') : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}