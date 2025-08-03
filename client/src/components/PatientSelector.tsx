import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Patient } from "@/types";
import { supabase } from "@/lib/supabase";

interface PatientSelectorProps {
  onSelectPatient: (patient: Patient) => void;
  updatePrescriptionNumber?: (number: string) => void;
}

export default function PatientSelector({ onSelectPatient, updatePrescriptionNumber }: PatientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Consultar pacientes
  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const handleSelectPatient = async (patientId: string) => {
    const selectedPatient = patients.find(p => p.id.toString() === patientId);
    if (selectedPatient) {
      setValue(patientId);
      onSelectPatient(selectedPatient);
      
      // Obtener prescripciones del paciente para actualizar el número
      if (updatePrescriptionNumber) {
        try {
          const { data: prescriptions, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('patientId', selectedPatient.id);
          
          if (error) throw error;
          
          let newNumber = '1';
          if (prescriptions && prescriptions.length > 0) {
            // Suponiendo que la numeración es secuencial, tomamos la cantidad + 1
            newNumber = (prescriptions.length + 1).toString();
          }
          
          updatePrescriptionNumber(newNumber);
        } catch (error) {
          console.error("Error al obtener prescripciones del paciente:", error);
        }
      }
      
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium mb-1">
          Seleccionar Paciente Existente
        </label>
        <div className="text-xs text-muted-foreground italic">
          <UserPlus className="h-3 w-3 mr-1 inline-block" />
          Nuevos datos = Nuevo paciente
        </div>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {value
              ? patients.find(patient => patient.id.toString() === value)?.name
              : "Seleccionar paciente..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[300px]">
          <Command>
            <CommandInput placeholder="Buscar paciente..." />
            <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.id.toString()}
                    onSelect={handleSelectPatient}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === patient.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {patient.contactInfo ? `${patient.contactInfo}` : ''} 
                        {patient.identifier ? (patient.contactInfo ? ' · ' : '') + patient.identifier : ''}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}