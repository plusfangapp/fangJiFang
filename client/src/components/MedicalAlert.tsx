import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MedicalAlertProps {
  contraindications: string;
  cautions: string;
  condition: { name: string; active: boolean };
}

export const MedicalAlert: React.FC<MedicalAlertProps> = ({
  contraindications,
  cautions,
  condition
}) => {
  if (!condition.active) return null;

  const conditionName = condition.name.toLowerCase();
  const warningText = `${condition.name}`;
  
  // Convertir a minúsculas para comparación
  const lowerContraindications = (contraindications || "").toLowerCase();
  const lowerCautions = (cautions || "").toLowerCase();
  
  // Buscar si esta condición aparece en las contraindicaciones o precauciones
  const hasContraindication = lowerContraindications.includes(conditionName);
  const hasCaution = lowerCautions.includes(conditionName);
  
  // Si no hay coincidencias, no mostramos nada
  if (!hasContraindication && !hasCaution) {
    // Para propósitos de prueba, si hay una condición médica activa, siempre mostraremos una alerta
    // Eliminar esta línea cuando ya funcione correctamente en producción
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative inline-flex">
              <span className="flex items-center justify-center bg-blue-100 text-blue-600 p-1.5 rounded-md cursor-help border-2 border-blue-300">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-blue-50 border-2 border-blue-300">
            <div>
              <p className="font-medium">Condición activa: {warningText}</p>
              <p className="text-xs">Revisar posibles contraindicaciones o precauciones</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Mostrar alerta de contraindicación
  if (hasContraindication) {
    return (
      <div className="relative inline-flex">
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center justify-center bg-red-100 text-red-600 p-1.5 rounded-md cursor-help border-2 border-red-300">
                <AlertCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-red-50 border-2 border-red-300">
              <div>
                <p className="font-bold text-red-700">¡CONTRAINDICACIÓN!</p>
                <p className="text-sm">Contraindicado en {warningText}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  // Mostrar alerta de precaución
  if (hasCaution) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center justify-center bg-amber-100 text-amber-600 p-1.5 rounded-md cursor-help border-2 border-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-amber-50 border-2 border-amber-300">
            <div>
              <p className="font-bold text-amber-700">PRECAUCIÓN</p>
              <p className="text-sm">Precaución en {warningText}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return null;
};

export default MedicalAlert;