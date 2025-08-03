import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import FormulaImporter from "@/components/FormulaImporter";
import ChipDisplay from "@/components/ChipDisplay";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskRound, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Circle,
  Filter,
  Upload,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Formula } from "@shared/schema";
import { useLanguage } from "@/lib/language-context";

export default function FormulasPage() {
  const { t } = useLanguage();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFormula, setPreviewFormula] = useState<any>(null);
  const [expandedActions, setExpandedActions] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("all");
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  
  // Set document title
  useEffect(() => {
    document.title = "Chinese Medicine - Formulas";
  }, []);
  
  // Query to get formulas
  const { data: formulas, isLoading } = useQuery<Formula[]>({
    queryKey: ["/api/formulas"],
    retry: 1,
  });

  // Extract unique categories from formulas
  const categories = useMemo(() => {
    if (!formulas) return [];
    const uniqueCategories = Array.from(
      new Set(
        formulas
          .map(formula => formula.category)
          .filter((category): category is string => Boolean(category))
      )
    );
    return uniqueCategories.sort();
  }, [formulas]);

  // Mutation to delete formulas
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/formulas/${id}`, { 
        method: "DELETE" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
      toast({
        title: t('formulas.delete_success'),
        description: t('formulas.delete_success_description'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('formulas.delete_error'),
        description: t('formulas.delete_error_description').replace('{error}', error.message || "Unknown error"),
        variant: "destructive",
      });
    },
  });

  // Filter formulas based on search term and selected category
  const filteredFormulas = formulas?.filter((formula) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      formula.pinyinName?.toLowerCase().includes(search) || 
      formula.chineseName?.toLowerCase().includes(search) ||
      (formula.category?.toLowerCase().includes(search) || false)
    );
    
    // If there's a selected category and it's not "all", filter by it
    if (selectedCategory && selectedCategory !== "all" && formula.category !== selectedCategory) {
      return false;
    }
    
    return matchesSearch;
  });

  // Handle formula deletion
  const handleDeleteFormula = (id: number) => {
    if (window.confirm(t('formulas.delete_confirm'))) {
      deleteMutation.mutate(id);
    }
  };

  // Toggle action expansion
  const toggleAction = (index: number) => {
    setExpandedActions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-[#F2F2F7]">
        {/* Sección fija: Encabezado, búsqueda y filtros */}
        <div className="sticky top-0 bg-[#F2F2F7] z-10 pt-1 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{t('formulas.title')}</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-1 bg-white"
                onClick={() => setIsImporterOpen(true)}
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
              <Button 
                className="flex items-center gap-1"
                onClick={() => navigate("/formulas/new")}
              >
                <Plus className="h-4 w-4" />
                <span>{t('formulas.new')}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('formulas.search')}
                className="pl-10 search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{t('formulas.filter_by_category')}</span>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[220px] bg-white border border-gray-100 focus:ring-1 focus:ring-gray-300">
                  <SelectValue placeholder={t('formulas.all_categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('formulas.all_categories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCategory && selectedCategory !== "all" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCategory("all")}
                  className="h-8 px-2 text-gray-500 hover:text-gray-700"
                >
                  {t('formulas.clear_filter')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sección desplazable: Lista de fórmulas */}
        <div className="flex-1 overflow-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10 bg-white rounded-xl shadow-sm">
              <div className="text-center">{t('formulas.loading')}</div>
            </div>
          ) : filteredFormulas?.length === 0 ? (
            <div className="flex justify-center items-center py-10 bg-white rounded-xl shadow-sm">
              <div className="text-center">{t('formulas.not_found')}</div>
            </div>
          ) : (
            <>
            {/* Destacado de Wind-cold releasing si está seleccionada esa categoría */}
            {selectedCategory === "Wind-cold releasing" && (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-white">
                  <div className="text-blue-700 flex items-center gap-2 font-semibold text-lg mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                    </svg>
                    Wind-cold Releasing Formulas
                  </div>
                  <p className="text-gray-600 mb-4">
                    Wind-cold releasing formulas are used to treat wind-cold invasion syndromes with symptoms 
                    such as chills, mild fever, headache, body aches, absence of sweating, and a tight or 
                    floating pulse.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="border border-blue-200 rounded-md p-3 bg-white">
                      <h4 className="font-semibold text-blue-700 mb-2">Clinical Features</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Chills more pronounced than fever</li>
                        <li>• Absence of sweating</li>
                        <li>• Headache and body pain</li>
                        <li>• Nasal congestion with clear discharge</li>
                        <li>• Thin white tongue coating</li>
                        <li>• Tight (Jin Mai) and floating (Fu Mai) pulse</li>
                      </ul>
                    </div>
                    <div className="border border-blue-200 rounded-md p-3 bg-white">
                      <h4 className="font-semibold text-blue-700 mb-2">Treatment Principles</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Release the exterior</li>
                        <li>• Disperse wind-cold</li>
                        <li>• Restore Wei Qi function</li>
                        <li>• Promote controlled sweating</li>
                        <li>• Relieve symptoms such as pain and congestion</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List panel */}
            <div className="mb-6">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  {filteredFormulas?.map((formula: any, index) => {
                    const isWindColdFormula = formula.category === "Wind-cold releasing";
                    return (
                      <div 
                        key={formula.id} 
                        className={`group cursor-pointer ${
                          index === 0 ? '' : 'border-t border-[#E5E5EA]'
                        } hover:bg-[#D2D1D7] transition-colors`}
                        onClick={() => setPreviewFormula(formula)}
                      >
                        <div className="py-3">
                          <div className="grid grid-cols-[4fr,3fr,auto] gap-4 items-center">
                            {/* Formula name with English name */}
                            <div className="pl-4">
                              <div className="flex items-center gap-1.5">
                                <h3 className={`font-medium truncate ${isWindColdFormula ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {formula.pinyinName}
                                </h3>
                                {isWindColdFormula && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 flex-shrink-0 text-blue-500">
                                    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                                    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                                    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                                  </svg>
                                )}
                              </div>
                              {formula.englishName && (
                                <div className="text-xs text-gray-400 italic truncate">
                                  {formula.englishName}
                                </div>
                              )}
                            </div>
                            
                            {/* Category */}
                            <div className="overflow-hidden">
                              {formula.category && (
                                <span className="text-sm text-gray-700 truncate">
                                  {formula.category}
                                </span>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-1 justify-end w-20">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/formulas/${formula.id}/edit`);
                                }}
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFormula(formula.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Formula preview dialog */}
        {previewFormula && (
          <Dialog open={!!previewFormula} onOpenChange={(open) => !open && setPreviewFormula(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex items-center flex-wrap">
                      <span className="text-xl font-bold mr-2">{previewFormula.pinyinName}</span>
                      <span className="text-lg text-gray-600 chinese">{previewFormula.chineseName}</span>
                    </div>
                    {previewFormula.englishName && (
                      <span className="text-sm italic text-gray-500 font-medium sm:ml-2 mt-1 sm:mt-0">
                        ({previewFormula.englishName})
                      </span>
                    )}
                  </div>
                  {previewFormula.category && (
                    <Badge className="ml-auto mt-2 sm:mt-0" variant="secondary">{previewFormula.category}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="space-y-1">
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 overflow-y-visible">
                {/* Composition */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">{t('formulas.composition')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(previewFormula.composition && (typeof previewFormula.composition === 'string' 
                      ? JSON.parse(previewFormula.composition) 
                      : previewFormula.composition
                    ))?.map((herb: any, index: number) => (
                      <div key={index} className="p-2 bg-muted/20 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{herb.herb}</div>
                          <div className="text-xs text-gray-500 ml-2">{herb.dosage || ''}</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 italic">No composition information available</div>
                    )}
                  </div>
                </div>

                {/* TCM Actions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
                  <div className="space-y-2">
                    {(previewFormula.actions && (typeof previewFormula.actions === 'string' 
                      ? JSON.parse(previewFormula.actions) 
                      : previewFormula.actions
                    ))?.map((action: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center"
                      >
                        <Circle className="h-3 w-3 mr-2 text-primary" />
                        <div className="font-medium">{action}</div>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 italic">No TCM actions information available</div>
                    )}
                  </div>
                </div>

                {/* Clinical Manifestations */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Manifestations</h3>
                  <div className="p-3">
                    {previewFormula.clinicalManifestations ? (
                      <p className="text-sm">{previewFormula.clinicalManifestations}</p>
                    ) : previewFormula.indications ? (
                      <p className="text-sm">{previewFormula.indications}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No clinical manifestations information available</p>
                    )}
                  </div>
                </div>
                
                {/* Clinical Applications */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Applications</h3>
                  <div className="flex flex-wrap gap-2 p-3">
                    <ChipDisplay
                      data={previewFormula.clinicalApplications}
                      bgColor="bg-teal-100"
                      textColor="text-teal-800"
                      borderColor="border-teal-200"
                      emptyMessage="No clinical applications information available"
                    />
                  </div>
                </div>

                {/* Contraindications */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Contraindications</h3>
                  <div className="flex flex-wrap gap-2 p-3">
                    <ChipDisplay
                      data={previewFormula.contraindications}
                      bgColor="bg-red-100"
                      textColor="text-red-800"
                      borderColor="border-red-200"
                      emptyMessage="No contraindications information available"
                    />
                  </div>
                </div>
                
                {/* Cautions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Cautions</h3>
                  <div className="flex flex-wrap gap-2 p-3">
                    <ChipDisplay
                      data={previewFormula.cautions}
                      bgColor="bg-yellow-100"
                      textColor="text-yellow-800"
                      borderColor="border-yellow-200"
                      emptyMessage="No cautions information available"
                    />
                  </div>
                </div>
                
                {/* Pharmacological Effects */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Pharmacological Effects</h3>
                  <div className="flex flex-wrap gap-2 p-3">
                    <ChipDisplay
                      data={previewFormula.pharmacologicalEffects}
                      bgColor="bg-blue-100"
                      textColor="text-blue-800"
                      borderColor="border-blue-200"
                      emptyMessage="No pharmacological effects information available"
                    />
                  </div>
                </div>
                
                {/* Research */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Research</h3>
                  <div className="flex flex-wrap gap-2 p-3">
                    <ChipDisplay
                      data={previewFormula.research}
                      bgColor="bg-slate-100"
                      textColor="text-slate-800"
                      borderColor="border-slate-200"
                      emptyMessage="No research information available"
                    />
                  </div>
                </div>
                
                {/* Herb-Drug Interactions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Herb-Drug Interactions</h3>
                  <div className="flex flex-wrap gap-2 p-3">
                    <ChipDisplay
                      data={previewFormula.herbDrugInteractions}
                      bgColor="bg-purple-100"
                      textColor="text-purple-800"
                      borderColor="border-purple-200"
                      emptyMessage="No herb-drug interactions information available"
                    />
                  </div>
                </div>
                
                {/* References */}
                {previewFormula.references && Array.isArray(previewFormula.references) && previewFormula.references.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">References</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {previewFormula.references.map((reference, index) => (
                        <li key={index} className="text-sm italic text-gray-600">{reference}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setPreviewFormula(null)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/formulas/${previewFormula.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button onClick={() => navigate(`/formulas/${previewFormula.id}`)}>
                    View Details
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      </div>
      {/* Formula Importer Dialog */}
      <FormulaImporter 
        isOpen={isImporterOpen} 
        onClose={() => setIsImporterOpen(false)} 
      />
    </Layout>
  );
}
