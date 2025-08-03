import { 
  Trash2, 
  Minus, 
  Plus, 
  X,
  AlertCircle,
  AlertTriangle,
  Circle,
  Save,
  FileDown,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientSelector from "@/components/PatientSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PrescriptionItem, PrescriptionData } from "@/types";

interface PrescriptionBuilderProps {
  currentPrescription: PrescriptionData;
  updatePrescriptionInfo: (field: string, value: string) => void;
  updateMedicalCondition: (condition: string, value: boolean) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
  removeItemFromPrescription: (index: number) => void;
  clearPrescription: () => void;
  onPreview: () => void;
  onSave?: () => void;
  onGeneratePDF?: () => void;
}

export default function PrescriptionBuilder({
  currentPrescription,
  updatePrescriptionInfo,
  updateMedicalCondition,
  updateItemQuantity,
  removeItemFromPrescription,
  clearPrescription,
  onPreview,
  onSave,
  onGeneratePDF
}: PrescriptionBuilderProps) {
  
  // Agrupar los elementos por tipo para mostrarlos organizados
  const herbItems = currentPrescription.items.filter(item => item.type === "herb");
  const formulaItems = currentPrescription.items.filter(item => item.type === "formula");
  
  // Verificar contraindicaciones para hierbas
  const checkHerbContraindications = (herb: any) => {
    if (!herb) return { 
      hasContraindications: false, 
      hasWarnings: false,
      contraindicationDetails: "",
      warningDetails: ""
    };
    
    // Asegurarse de que contraindications y cautions sean strings antes de llamar a toLowerCase
    const contraindications = typeof herb.contraindications === 'string' ? herb.contraindications.toLowerCase() : '';
    const cautions = typeof herb.cautions === 'string' ? herb.cautions.toLowerCase() : '';
    const medConditions = currentPrescription.medicalConditions;
    
    let hasContraindications = false;
    let contraindicationItems = [];
    
    if (medConditions.pregnancy && (contraindications.includes('embarazo') || contraindications.includes('pregnancy'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado en embarazo");
    }
    
    if (medConditions.breastfeeding && (contraindications.includes('lactancia') || contraindications.includes('breastfeeding'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado durante la lactancia");
    }
    
    if (medConditions.hypertension && (contraindications.includes('hipertensión') || contraindications.includes('hypertension'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado en hipertensión");
    }
    
    if (medConditions.liverDisease && (contraindications.includes('hígado') || contraindications.includes('liver'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado en enfermedad hepática");
    }
    
    let hasWarnings = false;
    let warningItems = [];
    
    if (medConditions.pregnancy && (cautions.includes('embarazo') || cautions.includes('pregnancy'))) {
      hasWarnings = true;
      warningItems.push("Precaución en embarazo");
    }
    
    if (medConditions.breastfeeding && (cautions.includes('lactancia') || cautions.includes('breastfeeding'))) {
      hasWarnings = true;
      warningItems.push("Precaución durante la lactancia");
    }
    
    if (medConditions.hypertension && (cautions.includes('hipertensión') || cautions.includes('hypertension'))) {
      hasWarnings = true;
      warningItems.push("Precaución en hipertensión");
    }
    
    if (medConditions.liverDisease && (cautions.includes('hígado') || cautions.includes('liver'))) {
      hasWarnings = true;
      warningItems.push("Precaución en enfermedad hepática");
    }
    
    const contraindicationDetails = contraindicationItems.length > 0 
      ? contraindicationItems.join('\n') 
      : "";
      
    const warningDetails = warningItems.length > 0 
      ? warningItems.join('\n') 
      : "";
    
    return { 
      hasContraindications, 
      hasWarnings,
      contraindicationDetails,
      warningDetails
    };
  };
  
  // Verificar contraindicaciones para fórmulas
  const checkFormulaContraindications = (formula: any) => {
    if (!formula) return { 
      hasContraindications: false, 
      hasWarnings: false,
      contraindicationDetails: "",
      warningDetails: ""
    };
    
    // Asegurarse de que contraindications y cautions sean strings antes de llamar a toLowerCase
    const contraindications = typeof formula.contraindications === 'string' ? formula.contraindications.toLowerCase() : '';
    const cautions = typeof formula.cautions === 'string' ? formula.cautions.toLowerCase() : '';
    const medConditions = currentPrescription.medicalConditions;
    
    let hasContraindications = false;
    let contraindicationItems = [];
    
    if (medConditions.pregnancy && (contraindications.includes('embarazo') || contraindications.includes('pregnancy'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado en embarazo");
    }
    
    if (medConditions.breastfeeding && (contraindications.includes('lactancia') || contraindications.includes('breastfeeding'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado durante la lactancia");
    }
    
    if (medConditions.hypertension && (contraindications.includes('hipertensión') || contraindications.includes('hypertension'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado en hipertensión");
    }
    
    if (medConditions.liverDisease && (contraindications.includes('hígado') || contraindications.includes('liver'))) {
      hasContraindications = true;
      contraindicationItems.push("Contraindicado en enfermedad hepática");
    }
    
    let hasWarnings = false;
    let warningItems = [];
    
    if (medConditions.pregnancy && (cautions.includes('embarazo') || cautions.includes('pregnancy'))) {
      hasWarnings = true;
      warningItems.push("Precaución en embarazo");
    }
    
    if (medConditions.breastfeeding && (cautions.includes('lactancia') || cautions.includes('breastfeeding'))) {
      hasWarnings = true;
      warningItems.push("Precaución durante la lactancia");
    }
    
    if (medConditions.hypertension && (cautions.includes('hipertensión') || cautions.includes('hypertension'))) {
      hasWarnings = true;
      warningItems.push("Precaución en hipertensión");
    }
    
    if (medConditions.liverDisease && (cautions.includes('hígado') || cautions.includes('liver'))) {
      hasWarnings = true;
      warningItems.push("Precaución en enfermedad hepática");
    }
    
    const contraindicationDetails = contraindicationItems.length > 0 
      ? contraindicationItems.join('\n') 
      : "";
      
    const warningDetails = warningItems.length > 0 
      ? warningItems.join('\n') 
      : "";
    
    return { 
      hasContraindications, 
      hasWarnings,
      contraindicationDetails,
      warningDetails
    };
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Prescription Builder</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearPrescription}
              className="h-8 px-2 text-xs"
              disabled={currentPrescription.items.length === 0}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>

            <Button 
              variant="default" 
              size="sm"
              onClick={onSave}
              className="h-8 px-2 text-xs"
              disabled={currentPrescription.items.length === 0 || !currentPrescription.patientName}
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={onPreview}
              className="h-8 px-2 text-xs"
              disabled={currentPrescription.items.length === 0}
            >
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="prescripcion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paciente">Patient Data</TabsTrigger>
              <TabsTrigger value="prescripcion">Prescription Content</TabsTrigger>
            </TabsList>
            
            {/* Tab: Patient Data */}
            <TabsContent value="paciente" className="space-y-4 pt-4">
              <div className="space-y-4">
                {/* Basic prescription information */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Prescription Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prescription-number">Number</Label>
                      <Input 
                        id="prescription-number" 
                        value={currentPrescription.number} 
                        onChange={(e) => updatePrescriptionInfo("number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prescription-date">Date</Label>
                      <Input 
                        id="prescription-date" 
                        type="date" 
                        value={currentPrescription.date} 
                        onChange={(e) => updatePrescriptionInfo("date", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Patient information */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Patient Information</h3>
                  
                  {/* Selector de paciente existente */}
                  <div className="mb-4">
                    <PatientSelector 
                      onSelectPatient={(patient) => {
                        // Actualizar los campos con los datos del paciente seleccionado
                        updatePrescriptionInfo("patientId", patient.id.toString());
                        updatePrescriptionInfo("patientName", patient.name);
                        updatePrescriptionInfo("patientEmail", patient.identifier || "");
                        updatePrescriptionInfo("patientPhone", patient.contactInfo || "");
                        updatePrescriptionInfo("patientAddress", patient.medicalHistory || "");
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-name">Name</Label>
                      <Input 
                        id="patient-name" 
                        value={currentPrescription.patientName} 
                        onChange={(e) => updatePrescriptionInfo("patientName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email</Label>
                      <Input 
                        id="patient-email" 
                        type="email" 
                        value={currentPrescription.patientEmail || ""} 
                        onChange={(e) => updatePrescriptionInfo("patientEmail", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-phone">Phone</Label>
                      <Input 
                        id="patient-phone" 
                        value={currentPrescription.patientPhone || ""} 
                        onChange={(e) => updatePrescriptionInfo("patientPhone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-address">Address</Label>
                      <Input 
                        id="patient-address" 
                        value={currentPrescription.patientAddress || ""} 
                        onChange={(e) => updatePrescriptionInfo("patientAddress", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Condiciones médicas */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-3">Medical Conditions</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-pregnancy" 
                          checked={currentPrescription.medicalConditions.pregnancy} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("pregnancy", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-pregnancy">Pregnancy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-breastfeeding" 
                          checked={currentPrescription.medicalConditions.breastfeeding} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("breastfeeding", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-breastfeeding">Breastfeeding</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-hypertension" 
                          checked={currentPrescription.medicalConditions.hypertension} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("hypertension", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-hypertension">Hypertension</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-liverDisease" 
                          checked={currentPrescription.medicalConditions.liverDisease} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("liverDisease", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-liverDisease">Liver Disease</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-allergies" 
                          checked={currentPrescription.medicalConditions.allergies} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("allergies", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-allergies">Allergies</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab: Prescription Content */}
            <TabsContent value="prescripcion" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="prescription-name">Prescription Name</Label>
                  <Input 
                    id="prescription-name" 
                    value={currentPrescription.name} 
                    onChange={(e) => updatePrescriptionInfo("name", e.target.value)}
                    placeholder="Fórmula personalizada (opcional)"
                  />
                </div>
              </div>
              
              {/* Prescription elements */}
              <div className="mb-4">
                <h3 className="font-medium mb-3">Prescription Elements</h3>
                
                {currentPrescription.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-muted-foreground">
                      Add herbs or formulas from the library to your prescription
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Herbs and Formulas combined into one continuous list */}
                    <div className="divide-y divide-gray-100">
                      {/* Herbs section */}
                      {herbItems.map((item, index) => {
                        const originalIndex = currentPrescription.items.findIndex(i => i === item);
                        return (
                          <div 
                            key={`herb-${item.id}-${index}`} 
                            className="py-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <p className="font-medium">{item.herb?.pinyinName}</p>
                                {(() => {
                                  const { hasContraindications, hasWarnings, contraindicationDetails, warningDetails } = checkHerbContraindications(item.herb);
                                  return (
                                    <>
                                      {hasContraindications && (
                                        <div className="ml-2 tooltip-container">
                                          <AlertCircle className="h-4 w-4 text-red-500" />
                                          <span className="tooltip">{contraindicationDetails}</span>
                                        </div>
                                      )}
                                      {hasWarnings && (
                                        <div className="ml-2 tooltip-container">
                                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                                          <span className="tooltip">{warningDetails}</span>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.herb?.latinName} {item.herb?.englishName && `(${item.herb.englishName})`}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center border rounded-md">
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateItemQuantity(originalIndex, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  className="h-8 w-16 border-0 text-center"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                      updateItemQuantity(originalIndex, value);
                                    }
                                  }}
                                />
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() => updateItemQuantity(originalIndex, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeItemFromPrescription(originalIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Formulas section */}
                      {formulaItems.map((item, index) => {
                        const originalIndex = currentPrescription.items.findIndex(i => i === item);
                        return (
                          <div 
                            key={`formula-${item.id}-${index}`} 
                            className="py-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Circle className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-50/50" />
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium">{item.formula?.pinyinName || item.formula?.englishName}</p>
                                    {(() => {
                                      const { hasContraindications, hasWarnings, contraindicationDetails, warningDetails } = checkFormulaContraindications(item.formula);
                                      return (
                                        <>
                                          {hasContraindications && (
                                            <div className="ml-2 tooltip-container">
                                              <AlertCircle className="h-4 w-4 text-red-500" />
                                              <span className="tooltip">{contraindicationDetails}</span>
                                            </div>
                                          )}
                                          {hasWarnings && (
                                            <div className="ml-2 tooltip-container">
                                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                                              <span className="tooltip">{warningDetails}</span>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {/* Chinese name hidden as requested */}
                                    {item.formula?.englishName && `${item.formula.englishName}`}
                                  </p>
                                </div>
                                <span className="ml-2 font-semibold text-gray-700">
                                  {item.quantity}g
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center border rounded-md">
                                  <Button
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-r-none"
                                    onClick={() => updateItemQuantity(originalIndex, item.quantity - 10)}
                                    disabled={item.quantity <= 10}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    className="h-8 w-16 border-0 text-center"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value) && value > 0) {
                                        updateItemQuantity(originalIndex, value);
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-l-none"
                                    onClick={() => updateItemQuantity(originalIndex, item.quantity + 10)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => removeItemFromPrescription(originalIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Mostrar las hierbas de la fórmula si existen */}
                            {item.formula && 'composition' in item.formula && item.formula.composition && (
                              <div className="mt-2 ml-6 pl-2 border-l-2 border-gray-100">
                                <div className="space-y-1">
                                  {(() => {
                                    try {
                                      // Procesar los datos de composición
                                      let herbComponents;
                                      
                                      if (typeof item.formula.composition === 'string') {
                                        herbComponents = JSON.parse(item.formula.composition);
                                      } else if (Array.isArray(item.formula.composition)) {
                                        herbComponents = item.formula.composition;
                                      } else if (item.formula.composition && 'herbs' in item.formula.composition && Array.isArray(item.formula.composition.herbs)) {
                                        herbComponents = item.formula.composition.herbs;
                                      } else {
                                        return <p className="text-sm italic">Formato de composición no válido</p>;
                                      }
                                      
                                      // Si herbComponents es un objeto con herbs, usar esa propiedad
                                      const herbs = Array.isArray(herbComponents.herbs) ? herbComponents.herbs : 
                                                   Array.isArray(herbComponents) ? herbComponents : [];
                                      
                                      if (herbs.length > 0) {
                                        return herbs.map((herb: any, idx: number) => {
                                          // Extraer la información de porcentaje del formato de datos
                                          let percentage = 0;
                                          if (herb.percentage) {
                                            percentage = parseFloat(herb.percentage);
                                          } else if (herb.dosage && typeof herb.dosage === 'string') {
                                            const dosageStr = herb.dosage.replace('%', '');
                                            percentage = parseFloat(dosageStr);
                                          }
                                          
                                          // Calcular los gramos proporcionales
                                          const actualGrams = herb.grams || Math.round((percentage * item.quantity / 100) * 10) / 10;
                                          
                                          return (
                                            <div key={`herb-${idx}`} className="flex justify-between border-b last:border-0 border-gray-100 pb-1 last:pb-0">
                                              <div className="flex items-center">
                                                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs mr-2">
                                                  {idx + 1}
                                                </span>
                                                <span className="font-medium text-sm">
                                                  {herb.pinyinName || herb.herb || herb.herbName || herb.name || "Hierba sin nombre"}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {percentage > 0 && (
                                                  <span className="text-xs text-gray-500">
                                                    {Math.round(percentage)}%
                                                  </span>
                                                )}
                                                <span className="text-sm font-medium text-primary">
                                                  {actualGrams}g
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        });
                                      }
                                      
                                      return <p className="text-sm italic">No hay detalles de la composición</p>;
                                    } catch (error) {
                                      console.error("Error al procesar la composición:", error);
                                      return <p className="text-sm italic">Error al cargar la composición</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            )}
                            
                            {/* Contraindicaciones si existen */}
                            {item.formula?.contraindications && (
                              <div className="mt-2 ml-6 pl-3 py-2 border-l-2 border-red-200 bg-red-50/50">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-red-700">Contraindicaciones:</p>
                                    <p className="text-xs text-red-600">{item.formula.contraindications}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Label htmlFor="prescription-notes" className="block text-sm font-medium mb-1">Notas de prescripción</Label>
                <Textarea
                  id="prescription-notes"
                  value={currentPrescription.notes}
                  onChange={(e) => updatePrescriptionInfo("notes", e.target.value)}
                  placeholder="Instrucciones especiales..."
                  className="w-full resize-none"
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}