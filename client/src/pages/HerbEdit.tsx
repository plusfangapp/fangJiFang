import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Herb, insertHerbSchema } from "@/types";
import { useFieldArray } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Extiende el esquema para validación específica del frontend
const herbSchema = insertHerbSchema.extend({
  // Podemos añadir validaciones adicionales aquí si es necesario
  meridians: insertHerbSchema.shape.meridians,
  functions: insertHerbSchema.shape.functions,
  // Campos nuevos
  notes: insertHerbSchema.shape.notes,
  standardIndications: insertHerbSchema.shape.standardIndications,
  pregnancyConsiderations: insertHerbSchema.shape.pregnancyConsiderations,
});

// Tipo derivado del esquema para TypeScript
type HerbFormValues = typeof herbSchema._type;

const natureOptions = [
  { label: "Caliente (Hot)", value: "hot" },
  { label: "Templado (Warm)", value: "warm" },
  { label: "Neutral", value: "neutral" },
  { label: "Fresco (Cool)", value: "cool" },
  { label: "Frío (Cold)", value: "cold" },
];

const flavorOptions = [
  { label: "Picante (Acrid)", value: "acrid" },
  { label: "Dulce (Sweet)", value: "sweet" },
  { label: "Amargo (Bitter)", value: "bitter" },
  { label: "Ácido (Sour)", value: "sour" },
  { label: "Salado (Salty)", value: "salty" },
  { label: "Astringente (Astringent)", value: "astringent" },
];

const meridianOptions = [
  { label: "Pulmón (Lung)", value: "Lung" },
  { label: "Intestino Grueso (Large Intestine)", value: "Large Intestine" },
  { label: "Estómago (Stomach)", value: "Stomach" },
  { label: "Bazo (Spleen)", value: "Spleen" },
  { label: "Corazón (Heart)", value: "Heart" },
  { label: "Intestino Delgado (Small Intestine)", value: "Small Intestine" },
  { label: "Vejiga (Bladder)", value: "Bladder" },
  { label: "Riñón (Kidney)", value: "Kidney" },
  { label: "Pericardio (Pericardium)", value: "Pericardium" },
  { label: "Triple Calentador (Triple Burner)", value: "Triple Burner" },
  { label: "Vesícula Biliar (Gallbladder)", value: "Gallbladder" },
  { label: "Hígado (Liver)", value: "Liver" },
];

