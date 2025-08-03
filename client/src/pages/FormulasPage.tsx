
import { useState, useMemo, useEffect, useRef } from "react";
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
  ChevronLeft,
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
import { Formula } from "@/types";
import { useLanguage } from "@/lib/language-context";

export default function FormulasPage() {
  const { t } = useLanguage();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Función para obtener el color según la naturaleza de la hierba
  const getNatureColor = (nature: string) => {
    const natureMap: {[key: string]: string} = {
      'Hot': 'bg-red-500',
      'Warm': 'bg-orange-400',
      'Neutral': 'bg-yellow-300',
      'Cool': 'bg-blue-300',
      'Cold': 'bg-blue-500',
      // Español
      'Caliente': 'bg-red-500',
      'Calor': 'bg-red-500',
      'Tibia': 'bg-orange-400',
      'Neutra': 'bg-yellow-300',
      'Fresca': 'bg-blue-300',
      'Fría': 'bg-blue-500',
      'Frío': 'bg-blue-500'
    };

    return natureMap[nature] || 'bg-gray-400';
  };

  // Función para obtener la clase de color para el badge
  const getNatureColorClass = (nature: string) => {
    const natureMap: {[key: string]: string} = {
      'Hot': 'bg-red-100 text-red-800 border-red-200',
      'Warm': 'bg-orange-100 text-orange-800 border-orange-200',
      'Neutral': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cool': 'bg-blue-100 text-blue-800 border-blue-200',
      'Cold': 'bg-blue-100 text-blue-800 border-blue-200',
      // Español
      'Caliente': 'bg-red-100 text-red-800 border-red-200',
      'Calor': 'bg-red-100 text-red-800 border-red-200',
      'Tibia': 'bg-orange-100 text-orange-800 border-orange-200',
      'Neutra': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Fresca': 'bg-blue-100 text-blue-800 border-blue-200',
      'Fría': 'bg-blue-100 text-blue-800 border-blue-200',
      'Frío': 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return natureMap[nature] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [previewFormula, setPreviewFormula] = useState<any>(null);
  const [selectedHerbDetail, setSelectedHerbDetail] = useState<any>(null);
  const [expandedActions, setExpandedActions] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("all");
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string }>({ success: false, message: "" });
  const [isUploading, setIsUploading] = useState(false);

  const handleImportSuccess = () => {
    setIsImporterOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

   const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ success: false, message: "" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/formulas/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ success: true, message: "Formulas imported successfully." });
        toast({
          title: "Success",
          description: "Formulas imported successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
      } else {
        setUploadStatus({ success: false, message: data.message || "Failed to import formulas." });
        toast({
          title: "Error",
          description: data.message || "Failed to import formulas.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setUploadStatus({ success: false, message: error.message || "An unexpected error occurred." });
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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
      <div className="w-full px-4 py-4 bg-[#F2F2F7]">
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

        <div className="space-y-4 mb-6">
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
              <span className="text-sm text-gray-700"></span>
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
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="flex flex-col">
                  {filteredFormulas?.map((formula: any, index) => {
                    const isWindColdFormula = formula.category === "Wind-cold releasing";
                    return (
                      <div 
                        key={formula.id} 
                        className="group cursor-pointer relative hover:bg-gray-50 transition-all duration-200"
                        onClick={() => setPreviewFormula(formula)}
                      >
                        <div className="px-4 py-3">
                          {index > 0 && <div className="absolute left-4 right-4 top-0 border-t border-[#E5E5EA]" />}
                          <div className="grid grid-cols-[4fr,3fr,auto] gap-4 items-center">
                            {/* Formula name with English name */}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <div>
                                  <h3 className={`font-medium truncate ${isWindColdFormula ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {formula.pinyinName}
                                  </h3>
                                  {formula.englishName && (
                                    <div className="text-xs text-gray-400 italic truncate">
                                      {formula.englishName}
                                    </div>
                                  )}
                                </div>
                                {isWindColdFormula && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 flex-shrink-0 text-blue-500">
                                    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                                    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                                    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                                  </svg>
                                )}
                              </div>
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
      </div>

      {/* Preview Formula Dialog */}
      {previewFormula && (
        <Dialog open={!!previewFormula} onOpenChange={(open) => !open && setPreviewFormula(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
            <DialogHeader className="sticky top-0 bg-[#F2F2F7] z-10 border-b p-6">
              <DialogTitle className="flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold">{previewFormula.pinyinName}</span>
                    <div className="flex items-center gap-2">
                      {previewFormula.englishName && (
                        <span className="text-sm italic text-gray-500 font-medium">
                          {previewFormula.englishName}
                        </span>
                      )}
                      {previewFormula.category && (
                        <Badge variant="outline" className="bg-white text-gray-700 border-gray-200">
                          {previewFormula.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription className="space-y-1">
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 overflow-y-visible">
              {/* Composition */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">{t('formulas.composition')}</h3>
                <div className="grid grid-cols-1 divide-y divide-gray-100">
                  {Array.isArray(previewFormula.composition) ? (
                    previewFormula.composition.map((herb: any, index: number) => (
                      <div key={index} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className={`h-2 w-2 rounded-full ${getNatureColor(herb.nature)}`} 
                              title={herb.nature || 'Nature not specified'}
                            />
                            <div className="font-medium text-sm text-gray-900">
                              {herb.herb}
                              <span className="ml-1 text-gray-500">{herb.dosage || ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No composition information available</div>
                  )}
                </div>
              </div>

              {/* TCM Actions */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
                <div className="space-y-2">
                  {previewFormula.actions && Array.isArray(previewFormula.actions) && previewFormula.actions.map((action: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      <div className="text-sm">{action}</div>
                    </div>
                  ))}
                  {(!previewFormula.actions || !previewFormula.actions.length) && (
                    <div className="text-sm text-gray-500 italic">No actions information available</div>
                  )}
                </div>
              </div>

              {/* Clinical Information */}
              <div className="space-y-6">
                {/* Clinical Manifestations */}
                {previewFormula.clinicalManifestations && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Manifestations</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {previewFormula.clinicalManifestations}
                    </p>
                  </div>
                )}

                {/* Clinical Applications */}
                {previewFormula.clinicalApplications && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Applications</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewFormula.clinicalApplications.split(',').map((app, i) => (
                        <div key={i} className="bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {app.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pharmacological Effects */}
                {previewFormula.pharmacologicalEffects && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Pharmacological Effects</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewFormula.pharmacologicalEffects.split(',').map((effect, i) => (
                        <div key={i} className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {effect.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research */}
                {previewFormula.research && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Research</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewFormula.research.split(',').map((item, i) => (
                        <div key={i} className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {item.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contraindications */}
                {previewFormula.contraindications && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-red-600">Contraindications</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewFormula.contraindications.split(',').map((item, i) => (
                        <div key={i} className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {item.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cautions */}
                {previewFormula.cautions && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-amber-600">Cautions</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewFormula.cautions.split(',').map((item, i) => (
                        <div key={i} className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {item.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* References */}
                {previewFormula.references && previewFormula.references.length > 0 && (
                  <div className="mt-6 space-y-2 border-t pt-6">
                    <h3 className="font-semibold mb-3 text-base border-b pb-2 text-gray-900">References</h3>
                    <div className="space-y-2">
                      {Array.isArray(previewFormula.references) ? (
                        previewFormula.references.map((reference, index) => (
                          <div key={index} className="text-sm text-gray-600 italic">
                            • {reference}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-600 italic">
                          • {previewFormula.references}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t mt-6">
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Formula Importer Dialog */}
      <Dialog open={isImporterOpen} onOpenChange={setIsImporterOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Formulas</DialogTitle>
              <DialogDescription>
                Upload a JSON file with the formulas you want to import.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">
                  {file ? file.name : "Drag and drop or click to select a file"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JSON files
                </p>
                {file && (
                  <p className="text-sm text-primary mt-2">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            <FormulaImporter 
              isOpen={isImporterOpen}
              onClose={() => setIsImporterOpen(false)}
              onSuccess={() => {
                setIsImporterOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
              }} 
            />
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImporterOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
              >
                {isUploading ? "Importing..." : "Import Formula"}
              </Button>
              {uploadStatus.success && (
                <Button onClick={handleImportSuccess}>
                  Done
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </Layout>
  );
}
