import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Search, Plus, Upload, Filter } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import HerbPreview from "@/components/HerbPreview";
import HerbImporter from "@/components/HerbImporter";
import { Herb } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Herbs() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNature, setSelectedNature] = useState<string>("all");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("all");
  const [selectedMeridian, setSelectedMeridian] = useState<string>("all");
  const [previewHerb, setPreviewHerb] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch herbs data
  const { data: herbs, isLoading } = useQuery<Herb[]>({
    queryKey: ["/api/herbs"],
    retry: 1,
  });

  // Delete herb mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('herbs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/herbs"] });
      toast({
        title: "Herb deleted",
        description: "The herb has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Could not delete herb: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Extract unique categories
  const categories = Array.from(new Set(herbs?.map(herb => herb.category).filter(Boolean) || []));

  // Filter herbs based on search term and all filters
  const filteredHerbs = herbs?.filter((herb: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      herb.pinyin_name?.toLowerCase().includes(searchLower) ||
      herb.chinese_name?.toLowerCase().includes(searchLower) ||
      herb.english_name?.toLowerCase().includes(searchLower) ||
      herb.latin_name?.toLowerCase().includes(searchLower)
    );

    const matchesCategory = selectedCategory === "all" || herb.category === selectedCategory;
    
    const matchesNature = selectedNature === "all" || herb.nature?.toLowerCase() === selectedNature;
    
    const matchesFlavor = selectedFlavor === "all" || 
      (herb.flavor?.toLowerCase().includes(selectedFlavor.toLowerCase()));
    
    const matchesMeridian = selectedMeridian === "all" || 
      (Array.isArray(herb.meridians) && herb.meridians.some(m => 
        m.toLowerCase().includes(selectedMeridian.toLowerCase())
      ));

    return matchesSearch && matchesCategory && matchesNature && matchesFlavor && matchesMeridian;
  });

  // Helper function to get the color class based on herb nature
  const getNatureColor = (nature: string | null) => {
    const natureLower = nature?.toLowerCase() || "";
    if (natureLower.includes("caliente") || natureLower.includes("hot")) {
      return "bg-red-600";
    } else if (natureLower.includes("tibia") || natureLower.includes("warm")) {
      return "bg-orange-400";
    } else if (natureLower.includes("neutral") || natureLower.includes("neutra")) {
      return "bg-gray-400";
    } else if (natureLower.includes("fresca") || natureLower.includes("cool")) {
      return "bg-blue-300";
    } else if (natureLower.includes("fría") || natureLower.includes("cold")) {
      return "bg-blue-600";
    }
    return "bg-primary";
  };

  const handleEditHerb = (id: number) => {
    navigate(`/herbs/${id}/edit`);
  };

  // Function to delete an herb
  const handleDeleteHerb = (id: number) => {
    if (window.confirm("Are you sure you want to delete this herb? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="w-full px-4 py-4 bg-[#F2F2F7]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Herbs</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 bg-white"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Button 
              className="flex items-center gap-1"
              onClick={() => navigate("/herbs/new")}
            >
              <Plus className="h-4 w-4" />
              <span>Add Herb</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search herbs by name, latin name..."
              className="pl-10 bg-[#E5E5EA] bg-opacity-50 rounded-lg border-0 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[220px] bg-white border border-gray-100 focus:ring-1 focus:ring-gray-300">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category || ""}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedNature}
                onValueChange={setSelectedNature}
              >
                <SelectTrigger className="w-[220px] bg-white border border-gray-100 focus:ring-1 focus:ring-gray-300">
                  <SelectValue placeholder="Nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All natures</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="cool">Cool</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedFlavor}
                onValueChange={setSelectedFlavor}
              >
                <SelectTrigger className="w-[220px] bg-white border border-gray-100 focus:ring-1 focus:ring-gray-300">
                  <SelectValue placeholder="Flavor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All flavors</SelectItem>
                  <SelectItem value="pungent">Pungent</SelectItem>
                  <SelectItem value="sweet">Sweet</SelectItem>
                  <SelectItem value="sour">Sour</SelectItem>
                  <SelectItem value="bitter">Bitter</SelectItem>
                  <SelectItem value="salty">Salty</SelectItem>
                  <SelectItem value="bland">Bland</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedMeridian}
                onValueChange={setSelectedMeridian}
              >
                <SelectTrigger className="w-[220px] bg-white border border-gray-100 focus:ring-1 focus:ring-gray-300">
                  <SelectValue placeholder="Meridian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All meridians</SelectItem>
                  <SelectItem value="lung">Lung</SelectItem>
                  <SelectItem value="large_intestine">Large Intestine</SelectItem>
                  <SelectItem value="stomach">Stomach</SelectItem>
                  <SelectItem value="spleen">Spleen</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="small_intestine">Small Intestine</SelectItem>
                  <SelectItem value="bladder">Bladder</SelectItem>
                  <SelectItem value="kidney">Kidney</SelectItem>
                  <SelectItem value="pericardium">Pericardium</SelectItem>
                  <SelectItem value="triple_burner">Triple Burner</SelectItem>
                  <SelectItem value="gallbladder">Gallbladder</SelectItem>
                  <SelectItem value="liver">Liver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10 bg-white rounded-xl shadow-sm">
            <div className="text-center">Loading herbs...</div>
          </div>
        ) : filteredHerbs?.length === 0 ? (
          <div className="flex justify-center items-center py-10 bg-white rounded-xl shadow-sm">
            <div className="text-center">No herbs match your search</div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="flex flex-col">
                {filteredHerbs?.map((herb: any, index) => (
                  <div 
                    key={herb.id} 
                    className={`group cursor-pointer hover:bg-sidebar-accent transition-colors`}
                    onClick={() => setPreviewHerb(herb)}
                  >
                    <div className="relative px-4 py-3">
                      {index !== 0 && (
                        <div className="absolute left-4 right-4 top-0 border-t border-[#E5E5EA]"></div>
                      )}
                      <div className="grid grid-cols-[2fr,0.5fr,1.5fr,1.5fr,1.5fr,auto] gap-4 items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{herb.pinyin_name}</h3>
                          {herb.latin_name && (
                            <div className="text-xs text-gray-400 italic truncate">
                              {herb.latin_name}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div 
                            className={`h-3 w-3 rounded-full ${getNatureColor(herb.nature)}`}
                            title={`Nature: ${herb.nature || "Not specified"}`}
                          ></div>
                        </div>

                        <div className="overflow-hidden">
                          {herb.category ? (
                            <span className="text-sm text-gray-700 truncate">
                              {herb.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          {herb.flavor ? (
                            <span className="text-sm text-gray-700 truncate">
                              {herb.flavor}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          {Array.isArray(herb.meridians) && herb.meridians.length > 0 ? (
                            <span className="text-sm text-gray-700 truncate">
                              {herb.meridians.slice(0, 3).join(', ')}{herb.meridians.length > 3 ? '...' : ''}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>

                        <div className="flex gap-1 justify-end w-20">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/herbs/${herb.id}/edit`);
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
                              handleDeleteHerb(herb.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HerbPreview component to show details */}
        {previewHerb && (
          <HerbPreview 
            herb={previewHerb} 
            isOpen={!!previewHerb} 
            onClose={() => setPreviewHerb(null)}
            onEdit={handleEditHerb}
          />
        )}

        {/* Component to import herbs */}
        <HerbImporter 
          isOpen={importDialogOpen} 
          onClose={() => setImportDialogOpen(false)} 
        />
      </div>
    </Layout>
  );
}