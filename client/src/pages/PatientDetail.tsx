import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  ChevronLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Patient, Prescription } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PrintablePrescription from "@/components/PrintablePrescription";
import { PrescriptionData } from "@/types";

export default function PatientDetail() {
  const { id } = useParams();
  const patientId = Number(id);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  
  // Función para manejar la visualización de la prescripción
  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    const data = convertPrescriptionToData(prescription);
    setPrescriptionData(data);
    setDialogOpen(true);
  };

  // Consultar datos del paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId && !isNaN(patientId),
  });

  // Consultar prescripciones del paciente
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery<Prescription[]>({
    queryKey: [`/api/patients/${patientId}/prescriptions`],
    enabled: !!patientId && !isNaN(patientId),
  });
  
  // Función para convertir una prescripción al formato PrescriptionData
  const convertPrescriptionToData = (prescription: Prescription): PrescriptionData => {
    const prescriptionData: PrescriptionData = {
      date: prescription?.dateCreated || format(new Date(), "yyyy-MM-dd"),
      number: `#${prescription?.id || 0}`,
      notes: prescription?.notes || "",
      patientName: patient?.name || "",
      patientEmail: patient?.identifier || "",
      patientPhone: patient?.contactInfo || "",
      patientAddress: patient?.medicalHistory || "",
      instructions: prescription?.instructions || "",
      duration: prescription?.duration || "",
      medicalConditions: {
        custom: []
      },
      items: []
    };
    
    console.log("Procesando prescripción:", prescription);
    
    // Procesar el customFormula si existe
    if (prescription.customFormula) {
      let customFormulaData;
      try {
        // Parsear customFormula si es un string
        if (typeof prescription.customFormula === 'string') {
          try {
            customFormulaData = JSON.parse(prescription.customFormula);
          } catch (parseError) {
            console.error("Error al parsear customFormula como JSON:", parseError);
            
            // Limpiar posibles caracteres de escape extras
            try {
              const cleanString = prescription.customFormula
                .replace(/\\"/g, '"')
                .replace(/\\n/g, ' ')
                .replace(/\\\\/g, '\\');
              
              customFormulaData = JSON.parse(cleanString);
              console.log("Parseado exitoso después de limpiar string");
            } catch (error) {
              console.error("Falló segundo intento de parseo:", error);
              // Si aún falla, usar un objeto vacío
              customFormulaData = { herbs: [] };
            }
          }
        } else {
          customFormulaData = prescription.customFormula;
        }
        
        // Si tenemos hierbas en la fórmula personalizada
        if (customFormulaData && customFormulaData.herbs && Array.isArray(customFormulaData.herbs)) {
          console.log("Procesando hierbas de la fórmula");
          
          const herbs = customFormulaData.herbs.map((herb: any) => {
            let percentage = 0;
            let grams = 0;
            
            if (herb.percentage) {
              percentage = typeof herb.percentage === 'string' 
                ? parseFloat(herb.percentage) 
                : herb.percentage;
            }
            
            if (herb.grams) {
              grams = typeof herb.grams === 'string'
                ? parseFloat(herb.grams)
                : herb.grams;
            } else if (herb.dosage) {
              const gramsMatch = herb.dosage.match(/(\d+(?:\.\d+)?)g/);
              if (gramsMatch && gramsMatch[1]) {
                grams = parseFloat(gramsMatch[1]);
              }
            }
            
            return {
              id: herb.herbId || herb.id || 0,
              pinyinName: herb.name || herb.pinyinName || "",
              chineseName: herb.chineseName || "",
              latinName: herb.latinName || "",
              percentage: percentage,
              grams: grams,
              function: herb.function || ""
            };
          });
          
          // Agregar la fórmula a los ítems
          prescriptionData.items.push({
            id: prescription.formulaId || 0,
            type: "formula",
            quantity: 100,
            formula: {
              id: prescription.formulaId || 0,
              pinyinName: prescription.formula?.pinyinName || "Fórmula personalizada",
              chineseName: prescription.formula?.chineseName || "",
              englishName: prescription.formula?.englishName || "",
              category: prescription.formula?.category || null,
              composition: customFormulaData.herbs,
              herbs: herbs
            }
          });
        }
      } catch (e) {
        console.error("Error procesando fórmula personalizada:", e);
      }
    } else if (prescription.formula) {
      // Si no hay customFormula pero hay una fórmula asociada
      prescriptionData.items.push({
        id: prescription.formulaId || 0,
        type: "formula",
        quantity: 100,
        formula: prescription.formula
      });
    }
    
    return prescriptionData;
  };
  // Las prescripciones ya están ordenadas en la función sortedPrescriptions

  // Ordenar prescripciones por fecha de creación (más reciente primero)
  const sortedPrescriptions = prescriptions?.sort((a, b) => {
    // Usar dateCreated si está disponible, sino comparar por id
    const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : a.id;
    const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : b.id;
    return dateB - dateA;
  });

  if (isLoadingPatient) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-md w-1/4"></div>
          <div className="h-24 bg-muted rounded-md w-full"></div>
          <div className="h-64 bg-muted rounded-md w-full"></div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Paciente no encontrado</h2>
          <p className="text-muted-foreground mb-4">
            No se encontró el paciente con ID {patientId}
          </p>
          <Button asChild>
            <Link href="/patients">
              Volver a la lista de pacientes
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon" className="hover:bg-white hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{patient.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px,1fr] gap-6">
        {/* Información del paciente */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Nombre completo</div>
              <div className="font-medium">{patient.name}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>{patient.identifier || "No especificado"}</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Teléfono</div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>{patient.contactInfo || "No especificado"}</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Dirección</div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>{patient.medicalHistory || "No especificada"}</div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href={`/prescriptions/new?patient=${patient.id}`}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Nueva Prescripción
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historial de prescripciones */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle>Historial de Prescripciones</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPrescriptions ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded-md w-full"></div>
                ))}
              </div>
            ) : sortedPrescriptions && sortedPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {sortedPrescriptions.map((prescription) => (
                  <div 
                    key={prescription.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewPrescription(prescription)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {prescription.dateCreated ? format(new Date(prescription.dateCreated), "dd MMMM yyyy", { locale: es }) : "Sin fecha"}
                        </span>
                      </div>
                      <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                        {prescription.status === "active" ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start">
                      <div>
                        <h3 className="font-medium">
                          {prescription.name || 
                           prescription.formula?.pinyinName || 
                           "Fórmula personalizada"}
                        </h3>
                        
                        {/* Mostrar notas si existen */}
                        {prescription.notes && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">Notas:</p>
                            <p className="text-xs">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No hay prescripciones</h3>
                <p className="text-muted-foreground mb-4">
                  Este paciente aún no tiene prescripciones
                </p>
                <Button asChild>
                  <Link href={`/prescriptions/new?patient=${patient.id}`}>
                    Crear nueva prescripción
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo para mostrar los detalles de la prescripción */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrescription?.formula?.pinyinName || (
                selectedPrescription?.customFormula ? "Fórmula Personalizada" : "Detalles de la Prescripción"
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedPrescription?.dateCreated 
                ? format(new Date(selectedPrescription.dateCreated), "dd MMMM yyyy", { locale: es })
                : ""
              }
            </DialogDescription>
          </DialogHeader>
          
          {prescriptionData && (
            <div className="mt-4">
              <PrintablePrescription prescription={prescriptionData} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}