import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PrintablePrescription from "@/components/PrintablePrescription";
import { PrescriptionData } from "@/types";
import { Printer, ArrowLeft } from "lucide-react";
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
import { FileText, Plus, Search, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { Prescription } from "@/types";

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  
  const { data: prescriptions, isLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });
  
  // Función para convertir una prescripción al formato PrescriptionData
  const convertPrescriptionToData = (prescription: Prescription): PrescriptionData => {
    // Inicializar con valores por defecto
    const defaultMedicalConditions = {
      custom: []
    };
    
    const defaultMedications = {
      custom: []
    };
    
    // Intentar extraer condiciones médicas del customFormula si existe
    let medicalConditions = defaultMedicalConditions;
    let medications = defaultMedications;
    
    if (prescription.custom_formula) {
      try {
        // Si es un string, convertirlo a objeto
        const customFormula = typeof prescription.custom_formula === 'string' 
          ? JSON.parse(prescription.custom_formula) 
          : prescription.custom_formula;
        
        if (customFormula.medicalConditions) {
          medicalConditions = customFormula.medicalConditions;
        }
        
        if (customFormula.medications) {
          medications = customFormula.medications;
        }
      } catch (error) {
        console.error("Error al procesar condiciones médicas de la prescripción:", error);
      }
    }
    
    // Si no hay condiciones personalizadas en la prescripción, cargar las del localStorage
    if (medicalConditions.custom.length === 0) {
      try {
        const savedConditions = localStorage.getItem('medicalConditions');
        if (savedConditions) {
          const userConditions = JSON.parse(savedConditions);
          medicalConditions = {
            custom: userConditions.map((condition: {id: string, name: string}) => ({
              id: condition.id,
              name: condition.name,
              active: false
            }))
          };
        }
      } catch (error) {
        console.error("Error al cargar condiciones médicas desde localStorage:", error);
      }
    }
    
    // Si no hay medicaciones personalizadas en la prescripción, cargar las del localStorage
    if (medications.custom.length === 0) {
      try {
        const savedMedications = localStorage.getItem('medications');
        if (savedMedications) {
          const userMedications = JSON.parse(savedMedications);
          medications = {
            custom: userMedications.map((medication: {id: number, name: string, dosage: string, frequency: string}) => ({
              id: medication.id,
              name: medication.name,
              dosage: medication.dosage,
              frequency: medication.frequency,
              active: false
            }))
          };
        }
      } catch (error) {
        console.error("Error al cargar medicaciones desde localStorage:", error);
      }
    }
    
    const prescriptionData: PrescriptionData = {
      date: prescription?.dateCreated || format(new Date(), "yyyy-MM-dd"),
      number: `#${prescription?.id || 0}`,
      name: prescription?.name || "Fórmula personalizada",
      notes: prescription?.notes || "",
      patientName: prescription?.patient?.name || "",
      patientEmail: prescription?.patient?.identifier || "",
      patientPhone: prescription?.patient?.contact_info || "",
      patientAddress: prescription?.patient?.medical_history || "",
      instructions: prescription?.instructions || "",
      duration: prescription?.duration || "",
      customFormula: prescription?.custom_formula || null,
      medicalConditions: medicalConditions,
      medications: medications,
      items: []
    };
    
        // Si hay customFormula, extraemos los datos
    if (prescription.custom_formula) {
      try {
        const customFormula = typeof prescription.custom_formula === 'string'
          ? JSON.parse(prescription.custom_formula)
          : prescription.custom_formula;
        
        // Verificar si tenemos hierbas en esta fórmula personalizada
        if (customFormula && customFormula.herbs && Array.isArray(customFormula.herbs)) {
          // Crear una fórmula con las hierbas como composición
          const formulaItem: PrescriptionItem = {
            type: 'formula',
            id: prescription.formula_id || customFormula.formulaId || 0,
            quantity: 100, // Total quantity for the formula
            formula: {
              id: prescription.formula_id || customFormula.formulaId || 0,
              pinyin_name: prescription.formula?.pinyin_name || customFormula.name || "Fórmula personalizada",
              chinese_name: prescription.formula?.chinese_name || "",
              english_name: prescription.formula?.english_name || customFormula.name || "Custom Formula",
              category: customFormula.category || "",
              composition: customFormula.herbs,
              herbs: customFormula.herbs.map((herb: any) => ({
                id: herb.herbId || herb.id || 0,
                pinyinName: herb.name || herb.pinyinName || "",
                chineseName: herb.chineseName || "",
                latinName: herb.latinName || "",
                englishName: herb.englishName || "",
                percentage: herb.percentage || 0,
                grams: herb.grams || 0,
                function: herb.function || ""
              })),
              // Add custom formula data for rich display
              customFormula: customFormula
            }
          };
          
          prescriptionData.items.push(formulaItem);
        }
      } catch (e) {
        console.error("Error parsing customFormula:", e);
      }
    }
    
    // Si tiene patient, agregarlo
    if (prescription.patient) {
      prescriptionData.patient = {
        id: prescription.patient.id,
        name: prescription.patient.name
      };
    }
    
    return prescriptionData;
  };
  
  // Función para abrir el diálogo con los detalles de la prescripción
  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    
    // Convertir la prescripción al formato PrescriptionData
    const data = convertPrescriptionToData(prescription);
    setPrescriptionData(data);
    
    // Abrir el diálogo
    setDialogOpen(true);
  };

  const filteredPrescriptions = prescriptions?.filter((prescription) => {
    // Si los datos no están disponibles, no filtrar
    if (!prescription.patient || !prescription.formula) return true;
    
    // Verificar si existe el campo diagnosis en el objeto
    const diagnosisText = (prescription as any).diagnosis || '';
    
    return (
      prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (prescription.formula?.pinyin_name || prescription.formula?.pinyinName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosisText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout>
      <div className="w-full px-4 py-4 bg-[#F2F2F7]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Prescriptions</h1>
            <p className="text-muted-foreground text-sm">
              Manage your patient prescriptions
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate("/prescriptions/new")}
          >
            <Plus className="h-4 w-4" />
            <span>New Prescription</span>
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por paciente, fórmula, diagnóstico..."
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
            {filteredPrescriptions?.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm text-center py-10">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No se encontraron prescripciones</h3>
                <p className="mt-2 text-muted-foreground">
                  Intenta con otra búsqueda o crea una nueva prescripción
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  {filteredPrescriptions?.map((prescription, index) => {
                    // Formatear la fecha si está disponible
                    let formattedDate = "Sin fecha";
                    if (prescription.dateCreated) {
                      try {
                        const date = new Date(prescription.dateCreated);
                        formattedDate = format(date, "dd MMM yyyy", { locale: es });
                      } catch (e) {
                        console.error("Error formateando fecha:", e);
                      }
                    }
                    
                    return (
                      <div 
                        key={prescription.id} 
                        className="group cursor-pointer relative hover:bg-sidebar-accent transition-colors"
                        onClick={() => handleViewPrescription(prescription)}
                      >
                        {index !== 0 && (
                          <div className="absolute left-6 right-0 top-0 border-t border-[#E5E5EA]"></div>
                        )}
                        <div className="py-3">
                          <div className="grid grid-cols-[3fr,2fr,2fr,3fr,auto] gap-4 items-center px-4">
                            {/* Patient name */}
                            <div>
                              <h3 className="font-medium text-primary">
                                {prescription.patient?.name || 'Sin paciente'}
                              </h3>
                            </div>
                            
                            {/* Formula name */}
                            <div className="text-sm text-gray-700">
                              <div className="font-medium truncate">
                                {prescription.formula?.pinyin_name || prescription.formula?.pinyinName || ''}
                              </div>
                            </div>
                            
                            {/* Status - placeholder */}
                            <div className="text-sm text-gray-700 truncate">
                              {prescription.status || '-'}
                            </div>

                            {/* Date */}
                            <div className="text-sm text-gray-700 truncate">
                              {formattedDate}
                            </div>

                            {/* Empty column for alignment */}
                            <div></div>
                            

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Diálogo para mostrar los detalles de la prescripción */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:p-0 print:max-h-full print:overflow-visible">
          <DialogHeader className="print:hidden">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {selectedPrescription?.formula?.pinyin_name || selectedPrescription?.formula?.pinyinName || (
                  selectedPrescription?.custom_formula ? "Fórmula Personalizada" : "Detalles de la Prescripción"
                )}
              </DialogTitle>
            </div>
            <DialogDescription>
              {selectedPrescription?.dateCreated 
                ? format(new Date(selectedPrescription.dateCreated), "dd MMMM yyyy", { locale: es })
                : ""
              }
            </DialogDescription>
          </DialogHeader>
          
          {prescriptionData && (
            <>
              <div className="mt-2 print:mt-0">
                <PrintablePrescription prescription={prescriptionData} />
              </div>
              <div className="mt-4 flex justify-end print:hidden">
                <Button
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (selectedPrescription?.id) {
                      window.print();
                    }
                  }}
                >
                  <Printer className="h-5 w-5" />
                  <span>Imprimir</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
    </Layout>
  );
}
