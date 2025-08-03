import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle, Upload, X, Edit, Search, Filter } from "lucide-react";
import HerbImporter from "@/components/HerbImporter";
import { useToast } from "@/hooks/use-toast";
import LibraryPanel from "@/components/LibraryPanel";
import { useLanguage } from "@/lib/language-context";

export default function HerbsPage() {
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: herbs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/herbs"],
  });

  // Función para filtrar hierbas según criterios de búsqueda
  const filteredHerbs = herbs.filter((herb: any) => {
    const matchesSearch =
      searchQuery === "" ||
      herb.pinyin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      herb.english_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      herb.latin_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || herb.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(herbs.map((herb: any) => herb.category))).filter(Boolean);

  return (
    <Layout>
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('herbs.title')}</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsImporterOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>{t('herbs.import')}</span>
            </Button>
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => {/* Funcionalidad para agregar nueva hierba */}}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('herbs.add')}</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('herbs.search')}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  className="h-10 pl-3 pr-8 rounded-md border border-input bg-background text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">{t('herbs.allCategories')}</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
                {filteredHerbs.map((herb: any) => (
                  <Card key={herb.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{herb.pinyin_name}</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{herb.latin_name}</p>
                      {herb.category && (
                        <Badge variant="outline" className="mt-2">
                          {herb.category}
                        </Badge>
                      )}
                      <div className="mt-2 text-sm">
                        <div className="flex gap-1 items-center">
                          <span className="font-medium">{t('herbs.nature')}:</span>
                          <span>{herb.nature || "-"}</span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <span className="font-medium">{t('herbs.flavor')}:</span>
                          <span>{herb.flavor || "-"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Componente Importador de Hierbas */}
      <HerbImporter 
        isOpen={isImporterOpen} 
        onClose={() => setIsImporterOpen(false)} 
        onSuccess={() => {
          setIsImporterOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/herbs"] });
          toast({
            title: t('herbs.importSuccess'),
            description: t('herbs.importSuccessDetail'),
          });
        }} 
      />
    </Layout>
  );
}