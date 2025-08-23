import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { ArrowLeft, Copy, Edit, FileDown, Printer, Share } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Layout from "@/components/Layout";
import PrintablePrescription from "@/components/PrintablePrescription";
import { PrescriptionData, PrescriptionItem } from "@/types";
import { FormulaWithHerbs } from "@/types";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";

export default function PrescriptionDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const printRef = useRef(null);

  const { data: prescription, isLoading: loadingPrescription } = useQuery({
    queryKey: ["/api/prescriptions", id],
    enabled: !!id,
  });

  const { data: formulaDetails, isLoading: loadingFormula } = useQuery({
    queryKey: ["/api/formulas", prescription?.formula_id],
    enabled: !!prescription?.formula_id,
  });
  
  const isLoading = loadingPrescription || (prescription?.formula_id && loadingFormula);

  // Función para imprimir la prescripción
  const handlePrint = useReactToPrint({
    documentTitle: `Prescripcion-${id}`,
    onPrintError: (error) => console.error('Error al imprimir:', error),
    content: () => printRef.current,
  });

  // Función para generar PDF
  const handleDownloadPDF = () => {
    if (!printRef.current) return;
    
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });
    
    doc.html(printRef.current, {
      async callback(doc) {
        doc.save(`Prescripcion-${id}.pdf`);
      },
      x: 0,
      y: 0,
      width: 210,
      windowWidth: 800
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando prescripción...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!prescription) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Prescripción no encontrada</h1>
            <p className="text-gray-600 mb-4">La prescripción que buscas no existe o no tienes permisos para verla.</p>
            <Button onClick={() => navigate("/prescriptions")}>
              Volver a Prescripciones
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Función para convertir una prescripción al formato PrescriptionData
  const convertPrescriptionToData = (prescription: any): PrescriptionData => {
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
      medicalConditions: {
        custom: []
      },
      medications: {
        custom: []
      },
      items: []
    };
    
    console.log("Procesando prescripción:", prescription);
    
    // Procesar el custom_formula si existe
    if (prescription?.custom_formula) {
      try {
        const customFormula = typeof prescription.custom_formula === 'string' 
          ? JSON.parse(prescription.custom_formula) 
          : prescription.custom_formula;
        
        console.log("CustomFormula procesado:", customFormula);
        
        // Si hay hierbas en el customFormula, creamos una fórmula con composición
        if (customFormula.herbs && Array.isArray(customFormula.herbs)) {
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
        
        // Si hay condiciones médicas, las añadimos
        if (customFormula.medicalConditions && customFormula.medicalConditions.custom) {
          prescriptionData.medicalConditions = customFormula.medicalConditions;
        }
        
        // Si hay medicaciones, las añadimos
        if (customFormula.medications && customFormula.medications.custom) {
          prescriptionData.medications = customFormula.medications;
        }
      } catch (e) {
        console.error("Error procesando customFormula:", e);
      }
    }

    // Convertir los datos de la prescripción al formato que espera PrintablePrescription
    
    // Intentar cargar condiciones personalizadas desde localStorage
    let customConditions: Array<{id: string; name: string; active: boolean}> = [];
    try {
      const savedConditions = localStorage.getItem('medicalConditions');
      if (savedConditions) {
        const userConditions = JSON.parse(savedConditions);
        // Convertir las condiciones al formato de prescripción (inactive por defecto)
        customConditions = userConditions.map((condition: {id: string, name: string}) => ({
          id: condition.id,
          name: condition.name,
          active: false
        }));
      }
    } catch (error) {
      console.error("Error al cargar condiciones médicas desde localStorage:", error);
    }
    
    // Usamos las condiciones cargadas desde localStorage como punto de partida
    const initialMedicalConditions = {
      ...prescriptionData.medicalConditions,
      custom: customConditions
    };
    
    const convertedPrescription: PrescriptionData = {
      ...prescriptionData,
      medicalConditions: initialMedicalConditions
    };
    
    // Extraer condiciones médicas si existen en customFormula
    if (prescription?.custom_formula) {
      try {
        const customFormula = typeof prescription.custom_formula === 'string' 
          ? JSON.parse(prescription.custom_formula) 
          : prescription.custom_formula;
        
        if (customFormula.medicalConditions && customFormula.medicalConditions.custom) {
          convertedPrescription.medicalConditions = customFormula.medicalConditions;
        }
      } catch (e) {
        console.error("Error al extraer condiciones médicas del customFormula:", e);
      }
    }
    
    // Si no hay customFormula pero hay una fórmula asociada, procesamos los datos de la fórmula
    if (formulaDetails && prescription?.formula_id) {
      console.log("Añadiendo fórmula con detalles completos:", formulaDetails);
      
      // Extraer la composición de la fórmula
      let herbComponents = [];
      if (formulaDetails.composition) {
        try {
          if (typeof formulaDetails.composition === 'string') {
            herbComponents = JSON.parse(formulaDetails.composition);
          } else if (Array.isArray(formulaDetails.composition)) {
            herbComponents = formulaDetails.composition;
          }
        } catch (e) {
          console.error("Error al procesar composición:", e);
        }
      }
      
      // Procesar los componentes de las hierbas
      const herbs = herbComponents.map(item => {
        // Extraer el porcentaje de la dosis
        let percentage = 0;
        if (item.dosage) {
          const percentMatch = item.dosage.match(/(\d+\.?\d*)%/);
          if (percentMatch && percentMatch[1]) {
            percentage = parseFloat(percentMatch[1]);
          }
        } else if (item.percentage) {
          percentage = parseFloat(item.percentage);
        }
        
        // Calcular los gramos basados en el porcentaje (100g total por defecto)
        const grams = percentage > 0 ? Math.round((percentage / 100) * 100) : 0;
        
        return {
          id: item.herbId || item.id || 0,
          pinyinName: item.herb || item.name || item.pinyinName || "",
          chineseName: item.chineseName || "",
          latinName: item.latinName || "",
          percentage,
          grams,
          function: item.function || ""
        };
      });
      
      // Crear la fórmula completa con hierbas
      const formulaWithHerbs: FormulaWithHerbs = {
        ...formulaDetails,
        herbs: herbs
      };
      
      // Añadir la fórmula como item de prescripción
      const formulaItem: PrescriptionItem = {
        id: prescription.formula_id,
        type: "formula",
        quantity: 100, // Valor predeterminado
        formula: formulaWithHerbs
      };
      
      convertedPrescription.items.push(formulaItem);
    }
    
    return convertedPrescription;
  };

  const convertedPrescription = convertPrescriptionToData(prescription);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Header con navegación y acciones */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/prescriptions")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Prescripción #{prescription.id}
              </h1>
              <p className="text-gray-600">
                {prescription.dateCreated 
                  ? format(new Date(prescription.dateCreated), "dd MMMM yyyy", { locale: es })
                  : "Fecha no disponible"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/prescriptions/${id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              <span>Compartir</span>
            </Button>
          </div>
        </div>

        {/* Vista de prescripción en formato de impresión */}
        <div id="prescriptionContainer" className="mb-4 border border-gray-100 rounded-md shadow-sm">
          <div ref={printRef}>
            <PrintablePrescription 
              prescription={convertedPrescription} 
              key={`prescription-${prescription.id}-${JSON.stringify(convertedPrescription.items).length}`}
            />
          </div>
        </div>

        {/* Información adicional y acciones */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold mb-4">Información Adicional</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Estado:</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        prescription.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {prescription.status === "active" ? "Activa" : "Completada"}
                      </span>
                    </div>
                  </div>
                  {prescription.diagnosis && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">Diagnóstico:</div>
                      <div className="col-span-2">{prescription.diagnosis}</div>
                    </div>
                  )}
                  {prescription.duration && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">Duración:</div>
                      <div className="col-span-2">{prescription.duration}</div>
                    </div>
                  )}
                  {prescription.instructions && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">Instrucciones:</div>
                      <div className="col-span-2">{prescription.instructions}</div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Historia del Tratamiento</h2>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Esta prescripción fue creada el {prescription.dateCreated 
                      ? format(new Date(prescription.dateCreated), "dd MMMM yyyy", { locale: es })
                      : "fecha desconocida"} para el paciente {prescription.patient?.name || "Desconocido"}.
                  </p>
                  {prescription.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Notas: </span>
                      {prescription.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <div>
                <Link href={`/patients/${prescription.patientId}`} className="text-sm text-primary hover:underline">
                  Ver historial completo del paciente
                </Link>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span>Duplicar Prescripción</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
