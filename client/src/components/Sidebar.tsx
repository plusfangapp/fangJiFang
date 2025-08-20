import { Link, useLocation } from "wouter";
import { 
  Leaf, 
  FlaskRound, 
  Users, 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  Settings,
  ChevronLeft,
  ChevronRight,
  AlignJustify,
  UserCircle,
  Plus,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  onClose?: () => void;
  expanded?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ onClose, expanded = true, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Ya no cerramos el panel automáticamente al hacer clic en un enlace
  const handleClick = () => {};

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear any stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      
      // Redirect to login page
      setLocation('/login');
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: "Hubo un problema al cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={`h-full bg-white flex flex-col p-4`}>
      {/* Hamburger button always left aligned */}
      <div className="mb-10 flex">
        <div className="rounded-xl bg-white shadow-sm flex items-center justify-center w-10 h-10 min-w-[40px]">
          <button
            onClick={onToggle}
            className="flex items-center justify-center text-gray-600 transition-all hover:text-primary"
            aria-label={expanded ? "Colapsar panel" : "Expandir panel"}
          >
            <AlignJustify className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex flex-col h-full">
        <div className="space-y-8 mt-4">
        <TooltipProvider>
          <Link href="/" onClick={handleClick}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-14">
                  <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                    <div className={cn(
                      "rounded-xl bg-[#F2F2F7] flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
                      isActive("/") && "bg-[#E5E5EA]"
                    )}>
                      <LayoutDashboard className={cn(
                        "h-5 w-5",
                        isActive("/") ? "text-primary" : "text-gray-600"
                      )} />
                    </div>
                  </div>
                  {expanded && (
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      isActive("/") && "text-primary"
                    )}>
                      {t('nav.dashboard')}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right">{t('nav.dashboard')}</TooltipContent>}
            </Tooltip>
          </Link>
        </TooltipProvider>

        <TooltipProvider>
          <Link href="/herbs" onClick={handleClick}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-14">
                  <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                    <div className={cn(
                      "rounded-xl bg-[#F2F2F7] flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
                      isActive("/herbs") && "bg-[#E5E5EA]"
                    )}>
                      <Leaf className={cn(
                        "h-5 w-5",
                        isActive("/herbs") ? "text-primary" : "text-gray-600"
                      )} />
                    </div>
                  </div>
                  {expanded && (
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      isActive("/herbs") && "text-primary"
                    )}>
                      {t('nav.herbs')}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right">{t('nav.herbs')}</TooltipContent>}
            </Tooltip>
          </Link>
        </TooltipProvider>

        <TooltipProvider>
          <Link href="/formulas" onClick={handleClick}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-14">
                  <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                    <div className={cn(
                      "rounded-xl bg-[#F2F2F7] flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
                      isActive("/formulas") && "bg-[#E5E5EA]"
                    )}>
                      <FlaskRound className={cn(
                        "h-5 w-5",
                        isActive("/formulas") ? "text-primary" : "text-gray-600"
                      )} />
                    </div>
                  </div>
                  {expanded && (
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      isActive("/formulas") && "text-primary"
                    )}>
                      {t('nav.formulas')}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right">{t('nav.formulas')}</TooltipContent>}
            </Tooltip>
          </Link>
        </TooltipProvider>

        <TooltipProvider>
          <Link href="/patients" onClick={handleClick}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-14">
                  <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                    <div className={cn(
                      "rounded-xl bg-[#F2F2F7] flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
                      isActive("/patients") && "bg-[#E5E5EA]"
                    )}>
                      <Users className={cn(
                        "h-5 w-5",
                        isActive("/patients") ? "text-primary" : "text-gray-600"
                      )} />
                    </div>
                  </div>
                  {expanded && (
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      isActive("/patients") && "text-primary"
                    )}>
                      {t('nav.patients')}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right">{t('nav.patients')}</TooltipContent>}
            </Tooltip>
          </Link>
        </TooltipProvider>

        <TooltipProvider>
          <Link href="/prescriptions" onClick={handleClick}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-14">
                  <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                    <div className={cn(
                      "rounded-xl bg-[#F2F2F7] flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
                      isActive("/prescriptions") && "bg-[#E5E5EA]"
                    )}>
                      <FileText className={cn(
                        "h-5 w-5",
                        isActive("/prescriptions") ? "text-primary" : "text-gray-600"
                      )} />
                    </div>
                  </div>
                  {expanded && (
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      isActive("/prescriptions") && "text-primary"
                    )}>
                      {t('nav.prescriptions')}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right">{t('nav.prescriptions')}</TooltipContent>}
            </Tooltip>
          </Link>
        </TooltipProvider>
        </div>

        {/* New Prescription button */}
        <div className="mt-auto mb-4">
          <TooltipProvider>
            <Link href="/prescriptions/new" onClick={handleClick}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center h-14">
                    <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                      <div className="rounded-xl bg-primary flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    {expanded && (
                      <span className={`text-sm font-medium text-primary ${expanded ? 'ml-6' : 'ml-3'}`}>
                        New Prescription
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                {!expanded && <TooltipContent side="right">New Prescription</TooltipContent>}
              </Tooltip>
            </Link>
          </TooltipProvider>
        </div>

        {/* Logout button */}
        <div className="mb-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="w-full">
                  <div className="flex items-center h-14">
                    <div className={`flex ${expanded ? 'justify-start pl-8 w-20' : 'justify-center w-24'}`}>
                      <div className="rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center w-10 h-10 min-w-[40px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-colors">
                        <LogOut className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    {expanded && (
                      <span className={`text-sm font-medium text-red-600 ${expanded ? 'ml-6' : 'ml-3'}`}>
                        Cerrar Sesión
                      </span>
                    )}
                  </div>
                </button>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right">Cerrar Sesión</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>

    </div>
  );
}