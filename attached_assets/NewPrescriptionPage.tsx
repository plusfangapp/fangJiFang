import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useSidebar } from "@/lib/sidebar-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Save, FileDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import LibraryPanel from "@/components/LibraryPanel";
import PrescriptionBuilder from "@/components/PrescriptionBuilder";
import PrintablePrescription from "@/components/PrintablePrescription";
import PrescriptionPreviewDialog from "@/components/PrescriptionPreviewDialog";
import { Herb, Formula, FormulaWithHerbs } from "@shared/schema";
import { PrescriptionData, HerbWithGrams, PrescriptionItem } from "@/types";

export default function NewPrescriptionPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { sidebarExpanded } = useSidebar();
  
  // Obtener el id del paciente de la URL si existe
  const urlParams = new URLSearchParams(window.location.search);
  const patientIdFromUrl = urlParams.get('patient');
  
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionData>({
    date: format(new Date(), "yyyy-MM-dd"),
    number: "1", // Se actualizará automáticamente si el paciente ya tiene prescripciones
    name: "", // Nombre de la prescripción
    notes: "",
    patientId: patientIdFromUrl ? parseInt(patientIdFromUrl) : undefined,
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientAddress: "",
    medicalConditions: {
      custom: []
    },
    medications: {
      custom: []
    },
    items: []
  });

  // Fetch herbs and formulas
  const { data: herbs = [] } = useQuery<Herb[]>({
    queryKey: ["/api/herbs"],
  });

  const { data: formulas = [] } = useQuery<FormulaWithHerbs[]>({
    queryKey: ["/api/formulas"],
  });
  
  // Cargar datos del paciente si viene un ID en la URL
  const { data: patientData } = useQuery<any>({
    queryKey: [`/api/patients/${patientIdFromUrl}`],
    enabled: !!patientIdFromUrl,
  });
  
  // Efecto para cargar las condiciones médicas y medicaciones personalizadas desde localStorage
  useEffect(() => {
    try {
      // Cargar condiciones médicas
      const savedConditions = localStorage.getItem('medicalConditions');
      if (savedConditions) {
        const conditions = JSON.parse(savedConditions);
        // Convertir las condiciones al formato que necesitamos para la prescripción
        // (con el campo active en false inicialmente)
        const customConditions = conditions.map((condition: {id: string, name: string}) => ({
          id: condition.id,
          name: condition.name,
          active: false
        }));
        
        // Actualizar el estado de currentPrescription con las condiciones médicas
        setCurrentPrescription(prev => ({
          ...prev,
          medicalConditions: {
            ...prev.medicalConditions,
            custom: customConditions
          }
        }));
      }
      
      // Cargar medicaciones
      const savedMedications = localStorage.getItem('medications');
      if (savedMedications) {
        const medications = JSON.parse(savedMedications);
        // Convertir las medicaciones al formato requerido para la prescripción
        // (con el campo active en false inicialmente)
        const customMedications = medications.map((medication: {id: number, name: string, dosage: string, frequency: string}) => ({
          id: medication.id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          active: false
        }));
        
        // Actualizar el estado con las medicaciones
        setCurrentPrescription(prev => ({
          ...prev,
          medications: {
            ...prev.medications,
            custom: customMedications
          }
        }));
      }
    } catch (error) {
      console.error("Error al cargar condiciones médicas o medicaciones:", error);
    }
  }, []);
  
  // Efecto para actualizar datos del paciente cuando se carga la información
  useEffect(() => {
    if (patientData) {
      // Primero actualizar información básica del paciente
      setCurrentPrescription(prev => ({
        ...prev,
        patientId: patientData.id,
        patientName: patientData.name,
        patientEmail: patientData.identifier || "",
        patientPhone: patientData.contactInfo || "",
        patientAddress: patientData.medicalHistory || ""
      }));
      
      // Consultar prescripciones existentes para actualizar el número
      const fetchPrescriptions = async () => {
        try {
          const response = await fetch(`/api/patients/${patientData.id}/prescriptions`);
          const prescriptions = await response.json();
          
          let newNumber = '1';
          if (prescriptions && prescriptions.length > 0) {
            // Suponiendo que la numeración es secuencial, tomamos la cantidad + 1
            newNumber = (prescriptions.length + 1).toString();
          }
          
          setCurrentPrescription(prev => ({
            ...prev,
            number: newNumber
          }));
        } catch (error) {
          console.error("Error al obtener prescripciones del paciente:", error);
        }
      };
      
      fetchPrescriptions();
      
      toast({
        title: "Paciente cargado",
        description: `Los datos de ${patientData.name} han sido cargados en la prescripción.`,
      });
    }
  }, [patientData, toast]);
  
  // Mutación para crear un nuevo paciente
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el paciente');
      }
      
      return response.json();
    },
    onSuccess: (newPatient) => {
      // Informamos que el paciente ha sido creado y estamos creando la prescripción
      toast({
        title: "Paciente creado",
        description: `El paciente ${newPatient.name} ha sido creado. Creando prescripción...`,
      });
      
      // Actualizamos el estado para reflejar el ID del paciente recién creado
      setCurrentPrescription(prev => ({
        ...prev,
        patientId: newPatient.id
      }));
      
      // Obtenemos las fórmulas de la prescripción
      const formulaItems = currentPrescription.items.filter(item => item.type === "formula");
      // Usamos la primera fórmula si existe, o null si no hay fórmulas
      const formulaId = formulaItems.length > 0 ? formulaItems[0].id : null;
      
      // Si no hay nombre, usamos "Fórmula personalizada"
      const prescriptionName = currentPrescription.name.trim() || "Fórmula personalizada";
      
      // Preparar los datos de la fórmula personalizada
      const customFormula = {
        // Guardar condiciones médicas
        medicalConditions: currentPrescription.medicalConditions,
        
        herbs: currentPrescription.items.flatMap(item => {
          if (item.type === 'herb' && item.herb) {
            // Para hierbas individuales
            return [{
              herbId: item.herb.id,
              name: item.herb.pinyinName,
              chineseName: item.herb.chineseName,
              latinName: item.herb.latinName,
              function: item.herb.function || item.herb.actions?.join(', ') || '',
              dosage: `${item.quantity}g`
            }];
          } else if (item.type === 'formula' && item.formula && item.formula.herbs && item.formula.herbs.length > 0) {
            // Para las hierbas dentro de una fórmula
            return item.formula.herbs.map(herb => ({
              herbId: herb.id || 0,
              name: herb.pinyinName,
              chineseName: herb.chineseName,
              latinName: herb.latinName || '',
              function: herb.function || '',
              percentage: herb.percentage || 0,
              dosage: herb.grams ? `${herb.grams}g (${herb.percentage || 0}%)` : `${herb.percentage || 0}%`
            }));
          }
          return [];
        })
      };
      
      // Después de crear el paciente, guardamos la prescripción con el nuevo ID de paciente
      const prescriptionData = {
        date: currentPrescription.date,
        patientId: newPatient.id,
        formulaId: formulaId, // Asignamos el formulaId o null
        name: prescriptionName,
        diagnosis: "",
        notes: currentPrescription.notes,
        status: "active",
        customFormula: customFormula, // Añadimos la información detallada
        items: currentPrescription.items.map(item => ({
          type: item.type,
          id: item.id,
          quantity: item.quantity
        }))
      };
      
      // Invalidamos las consultas antes de guardar
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${newPatient.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${newPatient.id}/prescriptions`] });
      
      savePrescriptionMutation.mutate(prescriptionData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutación para guardar la prescripción
  const savePrescriptionMutation = useMutation({
    mutationFn: async (prescription: any) => {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescription),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar la prescripción');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Prescripción guardada",
        description: "La prescripción ha sido guardada correctamente.",
        variant: "success",
      });
      
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      
      // Invalidar específicamente las prescripciones del paciente
      if (currentPrescription.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/patients/${currentPrescription.patientId}/prescriptions`] 
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Redireccionar a la página del paciente si tenemos un ID de paciente
      if (currentPrescription.patientId) {
        navigate(`/patients/${currentPrescription.patientId}`);
      } else {
        // Si no, ir a la lista de prescripciones
        navigate("/prescriptions");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const addHerbToPrescription = (herb: Herb | HerbWithGrams) => {
    const existingItem = currentPrescription.items.find(
      item => item.type === "herb" && item.herb && item.herb.id === herb.id
    );
    
    // Obtener el valor de gramos si existe
    const herbGrams = 'grams' in herb && herb.grams ? herb.grams : null;
    
    if (existingItem) {
      // Si la hierba ya existe en la prescripción, incrementar la cantidad
      const incrementAmount = herbGrams || 1;
      
      setCurrentPrescription(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.type === "herb" && item.herb && item.herb.id === herb.id 
            ? { ...item, quantity: item.quantity + incrementAmount }
            : item
        )
      }));
      
      toast({
        title: "Hierba actualizada",
        description: `La cantidad de ${herb.pinyinName} ha sido incrementada en ${incrementAmount}.`,
      });
    } else {
      // Si hay información de gramos, la usamos como cantidad inicial
      const initialQuantity = herbGrams || 1;
      
      setCurrentPrescription(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: herb.id,
            type: "herb",
            quantity: initialQuantity,
            herb
          }
        ]
      }));
      
      toast({
        title: "Hierba añadida",
        description: `${herb.pinyinName} ha sido añadida a la prescripción con cantidad ${initialQuantity}.`,
      });
    }
  };

  const addFormulaToPrescription = (formula: FormulaWithHerbs) => {
    // Registro detallado para depuración
    console.log("Añadiendo fórmula a prescripción:", formula);
    console.log("Cantidad especificada:", (formula as any).quantity || 100, "g");
    console.log("Hierbas en fórmula:", formula.herbs);
    
    const existingItem = currentPrescription.items.find(
      item => item.type === "formula" && item.formula && item.formula.id === formula.id
    );

    // IMPORTANTE: Las fórmulas siempre se estandarizan a 100g y los porcentajes se calculan en base a esto
    // Verificar si hay una cantidad específica en la fórmula o usar el valor predeterminado
    const requestedQuantity = (formula as any).totalGrams || (formula as any).quantity || 100;
    
    // Total actual de gramos en la fórmula para calcular el factor de escala
    const sumOfGrams = formula.herbs?.reduce((sum, herb) => sum + (herb.grams || 0), 0) || 0;
    console.log("Total de gramos original:", sumOfGrams, "g");
    console.log("Cantidad solicitada:", requestedQuantity, "g");
    
    if (existingItem) {
      // Si la fórmula ya existe, incrementamos con la cantidad solicitada
      const newQuantity = existingItem.quantity + requestedQuantity;
      console.log("Actualizando fórmula, nueva cantidad:", newQuantity, "g");
      
      // Factor de escala para todas las hierbas basado en la nueva cantidad total
      const ratio = newQuantity / existingItem.quantity;
      
      // Actualizar la fórmula y todas sus hierbas manteniendo sus proporciones 
      const updatedFormula = {
        ...existingItem.formula as FormulaWithHerbs,
        herbs: (existingItem.formula as FormulaWithHerbs).herbs?.map(herb => {
          // Calculamos los nuevos gramos exactos manteniendo la misma proporción
          const scaledGrams = herb.grams ? Math.round((herb.grams * ratio) * 10) / 10 : undefined;
          console.log(`Hierba ${herb.pinyinName}: ${herb.grams}g → ${scaledGrams}g`);
          
          return {
            ...herb,
            // Guardar tanto los gramos escalados como el porcentaje original
            percentage: herb.percentage,
            grams: scaledGrams
          };
        }) || []
      };
      
      // Actualizar el estado con la fórmula actualizada
      setCurrentPrescription(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.type === "formula" && item.formula && item.formula.id === formula.id 
            ? { 
                ...item, 
                quantity: newQuantity,
                formula: updatedFormula
              }
            : item
        )
      }));
      
      toast({
        title: "Fórmula actualizada",
        description: `La cantidad de ${formula.pinyinName} ha sido incrementada a ${newQuantity}g.`,
      });
    } else {
      // Es una nueva fórmula que se añade a la prescripción
      console.log("Añadiendo nueva fórmula con", requestedQuantity, "g");
      
      // Necesitamos calcular los porcentajes exactos basados en 100g (estándar)
      const standardizedHerbs = formula.herbs?.map(herb => {
        // Si no hay gramos, calcular porcentaje por defecto
        if (!herb.grams && !herb.percentage) {
          const defaultPercentage = 100 / (formula.herbs?.length || 1);
          return {
            ...herb,
            percentage: Math.round(defaultPercentage * 10) / 10,
            grams: Math.round((defaultPercentage * requestedQuantity / 100) * 10) / 10
          };
        }
        
        // Si hay porcentaje definido pero no gramos, calcular gramos
        if (herb.percentage && !herb.grams) {
          return {
            ...herb,
            grams: Math.round((herb.percentage * requestedQuantity / 100) * 10) / 10
          };
        }
        
        // Si hay gramos pero no porcentaje, calcular porcentaje relativo a 100g
        if (herb.grams && !herb.percentage) {
          // Normalizar a porcentaje respecto al total
          const percentage = sumOfGrams > 0 
            ? (herb.grams / sumOfGrams) * 100
            : 100 / (formula.herbs?.length || 1);
            
          const exactGrams = Math.round((percentage * requestedQuantity / 100) * 10) / 10;
          
          return {
            ...herb,
            percentage: Math.round(percentage * 10) / 10,
            grams: exactGrams
          };
        }
        
        // Si ambos están definidos, respetar porcentaje y calcular gramos según cantidad solicitada
        const exactGrams = Math.round((herb.percentage * requestedQuantity / 100) * 10) / 10;
        
        return {
          ...herb,
          grams: exactGrams
        };
      }) || [];
      
      // Verificar que la suma de gramos es exactamente igual a la cantidad solicitada
      const calculatedTotal = standardizedHerbs.reduce((sum, herb) => sum + (herb.grams || 0), 0);
      console.log("Total calculado:", calculatedTotal, "g", "Solicitado:", requestedQuantity, "g");
      
      // Registrar cada hierba para depuración
      standardizedHerbs.forEach(herb => {
        console.log(`Hierba: ${herb.pinyinName}, Porcentaje: ${herb.percentage}%, Gramos: ${herb.grams}g`);
      });
      
      // Crear la versión final de la fórmula con valores calculados
      const finalFormula = {
        ...formula,
        totalGrams: requestedQuantity,
        herbs: standardizedHerbs
      };
      
      // Añadir a la prescripción
      setCurrentPrescription(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: formula.id,
            type: "formula",
            quantity: requestedQuantity,
            formula: finalFormula
          }
        ]
      }));
      
      toast({
        title: "Fórmula añadida",
        description: `${formula.pinyinName} añadida con ${requestedQuantity}g totales.`,
      });
    }
  };
  
  const addFormulaHerbsIndividually = (formula: FormulaWithHerbs) => {
    console.log("===== INICIO: Añadiendo hierbas individuales =====");
    console.log("Fórmula:", formula.pinyinName);
    
    // Verificar que la fórmula tenga hierbas
    if (!formula.herbs || formula.herbs.length === 0) {
      toast({
        title: "Sin hierbas",
        description: "Esta fórmula no contiene hierbas para añadir.",
        variant: "destructive",
      });
      return;
    }
    
    // ==== PASO 1: Preparar los datos de la fórmula ====
    
    // Obtener cantidad solicitada (o usar 100g por defecto)
    const requestedQuantity = (formula as any).totalGrams || (formula as any).quantity || 100;
    console.log("Cantidad solicitada:", requestedQuantity, "g");
    
    // ==== PASO 2: Normalizar porcentajes de las hierbas ====
    
    // Si las hierbas ya tienen porcentajes, usarlos
    // Si no, calcularlos basándonos en los gramos y el total
    const herbsWithPercentages = formula.herbs.map(herb => {
      // Si ya tiene porcentaje definido, utilizarlo
      if (herb.percentage && herb.percentage > 0) {
        return {
          ...herb,
          originalPercentage: herb.percentage
        };
      }
      
      // Si tiene gramos pero no porcentaje, calcular porcentaje
      // basado en el total de la fórmula estándar
      const totalGrams = formula.totalGrams || 
                         formula.herbs.reduce((sum, h) => sum + (h.grams || 0), 0) || 
                         100;
                         
      const calculatedPercentage = herb.grams ? 
                                  (herb.grams / totalGrams) * 100 : 
                                  100 / formula.herbs.length;
                                  
      return {
        ...herb,
        originalPercentage: Math.round(calculatedPercentage * 10) / 10
      };
    });
    
    // Asegurarnos que los porcentajes sumen 100% exacto
    const totalPercentage = herbsWithPercentages.reduce((sum, herb) => 
                            sum + (herb.originalPercentage || 0), 0);
                         
    const normalizedHerbs = herbsWithPercentages.map(herb => {
      // Normalizar para que la suma sea exactamente 100%
      const normalizedPercentage = totalPercentage > 0 ? 
                                   ((herb.originalPercentage || 0) / totalPercentage) * 100 :
                                   100 / herbsWithPercentages.length;
      
      // Calcular los gramos exactos para la cantidad solicitada
      const exactGrams = Math.round((normalizedPercentage * requestedQuantity / 100) * 10) / 10;
      
      return {
        ...herb,
        percentage: Math.round(normalizedPercentage * 10) / 10,
        grams: exactGrams,
        originalPercentage: undefined
      };
    });
    
    // Verificar que la suma de gramos sea correcta
    const totalCalculatedGrams = normalizedHerbs.reduce((sum, herb) => 
                                sum + (herb.grams || 0), 0);
    
    console.log(`VERIFICACIÓN: Total ${totalCalculatedGrams.toFixed(1)}g ≈ ${requestedQuantity}g solicitados`);
    
    // Mostrar cada hierba con su porcentaje y gramos calculados
    normalizedHerbs.forEach(herb => {
      console.log(`${herb.pinyinName}: ${herb.percentage}% = ${herb.grams}g`);
    });
    
    // ==== PASO 3: Añadir las hierbas a la prescripción ====
    normalizedHerbs.forEach(herb => {
      // IMPORTANTE: En las fórmulas importadas, algunas hierbas pueden no tener ID 
      // o tener ID 0, pero igual necesitamos añadirlas
      console.log(`Procesando hierba: ${herb.pinyinName}, ID: ${herb.id || 'no ID'}`);
      
      // Si la hierba no tiene ID asignado, hay que añadirla igualmente por su nombre
      // Buscar si la hierba ya existe en la prescripción (por ID o por nombre)
      const existingItem = currentPrescription.items.find(
        item => item.type === "herb" && item.herb && 
          (
            (herb.id && item.herb.id === herb.id) || 
            (!herb.id && item.herb.pinyinName === herb.pinyinName)
          )
      );
      
      // Si la hierba ya existe, actualizar su cantidad
      if (existingItem) {
        setCurrentPrescription(prev => ({
          ...prev,
          items: prev.items.map(item => 
            // Comparar por ID si existe, o por nombre si no hay ID
            (item.type === "herb" && item.herb && 
              ((herb.id && item.herb.id === herb.id) || 
              (!herb.id && item.herb.pinyinName === herb.pinyinName)))
              ? { 
                  ...item, 
                  quantity: Math.round(((item.quantity || 0) + (herb.grams || 0)) * 10) / 10,
                  herb: {
                    ...item.herb, 
                    // Actualizamos los datos importantes
                    percentage: herb.percentage,
                    grams: herb.grams
                  }
                }
              : item
          )
        }));
      } 
      // Si es una hierba nueva, añadirla a la prescripción
      else {
        setCurrentPrescription(prev => ({
          ...prev,
          items: [
            ...prev.items,
            {
              id: herb.id,
              type: "herb",
              quantity: herb.grams || 0,
              herb: {
                ...herb,
                // Asegurarnos que se guarde el porcentaje y los gramos
                percentage: herb.percentage,
                grams: herb.grams
              }
            }
          ]
        }));
      }
    });
    
    toast({
      title: "Hierbas añadidas",
      description: `${normalizedHerbs.length} hierbas de ${formula.pinyinName} (${requestedQuantity}g total).`,
    });
    
    console.log("===== FIN: Hierbas añadidas correctamente =====");
  };

  const removeItemFromPrescription = (index: number) => {
    setCurrentPrescription(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    
    toast({
      title: "Elemento eliminado",
      description: "El elemento ha sido eliminado de la prescripción.",
    });
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCurrentPrescription(prev => {
      const item = prev.items[index];
      
      // Si es una fórmula, necesitamos actualizar los gramos de sus hierbas proporcionalmente
      if (item && item.type === 'formula' && item.formula) {
        const oldQuantity = item.quantity;
        const ratio = quantity / oldQuantity; // Ratio de cambio
        
        // Crear una nueva versión de la fórmula con hierbas actualizadas
        const updatedFormula = {
          ...item.formula,
          herbs: (item.formula as FormulaWithHerbs).herbs?.map(herb => ({
            ...herb,
            // Actualizar los gramos manteniendo el mismo porcentaje
            grams: herb.grams ? Math.round((herb.grams * ratio) * 10) / 10 : undefined,
          })) || []
        };
        
        return {
          ...prev,
          items: prev.items.map((currentItem, i) => 
            i === index ? { 
              ...currentItem, 
              quantity, 
              formula: updatedFormula 
            } : currentItem
          )
        };
      }
      
      // Para hierbas individuales, solo actualizar la cantidad
      return {
        ...prev,
        items: prev.items.map((currentItem, i) => 
          i === index ? { ...currentItem, quantity } : currentItem
        )
      };
    });
  };

  const clearPrescription = () => {
    setCurrentPrescription({
      date: format(new Date(), "yyyy-MM-dd"),
      number: "1", // Se actualizará cuando se seleccione un paciente
      notes: "",
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      patientAddress: "",
      medicalConditions: {
        custom: []
      },
      medications: {
        custom: []
      },
      items: []
    });
    
    toast({
      title: "Prescripción limpiada",
      description: "Todos los elementos han sido eliminados de la prescripción.",
    });
  };

  const updatePrescriptionInfo = (field: string, value: string) => {
    setCurrentPrescription(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updateMedicalCondition = (condition: string, value: boolean) => {
    // Condiciones personalizadas (formato "custom:id")
    if (condition.startsWith("custom:")) {
      const conditionId = condition.split(":")[1];
      setCurrentPrescription(prev => ({
        ...prev,
        medicalConditions: {
          ...prev.medicalConditions,
          custom: prev.medicalConditions.custom.map(cond => 
            cond.id === conditionId ? { ...cond, active: value } : cond
          )
        }
      }));
    }
    // Medicaciones (formato "medication:id")
    else if (condition.startsWith("medication:")) {
      const medicationId = condition.split(":")[1];
      setCurrentPrescription(prev => ({
        ...prev,
        medications: {
          ...prev.medications,
          custom: prev.medications.custom.map(med => 
            med.id === medicationId ? { ...med, active: value } : med
          )
        }
      }));
    }
  };
  
  // Añadir nueva condición médica personalizada
  const addCustomMedicalCondition = (conditionName: string) => {
    setCurrentPrescription(prev => ({
      ...prev,
      medicalConditions: {
        ...prev.medicalConditions,
        custom: [
          ...prev.medicalConditions.custom,
          {
            id: Date.now().toString(), // ID único basado en timestamp
            name: conditionName,
            active: true // Activada por defecto
          }
        ]
      }
    }));
  };
  
  // Eliminar una condición médica personalizada
  const removeCustomMedicalCondition = (conditionId: string) => {
    setCurrentPrescription(prev => ({
      ...prev,
      medicalConditions: {
        ...prev.medicalConditions,
        custom: prev.medicalConditions.custom.filter(cond => cond.id !== conditionId)
      }
    }));
  };

  // Función para imprimir directamente
  const handlePrintConfig = useReactToPrint({
    documentTitle: `Prescripcion-${currentPrescription.number}`,
    onAfterPrint: () => {
      toast({
        title: "Impresión iniciada",
        description: "La prescripción se ha enviado a la impresora."
      });
    },
    // @ts-ignore - typings are incorrect for this library
    content: () => printRef.current,
  });
  
  // Función para generar PDF usando jsPDF (método original que funcionaba)
  const generatePDFWithJSPDF = () => {
    // Crear un nuevo documento PDF
    const doc = new jsPDF();
    
    // Añadir título
    doc.setFontSize(18);
    doc.text("Prescripción médica", 105, 15, { align: "center" });
    
    // Información del paciente
    doc.setFontSize(12);
    doc.text(`Paciente: ${currentPrescription.patientName}`, 20, 30);
    doc.text(`Fecha: ${currentPrescription.date}`, 20, 37);
    doc.text(`Nº Prescripción: ${currentPrescription.number}`, 20, 44);
    
    if (currentPrescription.patientEmail) {
      doc.text(`Email: ${currentPrescription.patientEmail}`, 20, 51);
    }
    
    if (currentPrescription.patientPhone) {
      doc.text(`Teléfono: ${currentPrescription.patientPhone}`, 20, 58);
    }
    
    // Tabla de hierbas y fórmulas
    const tableData = currentPrescription.items.map(item => {
      if (item.type === "herb" && item.herb) {
        return [
          item.herb.pinyinName,
          "Hierba",
          `${item.quantity}g`,
          item.herb.nature || "",
          item.herb.flavor || ""
        ];
      } else if (item.type === "formula" && item.formula) {
        return [
          item.formula.pinyinName,
          "Fórmula",
          `${item.quantity}g`,
          item.formula.nature || "",
          ""
        ];
      }
      return ["", "", "", "", ""];
    });
    
    // Añadir tabla
    autoTable(doc, {
      head: [['Nombre', 'Tipo', 'Cantidad', 'Naturaleza', 'Sabor']],
      body: tableData,
      startY: 70,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Añadir notas si existen
    if (currentPrescription.notes) {
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.text("Notas:", 20, finalY + 10);
      doc.setFontSize(10);
      
      // Dividir notas en líneas para que quepan en el documento
      const splitNotes = doc.splitTextToSize(currentPrescription.notes, 170);
      doc.text(splitNotes, 20, finalY + 20);
    }
    
    // Guardar PDF con nombre de archivo basado en número de prescripción
    doc.save(`Prescripcion-${currentPrescription.number}.pdf`);
    
    toast({
      title: "PDF generado",
      description: `Se ha descargado el PDF de la prescripción ${currentPrescription.number}.`
    });
  };
  
  // Wrapper para llamar a la función adecuada
  const handlePrint = () => {
    handlePrintConfig();
  };
  
  // Función para generar PDF usando html2pdf.js que mantiene todos los estilos
  const generatePDFWithHtml2PDF = () => {
    if (!printRef.current) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el elemento para generar el PDF.",
        variant: "destructive",
      });
      return;
    }

    // Añadir clase para hacer visible el contenido durante la generación del PDF
    document.body.classList.add('generating-pdf');
    
    // Configuración de html2pdf para mantener estilos CSS
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Prescripcion-${currentPrescription.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3, // Mayor calidad de imagen
        useCORS: true,
        logging: true, // Activar logging para debug
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        foreignObjectRendering: false // Intentar renderizar sin foreignObject para mejor compatibilidad
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
    };

    // Obtener el contenedor principal de la prescripción por su ID
    // Esto es más fiable que usar la referencia directa
    const element = document.getElementById('prescriptionContent');
    
    if (!element) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el contenido de la prescripción.",
        variant: "destructive",
      });
      document.body.classList.remove('generating-pdf');
      return;
    }
    
    // Asegurarse de que todos los estilos están aplicados y el contenido es visible
    element.style.display = 'block';
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    element.style.position = 'relative';
    element.style.overflow = 'visible';
    element.style.backgroundColor = 'white';
    element.style.padding = '20px';
    element.style.width = '210mm'; // Ancho A4
    
    // Añadir un mensaje de carga
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el PDF...",
    });

    // Usar un timeout para asegurarse de que el DOM se ha actualizado completamente
    setTimeout(() => {
      // Generar PDF directamente desde el elemento original
      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          // Restaurar clases y estilos
          document.body.classList.remove('generating-pdf');
          
          toast({
            title: "PDF generado",
            description: `Se ha descargado el PDF de la prescripción ${currentPrescription.number}.`
          });
        })
        .catch(error => {
          console.error("Error al generar PDF:", error);
          document.body.classList.remove('generating-pdf');
          
          toast({
            title: "Error",
            description: "Hubo un problema al generar el PDF. Intente de nuevo.",
            variant: "destructive",
          });
        });
    }, 500); // Pequeño delay para asegurar que el DOM está listo
  };

  // Wrapper para generar PDF
  const generatePDF = () => {
    generatePDFWithHtml2PDF();
  };

  const handleSavePrescription = () => {
    // Validar datos básicos
    if (!currentPrescription.patientName) {
      toast({
        title: "Error",
        description: "Debes ingresar el nombre del paciente.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentPrescription.items.length === 0) {
      toast({
        title: "Error",
        description: "La prescripción debe contener al menos un elemento.",
        variant: "destructive",
      });
      return;
    }
    
    // Obtenemos las fórmulas de la prescripción
    const formulaItems = currentPrescription.items.filter(item => item.type === "formula");
    // Usamos la primera fórmula si existe, o null si no hay fórmulas
    const formulaId = formulaItems.length > 0 ? formulaItems[0].id : null;
    
    // Si ya se seleccionó un paciente existente (tenemos un ID), usamos ese ID
    if (currentPrescription.patientId) {
      // Transformar los datos para el backend con el ID del paciente existente
      // Si no hay nombre, usamos "Fórmula personalizada"
      const prescriptionName = currentPrescription.name.trim() || "Fórmula personalizada";
      
      // Obtener los detalles de la fórmula si existe
      const selectedFormula = currentPrescription.items.find(item => 
        item.type === 'formula' && item.formula)?.formula;
      
      // Preparar la información detallada de la prescripción
      const customFormula = {
        // Datos básicos de la prescripción
        name: prescriptionName,
        
        // Guardar condiciones médicas
        medicalConditions: currentPrescription.medicalConditions,
        
        // Si hay una fórmula seleccionada, incluir sus detalles completos
        ...(selectedFormula ? {
          formulaId: selectedFormula.id,
          pinyinName: selectedFormula.pinyinName,
          chineseName: selectedFormula.chineseName,
          englishName: selectedFormula.englishName,
          category: selectedFormula.category,
          actions: selectedFormula.actions,
          indications: selectedFormula.indications,
          clinicalManifestations: selectedFormula.clinicalManifestations,
          clinicalApplications: selectedFormula.clinicalApplications,
          contraindications: selectedFormula.contraindications,
          cautions: selectedFormula.cautions,
          pharmacologicalEffects: selectedFormula.pharmacologicalEffects,
          research: selectedFormula.research,
          herbDrugInteractions: selectedFormula.herbDrugInteractions
        } : {}),
        
        // Incluir todas las hierbas de la prescripción con detalles completos
        herbs: currentPrescription.items.flatMap(item => {
          if (item.type === 'herb' && item.herb) {
            // Para hierbas individuales
            return [{
              herbId: item.herb.id,
              id: item.herb.id, // Duplicar para compatibilidad
              name: item.herb.pinyinName,
              pinyinName: item.herb.pinyinName, // Duplicar para compatibilidad
              chineseName: item.herb.chineseName,
              latinName: item.herb.latinName,
              englishName: item.herb.englishName || '',
              function: item.herb.function || item.herb.actions?.join(', ') || '',
              percentage: item.percentage || 0,
              grams: item.quantity,
              dosage: `${item.quantity}g`,
              // Incluir más detalles de la hierba si están disponibles
              category: item.herb.category,
              nature: item.herb.nature,
              flavor: item.herb.flavor,
              organAffinity: item.herb.organAffinity,
              preparationMethods: item.herb.preparationMethods,
              tcmActions: item.herb.tcmActions,
              commonCombinations: item.herb.commonCombinations
            }];
          } else if (item.type === 'formula' && item.formula && item.formula.herbs && item.formula.herbs.length > 0) {
            // Para las hierbas dentro de una fórmula
            return item.formula.herbs.map(herb => ({
              herbId: herb.id || 0,
              id: herb.id || 0,
              name: herb.pinyinName,
              pinyinName: herb.pinyinName,
              chineseName: herb.chineseName,
              latinName: herb.latinName || '',
              englishName: herb.englishName || '',
              function: herb.function || '',
              percentage: herb.percentage || 0,
              grams: herb.grams || Math.round((herb.percentage || 0) * item.quantity / 100),
              dosage: herb.grams ? 
                `${herb.grams}g (${herb.percentage || 0}%)` : 
                `${Math.round((herb.percentage || 0) * item.quantity / 100)}g (${herb.percentage || 0}%)`,
              // Incluir más detalles de la hierba si están disponibles
              category: herb.category,
              nature: herb.nature,
              flavor: herb.flavor,
              organAffinity: herb.organAffinity,
              preparationMethods: herb.preparationMethods,
              tcmActions: herb.tcmActions,
              commonCombinations: herb.commonCombinations
            }));
          }
          return [];
        })
      };
      
      const prescriptionData = {
        date: currentPrescription.date,
        patientId: parseInt(currentPrescription.patientId.toString(), 10), // Aseguramos que sea un número
        formulaId: formulaId, // Asignamos el formulaId o null
        name: prescriptionName,
        diagnosis: "", // Añadir campo de diagnóstico en la interfaz
        notes: currentPrescription.notes,
        status: "active",
        customFormula: customFormula, // Añadimos la información detallada
        items: currentPrescription.items.map(item => ({
          type: item.type,
          id: item.id,
          quantity: item.quantity
        }))
      };
      
      // Mostramos un mensaje de carga
      toast({
        title: "Guardando prescripción",
        description: "Espera un momento mientras se guarda la prescripción...",
      });
      
      // Aseguramos que el ID del paciente es un número
      const patientId = parseInt(currentPrescription.patientId.toString(), 10);
      
      // Pre-invalidamos las consultas para asegurar que los datos estén frescos
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/prescriptions`] });
      
      // Enviar la prescripción directamente
      savePrescriptionMutation.mutate(prescriptionData);
    } else {
      // Si no tenemos un ID, es un nuevo paciente
      // Crear un nuevo paciente con los datos ingresados
      const newPatientData = {
        name: currentPrescription.patientName,
        identifier: currentPrescription.patientEmail || null,
        contactInfo: currentPrescription.patientPhone || null,
        medicalHistory: currentPrescription.patientAddress || null
      };
      
      // Mostramos un mensaje de carga
      toast({
        title: "Creando paciente y prescripción",
        description: "Espera un momento mientras se crea el paciente y la prescripción...",
      });
      
      // Primero creamos el paciente y luego en el callback se creará la prescripción
      createPatientMutation.mutate(newPatientData);
    }
  };

  // Ocultar la impresión fuera del DOM pero accesible para imprimir
  const hiddenPrintContent = (
    <div className="hidden">
      <div>
        <PrintablePrescription 
          prescription={currentPrescription} 
          forwardedRef={printRef}
        />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className={`p-6 ${!sidebarExpanded ? 'pl-0' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href="/prescriptions">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Nueva Prescripción</h1>
          </div>
          <Button 
            className="flex items-center gap-1" 
            onClick={handleSavePrescription}
            disabled={currentPrescription.items.length === 0 || !currentPrescription.patientName}
          >
            <Save className="h-4 w-4" />
            <span>Guardar Prescripción</span>
          </Button>
        </div>
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6`}>
          {/* Panel de biblioteca */}
          <div className={`${!sidebarExpanded ? 'pl-6' : ''}`}>
            <LibraryPanel 
              herbs={herbs}
              formulas={formulas}
              onAddHerb={addHerbToPrescription}
              onAddFormula={addFormulaToPrescription}
              onAddFormulaHerbs={addFormulaHerbsIndividually}
            />
          </div>
          
          {/* Constructor de prescripción */}
          <div>
            <PrescriptionBuilder
              currentPrescription={currentPrescription}
              updatePrescriptionInfo={updatePrescriptionInfo}
              updateMedicalCondition={updateMedicalCondition}
              updateItemQuantity={updateItemQuantity}
              removeItemFromPrescription={removeItemFromPrescription}
              clearPrescription={clearPrescription}
              onPreview={() => setPreviewOpen(true)}
              onSave={handleSavePrescription}
              onGeneratePDF={generatePDF}
              addCustomMedicalCondition={addCustomMedicalCondition}
              removeCustomMedicalCondition={removeCustomMedicalCondition}
            />
          </div>
        </div>
        
        {/* Diálogo de vista previa */}
        <PrescriptionPreviewDialog
          prescription={currentPrescription}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onPrint={handlePrint}
          onGeneratePDF={generatePDF}
        />
        
        {/* Contenido oculto para imprimir */}
        {hiddenPrintContent}
      </div>
    </Layout>
  );
}