export default function HerbEdit() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  // Verificar explícitamente si estamos creando una nueva hierba
  const isNewHerb = id === "new" || !id;

  // Consulta para obtener los datos de la hierba si estamos editando
  const { data: herb, isLoading } = useQuery<Herb>({
    queryKey: ["/api/herbs", id],
    enabled: !isNewHerb && !!id,
  });

  // Configuración del formulario con React Hook Form
  const form = useForm<HerbFormValues>({
    resolver: zodResolver(herbSchema),
    defaultValues: {
      pinyinName: "",
      chineseName: "",
      englishName: "",
      latinName: "",
      category: "",
      nature: "",
      flavor: "",
      toxicity: "",
      dosage: "",
      meridians: [],
      functions: [""],
      applications: "",
      contraindications: "",
      pharmacologicalEffects: [],
      laboratoryEffects: [],
      herbDrugInteractions: [],
      notes: "",
      standardIndications: "",
      pregnancyConsiderations: "",
    },
  });
  
  // Actualizamos los valores del formulario cuando se cargan los datos de la hierba
  useEffect(() => {
    if (herb && !isLoading) {
      // Establecer los valores base
      form.reset({
        pinyinName: herb.pinyinName || "",
        chineseName: herb.chineseName || "",
        englishName: herb.englishName || "",
        latinName: herb.latinName || "",
        category: herb.category || "",
        nature: herb.nature || "",
        flavor: herb.flavor || "",
        toxicity: herb.toxicity || "",
        dosage: herb.dosage || "",
        applications: herb.applications || "",
        contraindications: herb.contraindications || "",
        
        // Arreglos con verificación de nulos
        meridians: Array.isArray(herb.meridians) ? herb.meridians : [],
        functions: Array.isArray(herb.functions) && herb.functions.length > 0 
          ? herb.functions 
          : [""],
        pharmacologicalEffects: Array.isArray(herb.pharmacologicalEffects) 
          ? herb.pharmacologicalEffects 
          : [],
        laboratoryEffects: Array.isArray(herb.laboratoryEffects) 
          ? herb.laboratoryEffects 
          : [],
        herbDrugInteractions: Array.isArray(herb.herbDrugInteractions) 
          ? herb.herbDrugInteractions 
          : [],
          
        // Nuevos campos
        notes: herb.notes || "",
        standardIndications: herb.standardIndications || "",
        pregnancyConsiderations: herb.pregnancyConsiderations || "",
      });
      console.log("Formulario actualizado con datos de la hierba:", herb);
    }
  }, [herb, isLoading, form]);

  // Field array para gestionar la lista de funciones
  const { fields: functionFields, append: appendFunction, remove: removeFunction } = useFieldArray({
    control: form.control,
    name: "functions" as never,
  });

  // Mutación para crear o actualizar la hierba
  const mutation = useMutation({
    mutationFn: async (data: HerbFormValues) => {
      if (isNewHerb) {
        // Para crear una nueva hierba siempre usamos POST
        return await apiRequest("/api/herbs", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else if (id && id !== 'new') {
        // Solo intentamos actualizar si tenemos un ID válido
        return await apiRequest(`/api/herbs/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        throw new Error("ID de hierba no válido");
      }
    },
    onSuccess: (data) => {
      toast({
        title: isNewHerb ? "Hierba creada" : "Hierba actualizada",
        description: `La hierba ${data.pinyinName} ha sido ${isNewHerb ? "creada" : "actualizada"} correctamente.`,
      });
      // Invalidamos la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/herbs"] });
      // Redirigimos a la página de detalle
      navigate(`/herbs/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Ha ocurrido un error al ${isNewHerb ? "crear" : "actualizar"} la hierba: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Maneja el envío del formulario
  const onSubmit = (data: HerbFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading && !isNewHerb) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-md w-72"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-20 bg-muted rounded-md"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/herbs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewHerb ? "Nueva Hierba" : `Editar Hierba: ${herb?.pinyinName}`}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pinyinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Pinyin</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ren Shen" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chineseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Chino</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 人参" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="englishName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre en Inglés</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ginseng" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="latinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Latín</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Panax ginseng" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tonic Herbs">Hierbas Tónicas</SelectItem>
                          <SelectItem value="Clearing Herbs">Hierbas Dispersantes</SelectItem>
                          <SelectItem value="Downward Draining Herbs">Hierbas Drenantes</SelectItem>
                          <SelectItem value="Wind Herbs">Hierbas para el Viento</SelectItem>
                          <SelectItem value="Heat Clearing Herbs">Hierbas para Aclarar Calor</SelectItem>
                          <SelectItem value="Harmonizing Herbs">Hierbas Armonizantes</SelectItem>
                          <SelectItem value="Digestion Herbs">Hierbas Digestivas</SelectItem>
                          <SelectItem value="Astringent Herbs">Hierbas Astringentes</SelectItem>
                          <SelectItem value="Exterior Releasing Herbs">Hierbas Liberadoras Externas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naturaleza</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione la naturaleza" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {natureOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flavor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sabor</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el sabor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flavorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toxicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toxicidad</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Nivel de toxicidad (si aplica)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No tóxica">No tóxica</SelectItem>
                            <SelectItem value="Baja toxicidad">Baja toxicidad</SelectItem>
                            <SelectItem value="Toxicidad moderada">Toxicidad moderada</SelectItem>
                            <SelectItem value="Alta toxicidad">Alta toxicidad</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosificación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 3-9g" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="meridians"
                  render={() => (
                    <FormItem>
                      <FormLabel>Meridianos</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {meridianOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="meridians"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.value}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValue, option.value])
                                          : field.onChange(
                                              currentValue.filter(
                                                (value) => value !== option.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Funciones y Aplicaciones</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <FormLabel>Funciones</FormLabel>
                  {functionFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`functions.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input 
                                placeholder="Ej: Tonifica el Qi" 
                                {...field} 
                                value={field.value || ''} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFunction(index)}
                        disabled={functionFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => appendFunction("")}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Añadir función
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="applications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aplicaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa las aplicaciones de esta hierba..."
                          className="min-h-20"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standardIndications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicaciones Estándar</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Indicaciones habituales para esta hierba..."
                          className="min-h-20"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Precauciones</h2>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="contraindications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraindicaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contraindicaciones de esta hierba..."
                          className="min-h-20"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pregnancyConsiderations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consideraciones durante el embarazo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Consideraciones para el uso durante el embarazo..."
                          className="min-h-20"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Notas adicionales</h2>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales sobre esta hierba..."
                        className="min-h-32"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="flex gap-2 min-w-32"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
}