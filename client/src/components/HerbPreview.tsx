import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Circle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Interfaces para la estructura jerárquica de TCM Actions
interface Combination {
  individually?: string;
  herbs?: string[];
  formula?: string;
  note?: string;
}

interface Case {
  description?: string;
  combinations?: Combination[];
}

interface Pattern {
  pattern: string;
  cases: Case[];
}

interface TcmAction {
  function: string;
  clinicalUses?: Pattern[];
}

// Define la interfaz para Herb
interface Herb {
  id: number;
  pinyin_name: string;
  chinese_name: string;
  english_name?: string;
  latin_name?: string;
  category?: string;
  nature?: string;
  flavor?: string;
  toxicity?: string;
  dosage?: string;
  meridians?: string[];
  tcm_actions?: TcmAction[];
  functions?: string[];
  applications?: string;
  common_combinations?: any[];
  contraindications?: string;
  cautions?: string;
  properties?: string;
  pharmacological_effects?: string[];
  laboratory_effects?: string[];
  herb_drug_interactions?: string[];
  clinical_studies_and_research?: string[];
  biological_effects?: string[];
  notes?: string;
  standard_indications?: string;
  pregnancy_considerations?: string;
  reference_list?: string[];
  references_list?: string[];
}

interface HerbPreviewProps {
  herb: any; // Usando any para evitar problemas de tipado con el schema
  isOpen: boolean;
  onClose: () => void;
  onEdit?: ((id: number) => void) | undefined;
}

// Convertir siglas de meridianos a nombres completos
function getFullMeridianName(meridian: string): string {
  const meridianMap: Record<string, string> = {
    'LU': 'Lung',
    'UB': 'Urinary Bladder',
    'KD': 'Kidney',
    'HT': 'Heart',
    'ST': 'Stomach',
    'SP': 'Spleen',
    'LV': 'Liver',
    'LI': 'Large Intestine',
    'SI': 'Small Intestine',
    'GB': 'Gallbladder',
    'SJ': 'San Jiao',
    'PC': 'Pericardium',
    'BL': 'Urinary Bladder',
    'TE': 'Triple Burner'
  };

  // Comprobar si el meridiano es una sigla conocida
  if (meridianMap[meridian]) {
    return meridianMap[meridian];
  }

  // Devolver el meridiano original si no se encuentra
  return meridian;
}

// Obtener clase de color basada en la naturaleza de la hierba
function getNatureColorClass(nature: string): string {
  const natureLower = nature.toLowerCase();
  if (natureLower.includes('hot') || natureLower.includes('caliente')) {
    return 'bg-red-600 text-white';
  } else if (natureLower.includes('warm') || natureLower.includes('tibia')) {
    return 'bg-orange-400 text-orange-800';
  } else if (natureLower.includes('neutral') || natureLower.includes('neutra')) {
    return 'bg-gray-400 text-white';
  } else if (natureLower.includes('cool') || natureLower.includes('fresca')) {
    return 'bg-blue-300 text-blue-800';
  } else if (natureLower.includes('cold') || natureLower.includes('fría')) {
    return 'bg-blue-600 text-white';
  }
  return 'bg-gray-300 text-gray-800'; // Default
}

// Obtener solo el color de fondo basado en la naturaleza para viñetas
function getNatureColor(nature: string | undefined | null): string {
  if (!nature) return 'bg-primary/60';

  const natureLower = nature.toLowerCase();
  if (natureLower.includes('hot') || natureLower.includes('caliente')) {
    return 'bg-red-600';
  } else if (natureLower.includes('warm') || natureLower.includes('tibia')) {
    return 'bg-orange-400';
  } else if (natureLower.includes('neutral') || natureLower.includes('neutra')) {
    return 'bg-gray-400';
  } else if (natureLower.includes('cool') || natureLower.includes('fresca')) {
    return 'bg-blue-300';
  } else if (natureLower.includes('cold') || natureLower.includes('fría')) {
    return 'bg-blue-600';
  }
  return 'bg-primary/60'; // Default
}

