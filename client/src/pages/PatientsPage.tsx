import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Users, UserPlus, Edit, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Patient } from "@/types";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // State for the new patient
  const [newPatient, setNewPatient] = useState({
    name: "",       // Full name
    phone: "",      // Phone
    email: "",      // Email
    address: ""     // Address
  });

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Mutación para crear un nuevo paciente
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Paciente creado",
        description: "El paciente ha sido añadido correctamente",
      });
      // Resetear el formulario y cerrar el diálogo
      setNewPatient({
        name: "",
        phone: "",
        email: "",
        address: ""
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el paciente. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error al crear paciente:", error);
    },
  });

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
    setNewPatient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para enviar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el formulario
    if (!newPatient.name) {
      toast({
        title: "Error",
        description: "El nombre del paciente es obligatorio",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos para enviar - convertimos los campos a los que espera la base de datos
    const patientData = {
      name: newPatient.name,
      contactInfo: newPatient.phone,        // Guardamos el teléfono en contactInfo
      identifier: newPatient.email,         // Guardamos el email en identifier
      medicalHistory: newPatient.address,   // Guardamos la dirección en medicalHistory
      gender: null,                         // Campos obligatorios pero que no usamos
      dateOfBirth: null                     // Campos obligatorios pero que no usamos
    };

    // Enviar los datos
    createPatientMutation.mutate(patientData);
  };

  const filteredPatients = patients?.filter((patient) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchTermLower) || 
      (patient.identifier && patient.identifier.toLowerCase().includes(searchTermLower)) ||
      (patient.contactInfo && patient.contactInfo.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <Layout>
      <div className="w-full px-4 py-6 bg-[#F2F2F7]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>New Patient</span>
          </Button>

          {/* Dialog to add new patient */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter patient information to create a new record.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full Name<span className="text-red-500">*</span></Label>
                    <Input 
                      id="patient-name" 
                      value={newPatient.name} 
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Patient's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-phone">Phone</Label>
                    <Input 
                      id="patient-phone" 
                      value={newPatient.phone} 
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input 
                      id="patient-email" 
                      type="email"
                      value={newPatient.email} 
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-address">Address</Label>
                    <Input 
                      id="patient-address" 
                      value={newPatient.address} 
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Postal address"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPatientMutation.isPending || !newPatient.name}
                  >
                    {createPatientMutation.isPending ? "Saving..." : "Save Patient"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search patients by name, email or phone..."
              className="pl-10 search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-md w-full"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-md w-full"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {filteredPatients?.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm text-center py-10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No patients found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try another search or add a new patient
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  {filteredPatients?.map((patient, index) => (
                    <div 
                      key={patient.id} 
                      className="group cursor-pointer relative hover:bg-gray-50 transition-all duration-200"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="px-4 py-3">
                        {index > 0 && (
                          <div className="absolute left-4 right-4 top-0 border-t border-[#E5E5EA]" />
                        )}
                        <div className="grid grid-cols-[3fr,2fr,2fr,3fr,auto] gap-4 items-center">
                          {/* Patient name */}
                          <div>
                            <h3 className="font-medium text-primary">{patient.name}</h3>
                          </div>

                          {/* Email */}
                          <div className="text-sm text-gray-700 truncate">
                            {patient.identifier || "-"}
                          </div>

                          {/* Phone */}
                          <div className="text-sm text-gray-700 truncate">
                            {patient.contactInfo || "-"}
                          </div>

                          {/* Address */}
                          <div className="text-sm text-gray-700 truncate">
                            {patient.medicalHistory || "-"}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/patients/${patient.id}/edit`);
                              }}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Implementar eliminación
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}