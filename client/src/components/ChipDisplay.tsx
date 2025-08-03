import React from 'react';
import { Badge } from "@/components/ui/badge";

type ChipDisplayProps = {
  data: string | string[] | null | undefined;
  bgColor: string;
  textColor: string;
  borderColor: string;
  emptyMessage?: string;
};

/**
 * Componente reutilizable para mostrar datos como chips
 * Acepta datos en formato string, array o string con saltos de línea
 */
const ChipDisplay: React.FC<ChipDisplayProps> = ({
  data,
  bgColor,
  textColor,
  borderColor,
  emptyMessage = "Sin datos disponibles"
}) => {
  if (!data) {
    return <p className="text-muted-foreground italic">{emptyMessage}</p>;
  }

  // Si es un array, mapear directamente a chips
  if (Array.isArray(data)) {
    return (
      <>
        {data.length > 0 ? (
          data.map((item, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`${bgColor} ${textColor} ${borderColor}`}
            >
              {item}
            </Badge>
          ))
        ) : (
          <p className="text-muted-foreground italic">{emptyMessage}</p>
        )}
      </>
    );
  }

  // Si es un string
  if (typeof data === 'string') {
    let items: string[] = [];
    
    // Verificar si es un array en formato JSON
    if (data.trim().startsWith('[')) {
      try {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          items = parsedData.map(item => typeof item === 'string' ? item.trim() : String(item));
        }
      } catch (e) {
        // Si no se puede analizar como JSON, continuar con otras opciones
      }
    }
    
    // Si no se pudo analizar como JSON y tiene saltos de línea
    if (items.length === 0 && data.includes('\n')) {
      items = data.split('\n').filter(Boolean).map(item => item.trim());
    }
    
    // Si no tiene saltos de línea pero tiene comas, dividir por comas
    if (items.length === 0 && data.includes(',')) {
      items = data.split(',').filter(Boolean).map(item => item.trim());
    }
    
    // Si obtuvimos elementos de cualquiera de los métodos anteriores
    if (items.length > 0) {
      return (
        <>
          {items.map((item, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`${bgColor} ${textColor} ${borderColor}`}
            >
              {item}
            </Badge>
          ))}
        </>
      );
    }
    
    // Si es un string simple
    return (
      <Badge 
        variant="outline" 
        className={`${bgColor} ${textColor} ${borderColor} px-3 py-1`}
      >
        {data}
      </Badge>
    );
  }

  return <p className="text-muted-foreground italic">{emptyMessage}</p>;
};

export default ChipDisplay;