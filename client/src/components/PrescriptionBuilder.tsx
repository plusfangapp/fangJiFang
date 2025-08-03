import React, { useState, useCallback } from "react";
import { Trash2, Minus, Plus, X, Save, Eye, AlertTriangle, AlertCircle, Pill } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { debounce } from "@/lib/performance";
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

  // Función auxiliar para verificar si una condición médica está activa
  const hasActiveCondition = (prescription: any, conditionName: string): boolean => {
    if (!prescription.medicalConditions || !prescription.medicalConditions.custom) {
      return false;
    }

    // Buscar en las condiciones personalizadas por nombre similar
    return prescription.medicalConditions.custom.some(
      (condition: any) => 
        condition.active && 
        condition.name.toLowerCase().includes(conditionName.toLowerCase())
    );
  };
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl"></CardTitle>
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
                <div className="border rounded-md p-4 bg-white">
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
                <div className="border rounded-md p-4 bg-white">
                  <h3 className="font-semibold mb-3">Patient Information</h3>

                  {/* Selector de paciente existente */}
                  <div className="mb-4">
                    <PatientSelector 
                      onSelectPatient={(patient) => {
                        updatePrescriptionInfo("patientId", patient.id.toString());
                        updatePrescriptionInfo("patientName", patient.name);
                        updatePrescriptionInfo("patientEmail", patient.identifier || "");
                        updatePrescriptionInfo("patientPhone", patient.contactInfo || "");
                        updatePrescriptionInfo("patientAddress", patient.medicalHistory || "");
                      }}
                      updatePrescriptionNumber={(number) => {
                        updatePrescriptionInfo("number", number);
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
                </div>

                {/* Medical Conditions */}
                <div className="border rounded-md p-4 bg-white mt-4">
                  <h3 className="font-semibold mb-3">Medical Conditions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.isArray(currentPrescription.medicalConditions?.custom) && 
                      currentPrescription.medicalConditions.custom.map((condition) => (
                        <div key={condition.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`condition-${condition.id}`}
                            checked={condition.active || false}
                            onCheckedChange={(checked) => 
                              updateMedicalCondition(`custom:${condition.id}`, checked as boolean)
                            }
                          />
                          <Label htmlFor={`condition-${condition.id}`}>{condition.name}</Label>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Medications Section */}
                <div className="border rounded-md p-4 bg-white mt-4">
                  <h3 className="font-semibold mb-3">Medicaciones</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(!Array.isArray(currentPrescription.medications?.custom) || currentPrescription.medications.custom.length === 0) ? (
                      <div className="col-span-3 text-gray-500 text-sm italic">
                        No hay medicaciones registradas. Añada medicaciones en la sección "Mi Cuenta".
                      </div>
                    ) : (
                      currentPrescription.medications.custom.map((medication) => (
                        <div key={medication.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                          <Checkbox 
                            id={`medication-${medication.id}`}
                            checked={medication.active || false}
                            onCheckedChange={(checked) => 
                              updateMedicalCondition(`medication:${medication.id}`, checked as boolean)
                            }
                          />
                          <Label htmlFor={`medication-${medication.id}`} className="flex flex-col cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{medication.name}</span>
                            </div>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Prescription Content */}
            <TabsContent value="prescripcion" className="space-y-4 pt-4">
              <div className="space-y-4">
                {currentPrescription.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>No herbs or formulas have been added to the prescription.</p>
                    <p className="text-sm mt-2">Add herbs or formulas from the library.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Lista unificada de elementos de prescripción */}
                    <h3 className="font-semibold mb-3">Fórmula</h3>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="divide-y divide-gray-200">
                        {currentPrescription.items.map((item, index) => {
                          const isFormula = item.type === "formula";

                          return (
                            <div key={`item-${item.id}-${index}`} className="flex flex-col py-3">
                              <div className="flex items-start space-x-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">
                                        {isFormula 
                                          ? (item.formula?.pinyinName || "") 
                                          : (item.herb?.pinyinName || "")}
                                      </h4>
                                      {/* Indicadores visuales de advertencias */}
                                      {/* Indicadores específicos de contraindicaciones y precauciones */}
                                      {(() => {
                                        // Verificar y procesar condiciones médicas activas
                                        const hasConditions = Array.isArray(currentPrescription.medicalConditions?.custom);
                                        const activeConditions = hasConditions 
                                          ? currentPrescription.medicalConditions.custom
                                              .filter(condition => condition.active)
                                              .map(condition => condition.name.toLowerCase())
                                          : [];

                                        // Verificar y procesar medicamentos activos
                                        const hasMedications = Array.isArray(currentPrescription.medications?.custom);
                                        const activeMedications = hasMedications
                                          ? currentPrescription.medications.custom
                                              .filter(medication => medication.active)
                                              .map(medication => medication.name.toLowerCase())
                                          : [];

                                        // Si no hay condiciones ni medicamentos activos, no mostrar nada
                                        if (activeConditions.length === 0 && activeMedications.length === 0) {
                                          return null;
                                        }

                                        // Obtener contraindicaciones y precauciones del ítem actual
                                        const contraindications = isFormula 
                                          ? (item.formula?.contraindications || "").toLowerCase()
                                          : (item.herb?.contraindications || "").toLowerCase();

                                        const cautions = isFormula
                                          ? (item.formula?.cautions || "").toLowerCase()
                                          : (item.herb?.cautions || "").toLowerCase();

                                        // Obtener interacciones con medicamentos
                                        const drugInteractions = isFormula
                                          ? (item.formula?.herbDrugInteractions || "").toLowerCase()
                                          : (item.herb?.herbDrugInteractions?.toString() || "").toLowerCase();

                                        // Verificar coincidencias para condiciones médicas
                                        const matchingContraindications: string[] = [];
                                        const matchingCautions: string[] = [];

                                        activeConditions.forEach(condition => {
                                          // Buscar en contraindicaciones
                                          if (contraindications.includes(condition)) {
                                            matchingContraindications.push(
                                              currentPrescription.medicalConditions.custom.find(
                                                c => c.active && c.name.toLowerCase() === condition
                                              )?.name || condition
                                            );
                                          }

                                          // Buscar en precauciones
                                          if (cautions.includes(condition)) {
                                            matchingCautions.push(
                                              currentPrescription.medicalConditions.custom.find(
                                                c => c.active && c.name.toLowerCase() === condition
                                              )?.name || condition
                                            );
                                          }
                                        });

                                        // Verificar interacciones con medicamentos activos
                                        const matchingMedications: string[] = [];

                                        activeMedications.forEach(medication => {
                                          if (drugInteractions.includes(medication)) {
                                            matchingMedications.push(
                                              currentPrescription.medications.custom.find(
                                                m => m.active && m.name.toLowerCase() === medication
                                              )?.name || medication
                                            );
                                          }
                                        });

                                        return (
                                          <div className="flex ml-2 gap-1.5">
                                            {/* Contraindicaciones */}
                                            {matchingContraindications.length > 0 && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger>
                                                    <div className="relative">
                                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent side="top" className="bg-white border border-red-200 p-2">
                                                    <p className="font-bold text-red-700">¡Contraindicaciones!</p>
                                                    <ul className="list-disc pl-4 mt-1">
                                                      {matchingContraindications.map((condition, i) => (
                                                        <li key={i} className="text-sm text-red-600">{condition}</li>
                                                      ))}
                                                    </ul>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}

                                            {/* Precauciones */}
                                            {matchingCautions.length > 0 && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger>
                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                  </TooltipTrigger>
                                                  <TooltipContent side="top" className="bg-white border border-amber-200 p-2">
                                                    <p className="font-bold text-amber-700">Precauciones</p>
                                                    <ul className="list-disc pl-4 mt-1">
                                                      {matchingCautions.map((condition, i) => (
                                                        <li key={i} className="text-sm text-amber-600">{condition}</li>
                                                      ))}
                                                    </ul>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}

                                            {/* Interacciones con medicamentos */}
                                            {matchingMedications.length > 0 && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger>
                                                    <div className="relative">
                                                      <Pill className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent side="top" className="bg-white border border-purple-200 p-2">
                                                    <p className="font-bold text-purple-700">¡Interacciones con medicamentos!</p>
                                                    <ul className="list-disc pl-4 mt-1">
                                                      {matchingMedications.map((medication, i) => (
                                                        <li key={i} className="text-sm text-purple-600">{medication}</li>
                                                      ))}
                                                    </ul>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 italic">
                                      {isFormula 
                                        ? (item.formula?.englishName || "") 
                                        : (item.herb?.latinName || "")}
                                    </p>

                                  {/* Mostrar hierbas que componen la fórmula */}
                                  {isFormula && item.formula?.composition && (
                                    <div className="mt-2 pl-2 border-l-2 border-gray-200">
                                      <div className="space-y-1">
                                        {Array.isArray(item.formula.composition) && 
                                         item.formula.composition.map((component, idx) => {
                                          // Extraer el valor numérico del porcentaje de la dosificación
                                          let percentValue = 0;
                                          if (component.dosage) {
                                            const percentMatch = component.dosage.match(/(\d+(?:\.\d+)?)/);
                                            if (percentMatch && percentMatch[1]) {
                                              percentValue = parseFloat(percentMatch[1]);
                                            }
                                          }

                                          // Calcular los gramos basados en el porcentaje y la cantidad total
                                          const gramsValue = (percentValue * item.quantity / 100).toFixed(1);

                                          return (
                                            <div key={`component-${idx}`} className="flex justify-between text-xs">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                  {component.herb || component.name || component.herbName || "Componente"}
                                                </span>
                                                <span className="text-gray-500 flex items-center gap-2">
                                                  {component.dosage || (percentValue ? `${percentValue}%` : '')}
                                                  {gramsValue && <span className="font-bold ml-1">{gramsValue}g</span>}
                                                </span>
                                                {component.function && (
                                                  <span className="text-gray-400 text-xs italic ml-1">
                                                    ({component.function})
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-r-none border-r-0"
                                    onClick={() => updateItemQuantity(index, Math.max(1, (item.quantity || 0) - 1))}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <input
                                    type="number"
                                    min="1"
                                    className="w-12 h-6 text-center border text-sm rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={item.quantity || 0}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value, 10);
                                      if (!isNaN(value) && value > 0) {
                                        updateItemQuantity(index, value);
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const value = parseInt(e.target.value, 10);
                                      if (isNaN(value) || value < 1) {
                                        updateItemQuantity(index, 1);
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-l-none border-l-0"
                                    onClick={() => updateItemQuantity(index, (item.quantity || 0) + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm ml-2">g</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => removeItemFromPrescription(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Label htmlFor="prescription-notes" className="block text-sm font-medium mb-1">Prescription notes</Label>
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
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearPrescription}
              className="h-8 px-2 text-xs"
              disabled={currentPrescription.items.length === 0}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
            {onSave && (
              <Button 
                variant="default" 
                size="sm"
                onClick={onSave}
                className="h-8 px-2 text-xs"
                disabled={currentPrescription.items.length === 0 || !currentPrescription.patientName}
              >
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            )}
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
        </CardContent>
      </Card>
    </div>
  );
}