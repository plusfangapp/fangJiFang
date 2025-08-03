import { useState, useEffect } from "react";
import { Search, Plus, BookOpen, ScrollText, Filter, CirclePlus, CircleEllipsis, Sliders, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSidebar } from "@/lib/sidebar-context";
import QuantitySelectDialog from "@/components/QuantitySelectDialog";
import HerbPreview from "@/components/HerbPreview";
import FormulaPreview from "@/components/FormulaPreview";
import { calculateFormulaTotal, processFormulaWithHerbs } from "@/lib/formula-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Herb, Formula, FormulaWithHerbs } from "@/types";
import { HerbWithGrams } from "@/types";
import clsx from "clsx";

const getNatureColor = (nature: string) => {
  const natureMap: {[key: string]: string} = {
    'Caliente': 'bg-red-500',
    'Calor': 'bg-red-500',
    'Tibia': 'bg-orange-400',
    'Neutral': 'bg-yellow-300',
    'Neutra': 'bg-yellow-300',
    'Fresca': 'bg-blue-300',
    'Fría': 'bg-blue-500',
    'Frío': 'bg-blue-500',
    'Hot': 'bg-red-500',
    'Warm': 'bg-orange-400',
    'Cool': 'bg-blue-300',
    'Cold': 'bg-blue-500'
  };
  return natureMap[nature] || 'bg-gray-400';
};

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
  onAddFormulaHerbs
}: LibraryPanelProps) {
  const { sidebarExpanded } = useSidebar();
  const [activeTab, setActiveTab] = useState("herbs");
  const [herbSearch, setHerbSearch] = useState("");
  const [formulaSearch, setFormulaSearch] = useState("");
  const [herbCategoryFilter, setHerbCategoryFilter] = useState<string>("all");
  const [formulaCategoryFilter, setFormulaCategoryFilter] = useState<string>("all");
  const [selectedFormula, setSelectedFormula] = useState<FormulaWithHerbs | null>(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'addFormula' | 'addHerbsIndividually'>('addFormula');
  const [processedFormulas, setProcessedFormulas] = useState<FormulaWithHerbs[]>([]);
  const [selectedHerbDetail, setSelectedHerbDetail] = useState<Herb | null>(null);
  const [showHerbDetailDialog, setShowHerbDetailDialog] = useState(false);
  const [showFormulaDetailDialog, setShowFormulaDetailDialog] = useState(false);
  const [selectedFormulaDetail, setSelectedFormulaDetail] = useState<FormulaWithHerbs | null>(null);
  const [showAdvancedFiltersDialog, setShowAdvancedFiltersDialog] = useState(false);
  const [advancedFiltersTab, setAdvancedFiltersTab] = useState("clinical");
  const [selectedFilters, setSelectedFilters] = useState({
    clinical: [] as string[],
    pharmacological: [] as string[],
    biological: [] as string[]
  });

  const [showFormulaAdvancedFiltersDialog, setShowFormulaAdvancedFiltersDialog] = useState(false);
  const [formulaAdvancedFiltersTab, setFormulaAdvancedFiltersTab] = useState("clinical");
  const [selectedFormulaFilters, setSelectedFormulaFilters] = useState({
    clinical: [] as string[],
    pharmacological: [] as string[],
    biological: [] as string[]
  });

  useEffect(() => {
    try {
      const processedFormulas = formulas.map(formula => {
        try {
          if (!formula.herbs) {
            return formula as FormulaWithHerbs;
          }
          const processedHerbs = formula.herbs.map(herbInFormula => {
            const matchingHerb = herbs.find(h => 
              h.pinyinName === (herbInFormula.pinyinName || herbInFormula.herb || herbInFormula.herbName || herbInFormula.name)
            );
            return {
              ...herbInFormula,
              herb: matchingHerb || {
                pinyinName: herbInFormula.pinyinName || herbInFormula.herb || herbInFormula.herbName || herbInFormula.name,
                id: 0
              }
            };
          });
          return {
            ...formula,
            herbs: processedHerbs
          } as FormulaWithHerbs;
        } catch (error) {
          console.warn(`Error processing formula ${formula.pinyinName}:`, error);
          return formula as FormulaWithHerbs;
        }
      });
      setProcessedFormulas(processedFormulas);
    } catch (error) {
      console.error("Error processing formulas:", error);
    }
  }, [formulas, herbs]);

  const herbCategories = Array.from(new Set(herbs.map(h => h.category).filter(Boolean)));
  const formulaCategories = Array.from(new Set(formulas.map(f => f.category).filter(Boolean)));

  const filteredHerbs = herbs.filter(herb => {
    const searchMatch = 
      !herbSearch || 
      herb.pinyinName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.latinName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.englishName?.toLowerCase().includes(herbSearch.toLowerCase());

    const categoryMatch = 
      herbCategoryFilter === "all" || 
      herb.category === herbCategoryFilter;

    return searchMatch && categoryMatch;
  });

  const filteredFormulas = processedFormulas.filter(formula => {
    const searchMatch = 
      !formulaSearch || 
      formula.pinyinName?.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      formula.englishName?.toLowerCase().includes(formulaSearch.toLowerCase());

    const categoryMatch = 
      formulaCategoryFilter === "all" || 
      formula.category === formulaCategoryFilter;

    return searchMatch && categoryMatch;
  });

  const handleAddFormulaWithQuantity = (formula: FormulaWithHerbs) => {
    setSelectedFormula(formula);
    setDialogAction('addFormula');
    setIsQuantityDialogOpen(true);
  };

  const handleAddFormulaHerbsIndividually = (formula: FormulaWithHerbs) => {
    setSelectedFormula(formula);
    setDialogAction('addHerbsIndividually');
    setIsQuantityDialogOpen(true);
  };

  const handleConfirmQuantity = (quantity: number) => {
    if (!selectedFormula) return;

    try {
      if (dialogAction === 'addFormula') {
        const totalWeight = calculateFormulaTotal(selectedFormula);
        const scaledFormula = {
          ...selectedFormula,
          totalGrams: quantity,
          herbs: selectedFormula.herbs?.map(herb => ({
            ...herb,
            grams: herb.grams ? (herb.grams / totalWeight) * quantity : quantity / (selectedFormula.herbs?.length || 1)
          }))
        };
        onAddFormula(scaledFormula);
      } else {
        onAddFormulaHerbs(selectedFormula);
      }
    } catch (error) {
      console.error("Error handling quantity confirmation:", error);
    }

    setIsQuantityDialogOpen(false);
    setSelectedFormula(null);
  };

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle>{activeTab === "herbs" ? "Hierbas" : "Fórmulas"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100vh-12rem)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-[#E5E5EA] mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="herbs" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Herbs
              </TabsTrigger>
              <TabsTrigger value="formulas" className="flex items-center gap-1">
                <ScrollText className="h-4 w-4" /> Formulas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="herbs" className="m-0 flex-1 overflow-hidden">
            <div className="h-full flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search herbs..."
                  className="pl-10 bg-[#E5E5EA] bg-opacity-50 rounded-lg border-0 shadow-none"
                  value={herbSearch}
                  onChange={(e) => setHerbSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {herbCategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select 
                        value={herbCategoryFilter} 
                        onValueChange={setHerbCategoryFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {herbCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex items-center gap-2 ${
                        selectedFilters.clinical.length > 0 || 
                        selectedFilters.pharmacological.length > 0 || 
                        selectedFilters.biological.length > 0 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : ''
                      }`}
                      onClick={() => setShowAdvancedFiltersDialog(true)}
                    >
                      <Sliders className="h-4 w-4" />
                      <span>
                        Filtros avanzados
                        {(selectedFilters.clinical.length > 0 || 
                          selectedFilters.pharmacological.length > 0 || 
                          selectedFilters.biological.length > 0) && (
                          <span className="ml-1">
                            ({selectedFilters.clinical.length + selectedFilters.biological.length + selectedFilters.pharmacological.length})
                          </span>
                        )}
                      </span>
                    </Button>

                    <Dialog open={showAdvancedFiltersDialog} onOpenChange={setShowAdvancedFiltersDialog}>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Filtros Avanzados</DialogTitle>
                          <DialogDescription>
                            Selecciona los filtros que deseas aplicar a las hierbas según sus propiedades.
                          </DialogDescription>
                        </DialogHeader>

                        <Tabs value={advancedFiltersTab} onValueChange={setAdvancedFiltersTab}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pharmacological">Efectos Farmacológicos</TabsTrigger>
                            <TabsTrigger value="biological">Efectos Biológicos</TabsTrigger>
                          </TabsList>

                          <TabsContent value="pharmacological" className="space-y-4">
                            <ScrollArea className="h-[200px]">
                              <div className="flex flex-col gap-2 pr-4">
                                {Array.from(new Set(filteredHerbs.flatMap(herb => 
                                  herb.pharmacologicalEffects || []
                                ))).sort().map(effect => (
                                  <div key={effect} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`pharmacological-${effect}`}
                                      checked={selectedFilters.pharmacological.includes(effect)}
                                      onCheckedChange={(checked) => {
                                        setSelectedFilters(prev => ({
                                          ...prev,
                                          pharmacological: checked
                                            ? [...prev.pharmacological, effect]
                                            : prev.pharmacological.filter(e => e !== effect)
                                        }));
                                      }}
                                    />
                                    <label
                                      htmlFor={`pharmacological-${effect}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {effect}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="biological" className="space-y-4">
                            <ScrollArea className="h-[200px]">
                              <div className="flex flex-col gap-2 pr-4">
                                {Array.from(new Set(filteredHerbs.flatMap(herb => 
                                  herb.biologicalEffects || []
                                ))).sort().map(effect => (
                                  <div key={effect} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`biological-${effect}`}
                                      checked={selectedFilters.biological.includes(effect)}
                                      onCheckedChange={(checked) => {
                                        setSelectedFilters(prev => ({
                                          ...prev,
                                          biological: checked
                                            ? [...prev.biological, effect]
                                            : prev.biological.filter(e => e !== effect)
                                        }));
                                      }}
                                    />
                                    <label
                                      htmlFor={`biological-${effect}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {effect}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>

                        <DialogFooter className="flex items-center justify-between">
                          <div>
                            {(selectedFilters.clinical.length > 0 || 
                              selectedFilters.pharmacological.length > 0 || 
                              selectedFilters.biological.length > 0) && (
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedFilters({
                                    clinical: [],
                                    pharmacological: [],
                                    biological: []
                                  });
                                }}
                              >
                                Limpiar filtros
                              </Button>
                            )}
                          </div>
                          <Button onClick={() => setShowAdvancedFiltersDialog(false)}>Aplicar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 overflow-y-auto pr-3">
                <div>
                  {filteredHerbs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No se encontraron hierbas</p>
                    </div>
                  ) : (
                    <div className="bg-white">
                      {filteredHerbs.map((herb, index) => (
                        <div
                          key={herb.id}
                          className={clsx(
                            "hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-200",
                            index === 0 && "rounded-t-xl border-t-0",
                            index === filteredHerbs.length - 1 && "rounded-b-xl"
                          )}
                          onClick={() => {
                            setSelectedHerbDetail(herb);
                            setShowHerbDetailDialog(true);
                          }}
                        >
                          <div className="px-4 py-3">
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{herb.pinyinName}</h4>
                                  <div 
                                    className={`h-3 w-3 rounded-full ${getNatureColor(herb.nature)}`}
                                    title={herb.nature}
                                  />
                                </div>
                                {herb.latinName && (
                                  <div className="text-xs text-gray-400 italic">
                                    {herb.latinName}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddHerb(herb);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="formulas" className="m-0 flex-1 overflow-hidden">
            <div className="h-full flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search formulas..."
                  className="pl-10 bg-[#E5E5EA] bg-opacity-50 rounded-lg border-0 shadow-none"
                  value={formulaSearch}
                  onChange={(e) => setFormulaSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {formulaCategories.length > 0 && (
                  <div className="flex items-center gap-2 flex-1">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select 
                      value={formulaCategoryFilter} 
                      onValueChange={setFormulaCategoryFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {formulaCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                 <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex items-center gap-2 ${
                        selectedFormulaFilters.clinical.length > 0 || 
                        selectedFormulaFilters.pharmacological.length > 0 || 
                        selectedFormulaFilters.biological.length > 0 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : ''
                      }`}
                      onClick={() => setShowFormulaAdvancedFiltersDialog(true)}
                    >
                      <Sliders className="h-4 w-4" />
                      <span>
                        Filtros avanzados
                        {(selectedFormulaFilters.clinical.length > 0 || 
                          selectedFormulaFilters.pharmacological.length > 0 || 
                          selectedFormulaFilters.biological.length > 0) && (
                          <span className="ml-1">
                            ({selectedFormulaFilters.clinical.length + selectedFormulaFilters.biological.length + selectedFormulaFilters.pharmacological.length})
                          </span>
                        )}
                      </span>
                    </Button>
              </div>

              <ScrollArea className="flex-1 overflow-y-auto pr-3">
                <div>
                  {filteredFormulas.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No se encontraron fórmulas</p>
                    </div>
                  ) : (
                    <div className="bg-white divide-y divide-gray-200">
                      {filteredFormulas.map((formula, index) => (
                        <div
                          key={formula.id}
                          className={clsx(
                            "hover:bg-gray-50 cursor-pointer transition-colors",
                            index === 0 && "rounded-t-xl",
                            index === filteredFormulas.length - 1 && "rounded-b-xl"
                          )}
                          onClick={() => {
                            setSelectedFormulaDetail(formula);
                            setShowFormulaDetailDialog(true);
                          }}
                        >
                          <div className="px-4 py-3">
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">{formula.pinyinName}</h4>
                                  </div>
                                  {formula.englishName && (
                                    <div className="text-xs text-gray-400 italic">
                                      {formula.englishName}
                                    </div>
                                  )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddFormulaHerbsIndividually(formula);
                                  }}
                                >
                                  <CirclePlus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddFormulaWithQuantity(formula);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Diálogo de Filtros Avanzados para Fórmulas */}
      <Dialog open={showFormulaAdvancedFiltersDialog} onOpenChange={setShowFormulaAdvancedFiltersDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filtros Avanzados de Fórmulas</DialogTitle>
            <DialogDescription>
              Selecciona los filtros que deseas aplicar a las fórmulas según sus propiedades.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={formulaAdvancedFiltersTab} onValueChange={setFormulaAdvancedFiltersTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clinical">Clinical Applications</TabsTrigger>
              <TabsTrigger value="pharmacological">Efectos Farmacológicos</TabsTrigger>
              <TabsTrigger value="biological">Efectos Biológicos</TabsTrigger>
            </TabsList>

            <TabsContent value="clinical" className="space-y-4">
              <ScrollArea className="h-[200px]">
                <div className="flex flex-col gap-2 pr-4">
                  {Array.from(new Set(filteredFormulas.flatMap(formula => {
                    const clinicalApps = formula.clinicalApplications 
                      ? formula.clinicalApplications.split(',').map(app => app.trim())
                      : formula.clinicalManifestations 
                        ? formula.clinicalManifestations.flatMap(manifestation => 
                            manifestation.split(',').map(item => item.trim())
                          )
                        : [];
                    return clinicalApps.filter(app => app && app !== '');
                  }))).sort().map(application => (
                                  <div key={application} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`formula-clinical-${application}`}
                                      checked={selectedFormulaFilters.clinical.includes(application)}
                                      onCheckedChange={(checked) => {
                                        setSelectedFormulaFilters(prev => ({
                                          ...prev,
                                          clinical: checked
                                            ? [...prev.clinical, application]
                                            : prev.clinical.filter(s => s !== application)
                                        }));
                                      }}
                                    />
                                    <label
                                      htmlFor={`formula-clinical-${application}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {application}
                                    </label>
                                  </div>
                                ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="pharmacological" className="space-y-4">
              <ScrollArea className="h-[200px]">
                <div className="flex flex-col gap-2 pr-4">
                  {Array.from(new Set(processedFormulas.flatMap(formula => 
                    formula.pharmacologicalEffects 
                      ? formula.pharmacologicalEffects.split(',').map(effect => effect.trim())
                      : []
                  ).filter(effect => effect && effect !== ''))).sort().map(effect => (
                    <div key={effect} className="flex items-center space-x-2">
                      <Checkbox
                        id={`formula-pharmacological-${effect}`}
                        checked={selectedFormulaFilters.pharmacological.includes(effect)}
                        onCheckedChange={(checked) => {
                          setSelectedFormulaFilters(prev => ({
                            ...prev,
                            pharmacological: checked
                              ? [...prev.pharmacological, effect]
                              : prev.pharmacological.filter(e => e !== effect)
                          }));
                        }}
                      />
                      <label
                        htmlFor={`formula-pharmacological-${effect}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {effect}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="biological" className="space-y-4">
              <ScrollArea className="h-[200px]">
                <div className="flex flex-col gap-2 pr-4">
                  {Array.from(new Set(processedFormulas.flatMap(formula => 
                    formula.biologicalEffects 
                      ? formula.biologicalEffects.split(',').map(effect => effect.trim())
                      : []
                  ).filter(effect => effect && effect !== ''))).sort().map(effect => (
                    <div key={effect} className="flex items-center space-x-2">
                      <Checkbox
                        id={`formula-biological-${effect}`}
                        checked={selectedFormulaFilters.biological.includes(effect)}
                        onCheckedChange={(checked) => {
                          setSelectedFormulaFilters(prev => ({
                            ...prev,
                            biological: checked
                              ? [...prev.biological, effect]
                              : prev.biological.filter(e => e !== effect)
                          }));
                        }}
                      />
                      <label
                        htmlFor={`formula-biological-${effect}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {effect}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <div>
              {(selectedFormulaFilters.clinical.length > 0 || 
                selectedFormulaFilters.pharmacological.length > 0 || 
                selectedFormulaFilters.biological.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedFormulaFilters({
                      clinical: [],
                      pharmacological: [],
                      biological: []
                    });
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
            <Button onClick={() => setShowFormulaAdvancedFiltersDialog(false)}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuantitySelectDialog
        open={isQuantityDialogOpen}
        onOpenChange={setIsQuantityDialogOpen}
        title={`Cantidad para ${selectedFormula?.pinyinName || ''}`}
        description=""
        initialQuantity={100}
        onConfirm={handleConfirmQuantity}
      />

      {selectedHerbDetail && (
        <HerbPreview
          herb={selectedHerbDetail}
          isOpen={showHerbDetailDialog}
          onClose={() => setShowHerbDetailDialog(false)}
        />
      )}

      {selectedFormulaDetail && (
        <FormulaPreview
          formula={selectedFormulaDetail}
          isOpen={showFormulaDetailDialog}
          onClose={() => setShowFormulaDetailDialog(false)}
        />
      )}
    </Card>
  );
}