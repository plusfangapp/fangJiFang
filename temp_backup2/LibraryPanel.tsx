import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChipDisplay from "./ChipDisplay";

export interface Herb {
  id: number;
  pinyinName: string;
  chineseName?: string;
  latinName?: string;
  englishName?: string;
  category?: string;
  subcategory?: string;
  pinyin?: string;
  simplifiedChinese?: string;
  traditionalChinese?: string;
  nature?: string;
  flavor?: string;
  channels?: string[];
  actions?: string[];
  indications?: string[];
  dosage?: string;
  usagePrecautions?: string[];
  commonCombinations?: string[];
  TCMFunctions?: string[];
  biomedicalPharmacoActions?: string[];
  clinicalResearch?: string[];
  medicinalParts?: string[];
  majorKnownChemicalConstituents?: string[];
  preparationForms?: string[];
  relevantTemperature?: string;
  relevantMeridians?: string[];
  relevantOrganSystem?: string;
  syndromePatterns?: string[];
  herbCategoryCombos?: string[];
  biomedicalEffects?: string[];
  pharmacologicalEffects?: string[];
  clinicalNotes?: string[];
  herbDrugInteractions?: string[];
  pregnancyAndLactationSafety?: string;
  contraindications?: string[];
  safetyIssues?: string;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HerbWithGrams extends Herb {
  grams: number;
}

export interface FormulaHerb {
  id: number;
  formulaId: number;
  herbId: number;
  grams: number;
  herb?: Herb;
}

export interface Formula {
  id: number;
  pinyinName: string;
  chineseName?: string;
  category: string;
  action?: string[];
  syndromePattern?: string[];
  caseStudies?: string[];
  commonCombinations?: string[];
  medicinalEffects?: string[];
  biomedicalEffects?: string[];
  contraindications?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  herbs?: FormulaHerb[];
}

export interface FormulaWithHerbs extends Formula {
  herbs: FormulaHerb[];
}

interface LibraryPanelProps {
  herbs: Herb[];
  formulas: FormulaWithHerbs[] | Formula[];
  onAddHerb: (herb: Herb | HerbWithGrams) => void;
  onAddFormula: (formula: FormulaWithHerbs) => void;
  onAddFormulaHerbs: (formula: FormulaWithHerbs) => void;
}

export default function LibraryPanel({
  herbs,
  formulas,
  onAddHerb,
  onAddFormula,
  onAddFormulaHerbs,
}: LibraryPanelProps) {
  const [herbSearch, setHerbSearch] = useState<string>("");
  const [formulaSearch, setFormulaSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormulaCategory, setSelectedFormulaCategory] = useState<string>("all");
  const [tabValue, setTabValue] = useState<string>("herbs");
  const [herbQuantity, setHerbQuantity] = useState<number>(6);
  const [formulaQuantity, setFormulaQuantity] = useState<number>(100);
  const [showHerbDetailDialog, setShowHerbDetailDialog] = useState<boolean>(false);
  const [showFormulaDetailDialog, setShowFormulaDetailDialog] = useState<boolean>(false);
  const [selectedHerbDetail, setSelectedHerbDetail] = useState<Herb | HerbWithGrams | null>(null);
  const [selectedFormulaDetail, setSelectedFormulaDetail] = useState<FormulaWithHerbs | null>(null);
  
  const herbCategories = [...new Set(herbs.map((herb) => herb.category).filter(Boolean))].sort();
  const formulaCategories = [...new Set(formulas.map((formula) => formula.category).filter(Boolean))].sort();
  
  const filteredHerbs = herbs.filter((herb) => {
    const matchesSearch = 
      herb.pinyinName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.latinName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.englishName?.toLowerCase().includes(herbSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || herb.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const filteredFormulas = formulas.filter((formula) => {
    const matchesSearch = 
      formula.pinyinName?.toLowerCase().includes(formulaSearch.toLowerCase());
    
    const matchesCategory = selectedFormulaCategory === "all" || formula.category === selectedFormulaCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Función para agregar una hierba con cantidad
  const handleAddHerbWithQuantity = (herb: Herb | HerbWithGrams) => {
    const herbWithGrams: HerbWithGrams = {
      ...herb,
      grams: herbQuantity
    };
    onAddHerb(herbWithGrams);
  };

  // Función para agregar una fórmula con cantidad
  const handleAddFormulaWithQuantity = (formula: FormulaWithHerbs) => {
    // Hacemos una copia profunda de la fórmula
    const formulaWithUpdatedHerbs: FormulaWithHerbs = {
      ...formula,
      herbs: formula.herbs.map(herbItem => {
        // Calculamos la proporción de gramos según la cantidad seleccionada
        const proportionalGrams = (herbItem.grams / 100) * formulaQuantity;
        
        return {
          ...herbItem,
          grams: Math.round(proportionalGrams * 10) / 10 // Redondeamos a 1 decimal
        };
      })
    };
    
    onAddFormula(formulaWithUpdatedHerbs);
  };

  const handleAddFormulaHerbsIndividuallyWithQuantity = (formula: FormulaWithHerbs) => {
    // Hacemos una copia profunda de la fórmula
    const formulaWithUpdatedHerbs: FormulaWithHerbs = {
      ...formula,
      herbs: formula.herbs.map(herbItem => {
        // Calculamos la proporción de gramos según la cantidad seleccionada
        const proportionalGrams = (herbItem.grams / 100) * formulaQuantity;
        
        return {
          ...herbItem,
          grams: Math.round(proportionalGrams * 10) / 10 // Redondeamos a 1 decimal
        };
      })
    };
    
    onAddFormulaHerbs(formulaWithUpdatedHerbs);
  };
  
  // Versiones simplificadas para quienes no quieren especificar cantidad
  const handleAddFormula = (formula: FormulaWithHerbs, quantity: number = 100) => {
    const formulaWithUpdatedHerbs: FormulaWithHerbs = {
      ...formula,
      herbs: formula.herbs.map(herbItem => {
        const proportionalGrams = (herbItem.grams / 100) * quantity;
        return {
          ...herbItem,
          grams: Math.round(proportionalGrams * 10) / 10
        };
      })
    };
    
    onAddFormula(formulaWithUpdatedHerbs);
  };
  
  const handleAddFormulaHerbs = (formula: FormulaWithHerbs, quantity: number = 100) => {
    const formulaWithUpdatedHerbs: FormulaWithHerbs = {
      ...formula,
      herbs: formula.herbs.map(herbItem => {
        const proportionalGrams = (herbItem.grams / 100) * quantity;
        return {
          ...herbItem,
          grams: Math.round(proportionalGrams * 10) / 10
        };
      })
    };
    
    onAddFormulaHerbs(formulaWithUpdatedHerbs);
  };

  // Función para mostrar detalles de hierba
  const handleHerbDetailClick = (herb: Herb) => {
    setSelectedHerbDetail(herb);
    setShowHerbDetailDialog(true);
  };
  
  // Función para mostrar detalles de fórmula
  const handleFormulaDetailClick = (formula: FormulaWithHerbs) => {
    setSelectedFormulaDetail(formula);
    setShowFormulaDetailDialog(true);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <Tabs 
          value={tabValue} 
          onValueChange={setTabValue}
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="herbs">Herbs</TabsTrigger>
            <TabsTrigger value="formulas">Formulas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="herbs" className="m-0">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search herbs..."
                  className="pl-10 bg-[#E5E5EA] bg-opacity-50 rounded-lg border-0 shadow-none"
                  value={herbSearch}
                  onChange={(e) => setHerbSearch(e.target.value)}
                />
              </div>
              
              {herbCategories.length > 0 && (
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                  <Button
                    size="sm"
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs h-7"
                  >
                    All
                  </Button>
                  <ScrollArea className="whitespace-nowrap">
                    <div className="flex space-x-2">
                      {herbCategories.map((category) => (
                        <Button
                          key={category}
                          size="sm"
                          variant={selectedCategory === category ? "default" : "outline"}
                          onClick={() => setSelectedCategory(category)}
                          className="text-xs h-7"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                <div className="text-sm">Quantity (g):</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHerbQuantity(Math.max(1, herbQuantity - 1))}
                    className="h-7 w-7 p-0"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={herbQuantity}
                    onChange={(e) => setHerbQuantity(Number(e.target.value))}
                    className="w-16 h-7 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHerbQuantity(herbQuantity + 1)}
                    className="h-7 w-7 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                  <div className="p-1">
                    {filteredHerbs.map((herb) => (
                      <div
                        key={herb.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#D2D1D7] transition-colors"
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleHerbDetailClick(herb)}
                        >
                          <div className="font-medium">{herb.pinyinName}</div>
                          <div className="text-xs text-gray-600">
                            {herb.latinName && <span className="italic">{herb.latinName}</span>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddHerbWithQuantity(herb)}
                          className="ml-2"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="formulas" className="m-0">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search formulas..."
                  className="pl-10 bg-[#E5E5EA] bg-opacity-50 rounded-lg border-0 shadow-none"
                  value={formulaSearch}
                  onChange={(e) => setFormulaSearch(e.target.value)}
                />
              </div>
              
              {formulaCategories.length > 0 && (
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                  <Button
                    size="sm"
                    variant={selectedFormulaCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedFormulaCategory("all")}
                    className="text-xs h-7"
                  >
                    All
                  </Button>
                  <ScrollArea className="whitespace-nowrap">
                    <div className="flex space-x-2">
                      {formulaCategories.map((category) => (
                        <Button
                          key={category}
                          size="sm"
                          variant={selectedFormulaCategory === category ? "default" : "outline"}
                          onClick={() => setSelectedFormulaCategory(category)}
                          className="text-xs h-7"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                <div className="text-sm">Quantity (g):</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormulaQuantity(Math.max(1, formulaQuantity - 10))}
                    className="h-7 w-7 p-0"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={formulaQuantity}
                    onChange={(e) => setFormulaQuantity(Number(e.target.value))}
                    className="w-16 h-7 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormulaQuantity(formulaQuantity + 10)}
                    className="h-7 w-7 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                  <div className="p-1">
                    {filteredFormulas.map((formula) => {
                      // Asegurémonos de que la fórmula tiene hierbas para evitar errores
                      const formulaWithHerbs = formula as FormulaWithHerbs;
                      const hasHerbs = 
                        formulaWithHerbs.herbs && 
                        formulaWithHerbs.herbs.length > 0;
                      
                      return (
                        <div
                          key={formula.id}
                          className="p-3 rounded-lg hover:bg-[#D2D1D7] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleFormulaDetailClick(formulaWithHerbs)}
                            >
                              <div className="font-medium">{formula.pinyinName}</div>
                              <div className="text-xs text-gray-600">
                                {formula.category}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {hasHerbs && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddFormulaHerbsIndividuallyWithQuantity(formulaWithHerbs)}
                                    className="text-xs"
                                  >
                                    Add Herbs
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddFormulaWithQuantity(formulaWithHerbs)}
                                    className="text-xs"
                                  >
                                    Add Formula
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Mostrar las hierbas de la fórmula */}
                          {hasHerbs && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Herbs: </span>
                              {formulaWithHerbs.herbs
                                .map(item => `${item.herb?.pinyinName} (${item.grams}g)`)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Diálogo para mostrar detalles de hierbas */}
      <Dialog open={showHerbDetailDialog} onOpenChange={setShowHerbDetailDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedHerbDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-2xl font-bold">
                    {selectedHerbDetail.pinyinName}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {selectedHerbDetail.latinName && (
                    <div className="italic text-gray-600">{selectedHerbDetail.latinName}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {selectedHerbDetail.category && (
                      <Badge variant="outline" className="bg-gray-100">
                        {selectedHerbDetail.category}
                      </Badge>
                    )}
                    {selectedHerbDetail.subcategory && (
                      <Badge variant="outline" className="bg-gray-100">
                        {selectedHerbDetail.subcategory}
                      </Badge>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="flex flex-wrap gap-2">
                  {selectedHerbDetail.nature && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Nature: {selectedHerbDetail.nature}
                    </Badge>
                  )}
                  
                  {selectedHerbDetail.flavor && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                      Flavor: {selectedHerbDetail.flavor}
                    </Badge>
                  )}
                </div>

                {/* Meridianos/Canales */}
                {selectedHerbDetail.channels && selectedHerbDetail.channels.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Channels</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.channels.map((meridian, index) => (
                        <Badge key={index} variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          {meridian}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                {selectedHerbDetail.actions && selectedHerbDetail.actions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patrones de síndrome */}
                {selectedHerbDetail.syndromePatterns && selectedHerbDetail.syndromePatterns.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Syndrome Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.syndromePatterns.map((pattern, patternIdx) => (
                        <Badge key={patternIdx} variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Combinaciones comunes */}
                {selectedHerbDetail.herbCategoryCombos && selectedHerbDetail.herbCategoryCombos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Common Combinations</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.herbCategoryCombos.map((combo, comboIdx) => (
                        <Badge key={comboIdx} variant="outline" className="bg-violet-100 text-violet-800 border-violet-200">
                          {combo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Efectos Biomédicos */}
                {selectedHerbDetail.biomedicalEffects && selectedHerbDetail.biomedicalEffects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Biomedical Effects</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.biomedicalEffects.map((effect, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Efectos Farmacológicos */}
                {selectedHerbDetail.pharmacologicalEffects && selectedHerbDetail.pharmacologicalEffects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Pharmacological Effects</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.pharmacologicalEffects.map((effect, index) => (
                        <Badge key={index} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas clínicas */}
                {selectedHerbDetail.clinicalNotes && selectedHerbDetail.clinicalNotes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Notes</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.clinicalNotes.map((note, index) => (
                        <Badge key={index} variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interacciones con fármacos */}
                {selectedHerbDetail.herbDrugInteractions && selectedHerbDetail.herbDrugInteractions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Interacciones con Fármacos</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHerbDetail.herbDrugInteractions.map((interaction, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          {interaction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>

              <DialogFooter>
                <Button
                  onClick={() => {
                    onAddHerb(selectedHerbDetail);
                    setShowHerbDetailDialog(false);
                  }}
                  className="mt-2"
                >
                  Add to Prescription
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para mostrar detalles de fórmulas */}
      <Dialog open={showFormulaDetailDialog} onOpenChange={setShowFormulaDetailDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedFormulaDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-2xl font-bold">
                    {selectedFormulaDetail.pinyinName}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedFormulaDetail.category && (
                      <Badge variant="outline" className="bg-gray-100">
                        {selectedFormulaDetail.category}
                      </Badge>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                {/* Acciones */}
                {selectedFormulaDetail.action && selectedFormulaDetail.action.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.action.map((action, index) => (
                        <Badge key={index} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patrones de síndrome */}
                {selectedFormulaDetail.syndromePattern && selectedFormulaDetail.syndromePattern.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Syndrome Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.syndromePattern.map((pattern, patternIdx) => (
                        <Badge key={patternIdx} variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Casos clínicos */}
                {selectedFormulaDetail.caseStudies && selectedFormulaDetail.caseStudies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Case Studies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.caseStudies.map((caseItem, caseIdx) => (
                        <Badge key={caseIdx} variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          {caseItem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Combinaciones comunes */}
                {selectedFormulaDetail.commonCombinations && selectedFormulaDetail.commonCombinations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Common Combinations</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.commonCombinations.map((combo, comboIdx) => (
                        <Badge key={comboIdx} variant="outline" className="bg-violet-100 text-violet-800 border-violet-200">
                          {combo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hierbas de la fórmula */}
                {selectedFormulaDetail.herbs && selectedFormulaDetail.herbs.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Herbs in Formula</h3>
                    <div className="space-y-2">
                      {selectedFormulaDetail.herbs.map((herb, herbIdx) => (
                        <div key={herbIdx} className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <div>
                            <span className="font-medium">{herb.herb?.pinyinName}</span>
                            {herb.herb?.latinName && (
                              <span className="text-xs text-gray-600 italic ml-1">
                                ({herb.herb.latinName})
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {herb.grams}g
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Efectos medicinales */}
                {selectedFormulaDetail.medicinalEffects && selectedFormulaDetail.medicinalEffects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Medicinal Effects</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.medicinalEffects.map((effect, index) => (
                        <Badge key={index} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Efectos biomédicos */}
                {selectedFormulaDetail.biomedicalEffects && selectedFormulaDetail.biomedicalEffects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Biomedical Effects</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.biomedicalEffects.map((effect, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contraindicaciones */}
                {selectedFormulaDetail.contraindications && selectedFormulaDetail.contraindications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Contraindications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormulaDetail.contraindications.map((contraindication, index) => (
                        <Badge key={index} variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          {contraindication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleAddFormulaHerbs(selectedFormulaDetail);
                      setShowFormulaDetailDialog(false);
                    }}
                  >
                    Add Herbs Individually
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddFormula(selectedFormulaDetail);
                      setShowFormulaDetailDialog(false);
                    }}
                  >
                    Add as Formula
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}