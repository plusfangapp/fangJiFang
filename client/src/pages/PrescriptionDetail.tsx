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
import { FormulaWithHerbs } from "@shared/schema";
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
    queryKey: ["/api/formulas", prescription?.formulaId],
    enabled: !!prescription?.formulaId,
  });
  
  const isLoading = loadingPrescription || (prescription?.formulaId && loadingFormula);

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
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-muted rounded-md"></div>
              <div className="h-8 bg-muted rounded-md w-48"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-muted rounded-md"></div>
              <div className="h-9 w-36 bg-muted rounded-md"></div>
            </div>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded-md w-1/3"></div>
                <div className="h-6 bg-muted rounded-md w-1/4"></div>
              </div>
              <div className="h-32 bg-muted rounded-md"></div>
              <div className="h-48 bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!prescription) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h3 className="mt-4 text-lg font-medium">Prescripción no encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            La prescripción que estás buscando no existe o ha sido eliminada
          </p>
          <Button className="mt-4" onClick={() => navigate("/prescriptions")}>
            Volver a la lista de prescripciones
          </Button>
        </div>
      </Layout>
    );
  }

  // Convertir los datos de la prescripción al formato que espera PrintablePrescription
  
  // Inicializar con valores por defecto
  const defaultMedicalConditions = {

    custom: []
  };
  
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
    ...defaultMedicalConditions,
    custom: customConditions
  };
  
  const convertedPrescription: PrescriptionData = {
    patientId: prescription?.patientId,
    date: prescription?.dateCreated || format(new Date(), "yyyy-MM-dd"),
    number: `#${prescription?.id || 0}`,
    name: prescription?.name || "Fórmula personalizada",
    notes: prescription?.notes || "",
    patientName: prescription?.patient?.name || "",
    patientEmail: prescription?.patient?.identifier || "",
    patientPhone: prescription?.patient?.contactInfo || "",
    patientAddress: prescription?.patient?.medicalHistory || "",
    medicalConditions: initialMedicalConditions,
    items: []
  };
  
  // Extraer condiciones médicas si existen en customFormula
  if (prescription.customFormula && typeof prescription.customFormula === 'object') {
    // Si medicalConditions existe en customFormula, actualizar las condiciones en convertedPrescription
    if (prescription.customFormula.medicalConditions) {
      // Actualizar condiciones estándar
      const storedConditions = prescription.customFormula.medicalConditions;
      if (typeof storedConditions === 'object') {
        // Actualizar condiciones estándar
        // Ya no hay condiciones médicas predeterminadas, solo personalizadas
        
        // Actualizar condiciones personalizadas
        if (Array.isArray(storedConditions.custom)) {
          convertedPrescription.medicalConditions.custom = storedConditions.custom;
        }
      }
    }
  }

  console.log("Prescription data:", prescription);
  console.log("Tipo de customFormula:", typeof prescription.customFormula);
  
  // Verificar qué campos contiene prescription para depuración
  const prescriptionKeys = Object.keys(prescription);
  console.log("Campos disponibles en prescription:", prescriptionKeys);
  
  // Verificar si customFormula existe
  if (prescription.customFormula) {
    console.log("Raw customFormula:", prescription.customFormula);
    console.log("customFormula type is:", typeof prescription.customFormula);
    
    // Si es un string pero no parece JSON, intentamos decodificar
    if (typeof prescription.customFormula === 'string' && 
        !prescription.customFormula.startsWith('{') && 
        !prescription.customFormula.startsWith('[')) {
      try {
        // Intentar decodificar si es base64 o algún otro formato
        console.log("Intentando decoding customFormula...")
        const decodedString = decodeURIComponent(prescription.customFormula);
        console.log("Decoded customFormula:", decodedString);
      } catch (e) {
        console.error("Error decoding customFormula:", e);
      }
    }
  } else {
    console.log("ATENCIÓN: customFormula no está presente en los datos de prescripción");
  }
  
  // Primero procesamos el customFormula para obtener los datos completos de las hierbas y fórmulas
  if (prescription.customFormula) {
    let customFormulaData;
    
    // Asegurarnos de tener la data en formato objeto
    try {
      if (typeof prescription.customFormula === 'string') {
        try {
          customFormulaData = JSON.parse(prescription.customFormula);
        } catch (parseError) {
          console.error("Error al parsear customFormula como JSON:", parseError);
          
          // Intento alternativo: a veces el campo viene con escape characters extra
          try {
            // Intentar remover caracteres de escape extras
            const cleanString = prescription.customFormula
              .replace(/\\"/g, '"')  // Reemplazar \" por "
              .replace(/\\n/g, ' ')  // Reemplazar saltos de línea
              .replace(/\\\\/g, '\\'); // Reemplazar \\ por \
            
            customFormulaData = JSON.parse(cleanString);
            console.log("Parseado exitoso después de limpiar string:", customFormulaData);
          } catch (secondError) {
            console.error("Segundo intento de parseo también falló:", secondError);
            // Si el segundo intento también falla, intentar un enfoque más agresivo
            try {
              // Buscar contenido entre llaves {}
              const match = prescription.customFormula.match(/\{.*\}/s);
              if (match) {
                customFormulaData = JSON.parse(match[0]);
                console.log("Parseado exitoso extrayendo JSON entre llaves:", customFormulaData);
              } else {
                console.error("No se encontró contenido JSON válido entre llaves.");
                return; // No podemos continuar sin datos válidos
              }
            } catch (thirdError) {
              console.error("Todos los intentos de parseo fallaron, la customFormula parece inválida.");
              return; // No podemos continuar
            }
          }
        }
      } else {
        customFormulaData = prescription.customFormula;
      }
      
      console.log("Procesando customFormula:", customFormulaData);
      
      // Si tenemos hierbas en customFormula, las usamos directamente
      if (customFormulaData && customFormulaData.herbs && Array.isArray(customFormulaData.herbs)) {
        console.log("Procesando hierbas de customFormula:", customFormulaData.herbs);
        
        // Procesar las hierbas del customFormula
        const formulaHerbs = customFormulaData.herbs.map(herb => {
          // Extraer información relevante
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
            // Extraer gramos de la dosificación
            const gramsMatch = herb.dosage.match(/(\d+(?:\.\d+)?)g/);
            if (gramsMatch && gramsMatch[1]) {
              grams = parseFloat(gramsMatch[1]);
            }
            
            // Extraer porcentaje de la dosificación si no tenemos uno
            if (!percentage) {
              const percentMatch = herb.dosage.match(/(\d+(?:\.\d+)?)%/);
              if (percentMatch && percentMatch[1]) {
                percentage = parseFloat(percentMatch[1]);
              }
            }
          }
          
          return {
            id: herb.herbId || herb.id || 0,
            pinyinName: herb.name || herb.pinyinName || "",
            chineseName: herb.chineseName || "",
            latinName: herb.latinName || "",
            percentage: percentage,
            grams: grams,
            function: herb.function || "",
            dosage: herb.dosage || ""
          };
        });
        
        // Crear un item de fórmula con los datos completos
        const formulaItem: PrescriptionItem = {
          id: prescription.formulaId || 0,
          type: "formula",
          quantity: 100, // Por defecto 100g total
          formula: {
            id: prescription.formulaId || 0,
            pinyinName: prescription.name || (prescription.formula?.pinyinName || "Fórmula personalizada"),
            chineseName: prescription.formula?.chineseName || "",
            englishName: prescription.formula?.englishName || "",
            category: prescription.formula?.category || null,
            actions: customFormulaData.actions || null,
            indications: customFormulaData.indications || null,
            clinicalManifestations: customFormulaData.clinicalManifestations || null,
            clinicalApplications: customFormulaData.clinicalApplications || null,
            contraindications: customFormulaData.contraindications || null,
            cautions: customFormulaData.cautions || null,
            pharmacologicalEffects: customFormulaData.pharmacologicalEffects || null,
            research: customFormulaData.research || null,
            herbDrugInteractions: customFormulaData.herbDrugInteractions || null,
            composition: customFormulaData.herbs,
            herbs: formulaHerbs
          }
        };
        
        convertedPrescription.items.push(formulaItem);
        console.log("Fórmula creada con hierbas de customFormula:", formulaItem);
      } else {
        console.error("No se encontraron hierbas válidas en customFormula:", customFormulaData);
        
        // Si no se pudo procesar correctamente, intentar extraer datos de prescripción
        if (prescription.formula) {
          console.log("Intentando usar datos básicos de fórmula:", prescription.formula);
          
          // Crear un item placeholder con los datos básicos disponibles
          const placeholderItem: PrescriptionItem = {
            id: prescription.formulaId || 0,
            type: "formula",
            quantity: 100,
            formula: {
              id: prescription.formula.id || 0,
              pinyinName: prescription.formula.pinyinName || "Fórmula sin nombre",
              chineseName: prescription.formula.chineseName || "",
              englishName: prescription.formula.englishName || "",
              category: null,
              actions: null,
              indications: null,
              clinicalManifestations: null,
              contraindications: null,
              cautions: null,
              composition: [],
              herbs: []
            }
          };
          
          convertedPrescription.items.push(placeholderItem);
        }
      }
    } catch (e) {
      console.error("Error procesando customFormula:", e);
    }
  }
  // Si no hay customFormula pero hay una fórmula asociada, procesamos los datos de la fórmula
  else if (formulaDetails && prescription?.formulaId) {
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
      id: prescription.formulaId,
      type: "formula",
      quantity: 100, // Valor predeterminado
      formula: formulaWithHerbs
    };
    convertedPrescription.items.push(formulaItem);
    
    console.log("Fórmula procesada con hierbas:", formulaItem);
  } 
  // Si no tenemos los detalles completos pero sí la referencia básica
  else if (prescription?.formulaId && prescription?.formula) {
    console.log("Fórmula básica detectada, creando item con datos básicos");
    
    // Crear un item de fórmula con los datos básicos disponibles
    const formulaItem: PrescriptionItem = {
      id: prescription.formulaId,
      type: "formula",
      quantity: 100,
      formula: {
        id: prescription.formula.id,
        pinyinName: prescription.formula.pinyinName || "",
        chineseName: prescription.formula.chineseName || "",
        englishName: prescription.formula.englishName || "",
        category: prescription.formula.category || null,
        actions: prescription.formula.actions || null,
        indications: null,
        clinicalManifestations: prescription.formula.clinicalManifestations || null,
        clinicalApplications: prescription.formula.clinicalApplications || null,
        contraindications: prescription.formula.contraindications || null,
        cautions: prescription.formula.cautions || null,
        pharmacologicalEffects: prescription.formula.pharmacologicalEffects || null,
        research: prescription.formula.research || null,
        herbDrugInteractions: prescription.formula.herbDrugInteractions || null,
        composition: prescription.formula.composition || [],
        herbs: [] // Inicialmente vacío
      }
    };
    
    convertedPrescription.items.push(formulaItem);
    
    // Intentar obtener datos completos de la fórmula para actualizar posteriormente
    fetch(`/api/formulas/${prescription.formulaId}`)
      .then(res => res.json())
      .then(formulaData => {
        console.log("Datos recibidos de fórmula:", formulaData);
        
        // Procesar la composición
        let herbComponents = [];
        if (formulaData.composition) {
          try {
            if (typeof formulaData.composition === 'string') {
              herbComponents = JSON.parse(formulaData.composition);
            } else if (Array.isArray(formulaData.composition)) {
              herbComponents = formulaData.composition;
            }
          } catch (e) {
            console.error("Error al procesar composición:", e);
          }
        }
        
        // Crear hierbas a partir de la composición
        const herbs = herbComponents.map(item => {
          let percentage = 0;
          if (item.dosage) {
            const percentMatch = item.dosage.match(/(\d+\.?\d*)%/);
            if (percentMatch && percentMatch[1]) {
              percentage = parseFloat(percentMatch[1]);
            }
          } else if (item.percentage) {
            percentage = parseFloat(item.percentage);
          }
          
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
        
        // Actualizar dinámicamente nuestra prescripción con los datos obtenidos
        if (convertedPrescription.items.length > 0 && 
            convertedPrescription.items[0].type === 'formula' && 
            convertedPrescription.items[0].formula) {
          // Actualizar las hierbas en la fórmula existente
          convertedPrescription.items[0].formula.herbs = herbs;
          
          // Intentar forzar una actualización de la UI
          document.getElementById('prescriptionContainer')?.classList.add('updated');
          setTimeout(() => {
            document.getElementById('prescriptionContainer')?.classList.remove('updated');
          }, 10);
        }
      })
      .catch(err => console.error("Error obteniendo detalles de la fórmula:", err));
  }
  
  // Si no hay items en la prescripción, agregamos un mensaje placeholder
  if (convertedPrescription.items.length === 0) {
    console.log("No hay items en la prescripción, agregando placeholder");
    // Crear un item placeholder para mostrar en la vista previa
    const placeholderItem: PrescriptionItem = {
      id: 0,
      type: "herb",
      quantity: 0,
      herb: {
        id: 0,
        pinyinName: "Prescripción vacía",
        chineseName: "Sin hierbas o fórmulas",
        function: "Esta prescripción no tiene hierbas o fórmulas asignadas.",
        latinName: ""
      }
    };
    convertedPrescription.items.push(placeholderItem);
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/prescriptions")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{prescription.name || "Fórmula personalizada"}</h1>
            <p className="text-sm text-muted-foreground">Prescripción #{prescription.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href={`/prescriptions/edit/${prescription.id}`}>
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Link>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadPDF}>
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
                {prescription.frequency && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Frecuencia:</div>
                    <div className="col-span-2">{prescription.frequency}</div>
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
    </Layout>
  );
}
