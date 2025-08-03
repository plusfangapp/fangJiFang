import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Medication } from "@/types";
import { apiRequest } from "@/lib/queryClient";

interface MedicationFormData {
  id?: number;
  name: string;
  description: string;
  dosage: string;
  frequency: string;
  notes: string;
}

export function MedicationsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: "",
    description: "",
    dosage: "",
    frequency: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultar medicamentos
  const { data: medications, isLoading } = useQuery({
    queryKey: ["/api/medications"],
    refetchOnWindowFocus: false,
  });

  // Crear/editar medicamento
  const saveMutation = useMutation({
    mutationFn: async (data: MedicationFormData) => {
      if (isEditMode && data.id) {
        // Editar medicamento existente
        return apiRequest("PATCH", `/api/medications/${data.id}`, data);
      } else {
        // Crear nuevo medicamento
        return apiRequest("POST", "/api/medications", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["/api/medications"]});
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: `Medicamento ${isEditMode ? "actualizado" : "creado"} correctamente`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: `Error al ${isEditMode ? "actualizar" : "crear"} el medicamento`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Eliminar medicamento
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/medications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["/api/medications"]});
      toast({
        title: "Medicamento eliminado correctamente",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar el medicamento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      dosage: "",
      frequency: "",
      notes: ""
    });
    setIsEditMode(false);
  }

  function handleOpenNewDialog() {
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditMedication(medication: Medication) {
    setFormData({
      id: medication.id,
      name: medication.name,
      description: medication.description || "",
      dosage: medication.dosage || "",
      frequency: medication.frequency || "",
      notes: medication.notes || ""
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  }

  function handleDeleteMedication(id: number) {
    if (window.confirm("¿Estás seguro de que deseas eliminar este medicamento?")) {
      deleteMutation.mutate(id);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medicamentos</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenNewDialog}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" /> Añadir Medicamento
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !medications || !Array.isArray(medications) || medications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No hay medicamentos registrados.</p>
          <Button 
            variant="link" 
            onClick={handleOpenNewDialog}
            className="mt-2"
          >
            Añadir medicamento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {medications.map((medication: Medication) => (
            <div 
              key={medication.id}
              className="bg-white rounded-lg p-4 border shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">{medication.name}</h4>
              </div>
              
              {medication.dosage && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Dosificación:</span> {medication.dosage}
                </p>
              )}
              
              {medication.frequency && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Frecuencia:</span> {medication.frequency}
                </p>
              )}
              
              {medication.description && (
                <p className="text-sm mt-2 text-gray-600">{medication.description}</p>
              )}
              
              <div className="flex justify-end gap-2 mt-auto pt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditMedication(medication)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeleteMedication(medication.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog para crear/editar medicamentos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Medicamento" : "Añadir Nuevo Medicamento"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del medicamento*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del medicamento"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosificación</Label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="Ej: 500mg, 50ml, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Input
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  placeholder="Ej: 1 vez al día, cada 8 horas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Breve descripción del medicamento"
                  className="resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales o efectos secundarios"
                  className="resize-none h-20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                ) : null}
                {isEditMode ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}