const HerbPreview: React.FC<HerbPreviewProps> = ({ 
  herb, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  const [expandedFunctions, setExpandedFunctions] = useState<string[]>([]);

  // Imprimir la estructura de la hierba para depurar
  console.log("Herb object:", herb);

  // Depurar referencias
  console.log("Referencias:", herb.reference_list || herb.references_list);
  if (herb.reference_list || herb.references_list) {
    console.log("Tipo de referencias:", typeof (herb.reference_list || herb.references_list), Array.isArray(herb.reference_list || herb.references_list));
  } else {
    console.log("No hay referencias o es undefined");
  }

  // Handle both camelCase and snake_case field names for TCM Actions
  const tcmActions = herb.tcm_actions || herb.tcmActions;
  console.log("TCM Actions field:", tcmActions);
  console.log("TCM Actions type:", typeof tcmActions);

  // Parse TCM Actions if it's a string
  let parsedTcmActions: any[] = [];
  if (tcmActions && typeof tcmActions === 'string') {
    try {
      parsedTcmActions = JSON.parse(tcmActions);
      console.log("TCM Actions (parsed from string):", parsedTcmActions);
    } catch (e) {
      console.error("Error parsing tcmActions string:", e);
    }
  } else if (Array.isArray(tcmActions)) {
    parsedTcmActions = tcmActions;
    console.log("TCM Actions (original):", tcmActions);
  }

  const toggleFunction = (functionName: string) => {
    setExpandedFunctions(prev => 
      prev.includes(functionName) 
        ? prev.filter(f => f !== functionName) 
        : [...prev, functionName]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="sticky top-0 bg-[#F2F2F7] z-50 border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center flex-grow">
              <div className="flex items-center flex-wrap">
                <span className="text-xl font-bold mr-2">{herb.pinyin_name}</span>
                {/* Chinese name hidden as requested */}
              </div>
              {herb.latin_name && (
                <span className="text-sm italic text-gray-500 font-medium sm:ml-2 mt-1 sm:mt-0">
                  ({herb.latin_name})
                </span>
              )}
              {herb.category && (
                <Badge variant="outline" className="sm:ml-4 mt-2 sm:mt-0 bg-white text-gray-700 border-gray-200">{herb.category}</Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="space-y-1">
            {herb.english_name && <div className="text-sm text-gray-600 italic">{herb.english_name}</div>}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-visible">
          {/* Información básica en orden: 
              Primera fila: naturaleza, sabor, tropismo
              Segunda fila: toxicidad, dosis 
           */}
          <div className="grid grid-cols-1 gap-4 p-4 bg-white rounded-lg mb-6">
            {/* Primera fila: naturaleza, sabor, tropismo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Naturaleza */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Naturaleza</h3>
                {herb.nature ? (
                  <Badge 
                    className={`${getNatureColorClass(herb.nature)} font-medium`}
                  >
                    {herb.nature}
                  </Badge>
                ) : (
                  <p className="font-medium">No especificada</p>
                )}
              </div>

              {/* Sabor como chip */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Sabor</h3>
                {herb.flavor ? (
                  <Badge 
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium"
                  >
                    {herb.flavor}
                  </Badge>
                ) : (
                  <p className="font-medium">No especificado</p>
                )}
              </div>

              {/* Meridianos (Tropismo) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Tropismo de Meridianos</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(herb.meridians) && herb.meridians.length > 0 ? 
                    herb.meridians.map((meridian: string, index: number) => {
                      const fullMeridianName = getFullMeridianName(meridian);
                      const meridianKey = fullMeridianName.replace(/\s+/g, '-');
                      return (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className={`meridian-badge meridian-${meridianKey}`}
                        >
                          {fullMeridianName}
                        </Badge>
                      );
                    }) : 
                    <p className="text-muted-foreground">No especificado</p>
                  }
                </div>
              </div>
            </div>

            {/* Segunda fila: toxicidad y dosis */}
            {(herb.toxicity || (herb.dosage && herb.dosage.trim() !== "")) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Toxicidad (solo si está presente) */}
                {herb.toxicity && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Toxicidad</h3>
                    <Badge 
                      className="bg-red-100 text-red-800 hover:bg-red-200 font-medium"
                    >
                      {herb.toxicity}
                    </Badge>
                  </div>
                )}

                {/* Dosificación (solo si está especificada) */}
                {herb.dosage && herb.dosage.trim() !== "" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Dosificación</h3>
                    <p className="font-medium">{herb.dosage}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TCM Actions como acordeón */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>

            {parsedTcmActions && parsedTcmActions.length > 0 ? (
              <div className="space-y-4">
                {/* Usar el componente Accordion de shadcn/ui */}
                <Accordion type="multiple" className="divide-y divide-gray-100">
                  {parsedTcmActions.map((action: any, index: number) => (
                    <AccordionItem 
                      key={index} 
                      value={`action-${index}`}
                      className="border-none bg-transparent py-2"
                    >
                      {/* Cabecera del acordeón - Función principal */}
                      <AccordionTrigger className="px-0 py-3 hover:no-underline transition-all duration-300 ease-in-out">
                        <div className="flex items-center gap-2">
                          <Circle className="h-2.5 w-2.5 text-primary fill-primary opacity-80" />
                          <h4 className="font-medium text-gray-800 text-left">{action.function}</h4>
                        </div>
                      </AccordionTrigger>

                      {/* Contenido del acordeón */}
                      <AccordionContent className="px-3 pt-1 pb-3">
                        {/* Patrones clínicos */}
                        {action.clinicalUses && action.clinicalUses.length > 0 ? (
                          <div className="space-y-3">
                            {action.clinicalUses.map((pattern: any, patternIdx: number) => (
                              <div key={patternIdx} className="mt-2">
                                {/* Patrón clínico */}
                                {pattern.pattern && (
                                  <div className="pl-3 py-1 border-l-2 border-primary/40 mb-2">
                                    <div className="flex items-center gap-2">
                                      <Circle className="h-2 w-2 text-primary fill-primary/70" />
                                      <h5 className="font-medium text-sm text-gray-800">{pattern.pattern}</h5>
                                    </div>
                                  </div>
                                )}

                                {/* Casos clínicos */}
                                {pattern.cases && pattern.cases.length > 0 && (
                                  <div className="pl-5 space-y-3">
                                    {pattern.cases.map((caseItem: any, caseIdx: number) => (
                                      <div key={caseIdx} className="border-l border-gray-200 pl-3">
                                        {/* Descripción del caso */}
                                        {caseItem.description && (
                                          <div className="text-sm text-gray-700 mb-2 font-medium">
                                            {caseItem.description}
                                          </div>
                                        )}

                                        {/* Combinaciones de la hierba */}
                                        {Array.isArray(caseItem.combinations) && caseItem.combinations.length > 0 && (
                                          <div className="space-y-2">
                                            {caseItem.combinations.map((combo: any, comboIdx: number) => (
                                              <div 
                                                key={comboIdx} 
                                                className="text-xs bg-gray-50 p-2 rounded border border-gray-100"
                                              >
                                                {/* Usado individualmente */}
                                                {combo.individually && (
                                                  <div className="text-primary-600 font-medium mb-1">
                                                    {typeof combo.individually === 'string' && combo.individually !== 'individually' 
                                                      ? combo.individually 
                                                      : "Usado individualmente"}
                                                  </div>
                                                )}

                                                {/* Combinación con otras hierbas y fórmula */}
                                                {Array.isArray(combo.herbs) && combo.herbs.length > 0 && (
                                                  <div className="flex flex-wrap items-center gap-1 mb-1">
                                                    {combo.herbs.map((herb: any, herbIdx: number) => (
                                                      <Badge 
                                                        key={herbIdx}
                                                        variant="outline" 
                                                        className="bg-white text-primary border-primary/70 font-medium text-[10px] py-0.5"
                                                      >
                                                        {herb}
                                                      </Badge>
                                                    ))}

                                                    {/* Fórmula junto a las hierbas */}
                                                    {combo.formula && (
                                                      <div className="flex items-center ml-2 border-l pl-2">
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium text-[10px] py-0.5">
                                                          {combo.formula}
                                                        </Badge>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}

                                                {/* Fórmula sola (sin hierbas) */}
                                                {!combo.herbs?.length && combo.formula && (
                                                  <div className="flex items-center mb-1">
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium text-[10px] py-0.5">
                                                      {combo.formula}
                                                    </Badge>
                                                  </div>
                                                )}

                                                {/* Nota */}
                                                {combo.note && (
                                                  <div className="mt-1 italic text-gray-500">
                                                    {combo.note}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 py-2">No clinical uses specified</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No TCM actions information available
              </div>
            )}
          </div>

          {/* Efectos farmacológicos */}
          {herb.pharmacological_effects && herb.pharmacological_effects.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Efectos Farmacológicos</h3>
              <div className="flex flex-wrap gap-2">
                {herb.pharmacological_effects.map((effect: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Efectos biológicos */}
          {herb.biological_effects && herb.biological_effects.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Efectos Biológicos</h3>
              <div className="flex flex-wrap gap-2">
                {herb.biological_effects.map((effect: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contraindicaciones */}
          {herb.contraindications && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-red-600">Contraindicaciones</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(herb.contraindications) ? 
                  herb.contraindications.map((contraindication: any, index: number) => (
                    <Badge key={index} variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      {contraindication}
                    </Badge>
                  )) : 
                  <p className="text-sm text-gray-700">{herb.contraindications}</p>
                }
              </div>
            </div>
          )}

          {/* Precauciones */}
          {herb.cautions && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-orange-600">Precauciones</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(herb.cautions) ? 
                  herb.cautions.map((caution: any, index: number) => (
                    <Badge key={index} variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      {caution}
                    </Badge>
                  )) : 
                  <p className="text-sm text-gray-700">{herb.cautions}</p>
                }
              </div>
            </div>
          )}

          {/* Consideraciones durante el embarazo */}
          {herb.pregnancy_considerations && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Embarazo</h3>
              <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-200 px-3 py-1">
                {herb.pregnancy_considerations}
              </Badge>
            </div>
          )}

          {/* Interacciones con medicamentos */}
          {herb.herb_drug_interactions && herb.herb_drug_interactions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-purple-600">Interacciones con Medicamentos</h3>
              <div className="flex flex-wrap gap-2">
                {herb.herb_drug_interactions.map((interaction: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    {interaction}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Referencias */}
          {(herb.reference_list || herb.references_list) && (herb.reference_list?.length > 0 || herb.references_list?.length > 0) && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Referencias</h3>
              <div className="space-y-1">
                {(herb.reference_list || herb.references_list || []).map((reference: any, index: number) => (
                  <p key={index} className="text-sm text-gray-600">• {reference}</p>
                ))}
              </div>
            </div>
          )}

          {/* Estudios clínicos e investigaciones */}
          {herb.clinical_studies_and_research && herb.clinical_studies_and_research.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Estudios Clínicos e Investigaciones</h3>
              <div className="space-y-1">
                {herb.clinical_studies_and_research.map((study: any, index: number) => (
                  <p key={index} className="text-sm text-gray-600">• {study}</p>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {herb.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Notas</h3>
              <p className="text-sm italic">{herb.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default HerbPreview;