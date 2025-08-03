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
              <div className="text-center py-8">
                <FlaskRound className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">{t('formulas.not_found')}</h3>
                <p className="mt-2 text-muted-foreground">
                  {t('formulas.try_again')}
                </p>
              </div>
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
                    <p className="text-blue-600 mb-3">
                      These formulas are used to treat external wind-cold patterns, characterized by chills, mild or no fever, lack of sweating, and other associated symptoms.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-blue-700 mb-2">Primary Therapeutic Actions:</div>
                        <ul className="text-gray-700 space-y-1 text-sm list-none ml-2">
                          <li>• Dispel wind-cold from the exterior</li>
                          <li>• Release the exterior</li>
                          <li>• Restore defensive Qi circulation</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700 mb-2">Common Clinical Applications:</div>
                        <ul className="text-gray-700 space-y-1 text-sm list-none ml-2">
                          <li>• Early stage common cold or flu</li>
                          <li>• Promote controlled sweating</li>
                          <li>• Relieve symptoms such as pain and congestion</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid layout similar to HerbsPage */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-6">
                {filteredFormulas?.map((formula: any) => {
                  const isWindColdFormula = formula.category === "Wind-cold releasing";
                  return (
                    <Card 
                      key={formula.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                      onClick={() => setPreviewFormula(formula)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg px-2">
                          <FlaskRound className="h-4 w-4 mr-2 text-primary" />
                          <span className={`${isWindColdFormula ? 'text-blue-600' : 'text-gray-900'}`}>
                            {formula.pinyinName}
                          </span>
                          {isWindColdFormula && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 flex-shrink-0 text-blue-500">
                              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                              <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                              <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                            </svg>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4">
                        {formula.englishName && (
                          <p className="text-xs text-gray-400 italic mb-2">
                            {formula.englishName}
                          </p>
                        )}
                        {formula.category && (
                          <p className="text-sm mb-1">
                            <span className="font-semibold">Category:</span> {formula.category}
                          </p>
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/formulas/edit/${formula.id}`);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Preview Dialog */}
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
                    {previewFormula.actions && previewFormula.actions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {previewFormula.actions.map((action: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">{action}</Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No TCM actions listed</div>
                    )}
                  </div>
                </div>

                {/* Indications */}
                {previewFormula.indications && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Indications</h3>
                    <p className="text-sm text-gray-700">{previewFormula.indications}</p>
                  </div>
                )}

                {/* Clinical Manifestations */}
                {previewFormula.clinicalManifestations && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Manifestations</h3>
                    <p className="text-sm text-gray-700">{previewFormula.clinicalManifestations}</p>
                  </div>
                )}

                {/* Treatment Principles */}
                {previewFormula.treatmentPrinciples && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Treatment Principles</h3>
                    <p className="text-sm text-gray-700">{previewFormula.treatmentPrinciples}</p>
                  </div>
                )}

                {/* Contraindications */}
                {previewFormula.contraindications && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Contraindications</h3>
                    <p className="text-sm text-gray-700">{previewFormula.contraindications}</p>
                  </div>
                )}

                {/* References */}
                {previewFormula.references && previewFormula.references.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">References</h3>
                    <div className="space-y-2">
                      {previewFormula.references.map((reference: any, index: number) => (
                        <div key={index} className="text-sm text-gray-700">
                          {reference}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/formulas/edit/${previewFormula.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Formula
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Use in Prescription
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Formula Importer Dialog */}
      <FormulaImporter 
        isOpen={isImporterOpen} 
        onClose={() => setIsImporterOpen(false)} 
      />
    </Layout>
  );
}