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
import { z } from "zod";
import { supabase } from "@/lib/supabase";
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
  meridians: z.array(z.string()).optional(),
  functions: z.array(z.string()).optional(),
  // Campos nuevos
  notes: z.string().optional(),
  standard_indications: z.string().optional(),
  pregnancy_considerations: z.string().optional(),
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
      pinyin_name: "",
      chinese_name: "",
      english_name: "",
      latin_name: "",
      category: "",
      nature: "",
      flavor: "",
      toxicity: "",
      dosage: "",
      meridians: [],
      functions: [""],
      applications: "",
      contraindications: "",
      pharmacological_effects: [],
      laboratory_effects: [],
      herb_drug_interactions: [],
      notes: "",
      standard_indications: "",
      pregnancy_considerations: "",
    },
  });
  
  // Actualizamos los valores del formulario cuando se cargan los datos de la hierba
  useEffect(() => {
    if (herb && !isLoading) {
      // Establecer los valores base
      form.reset({
        pinyin_name: herb.pinyin_name || "",
        chinese_name: herb.chinese_name || "",
        english_name: herb.english_name || "",
        latin_name: herb.latin_name || "",
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
        pharmacological_effects: Array.isArray(herb.pharmacological_effects) 
          ? herb.pharmacological_effects 
          : [],
        laboratory_effects: Array.isArray(herb.laboratory_effects) 
          ? herb.laboratory_effects 
          : [],
        herb_drug_interactions: Array.isArray(herb.herb_drug_interactions) 
          ? herb.herb_drug_interactions 
          : [],
          
        // Nuevos campos
        notes: herb.notes || "",
        standard_indications: herb.standard_indications || "",
        pregnancy_considerations: herb.pregnancy_considerations || "",
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
      // Filter out undefined values and only send fields that exist in the database
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => 
          value !== undefined && 
          value !== null && 
          value !== "" &&
          // Only include fields that exist in the database schema
          [
            'pinyin_name', 'chinese_name', 'latin_name', 'english_name',
            'category', 'nature', 'flavor', 'toxicity', 'meridians',
            'dosage', 'preparation', 'primary_functions', 'clinical_patterns',
            'therapeutic_actions', 'tcm_actions', 'combinations',
            'synergistic_pairs', 'antagonistic_pairs', 'standard_indications',
            'special_indications', 'preparation_methods', 'contraindications',
            'cautions', 'pregnancy_considerations', 'biological_effects',
            'clinical_evidence', 'herb_drug_interactions', 'references_list',
            'properties', 'notes', 'functions', 'applications',
            'secondary_actions', 'common_combinations', 'pharmacological_effects',
            'laboratory_effects', 'clinical_studies_and_research'
          ].includes(key)
        )
      );

      console.log("Clean data to insert:", cleanData);

      if (isNewHerb) {
        // Para crear una nueva hierba
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }

        const { data: newHerb, error } = await supabase
          .from('herbs')
          .insert({ ...cleanData, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return newHerb;
      } else if (id && id !== 'new') {
        // Para actualizar una hierba existente
        const { data: updatedHerb, error } = await supabase
          .from('herbs')
          .update(cleanData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return updatedHerb;
      } else {
        throw new Error("ID de hierba no válido");
      }
    },
    onSuccess: (data) => {
      toast({
        title: isNewHerb ? "Hierba creada" : "Hierba actualizada",
        description: `La hierba ${data.pinyin_name} ha sido ${isNewHerb ? "creada" : "actualizada"} correctamente.`,
      });
      // Invalidamos la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/herbs"] });
      // Redirigimos a la página de detalle después de un pequeño delay
      setTimeout(() => {
        navigate(`/herbs/${data.id}`);
      }, 100);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `Ha ocurrido un error al ${isNewHerb ? "crear" : "actualizar"} la hierba: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Maneja el envío del formulario
  const onSubmit = (data: HerbFormValues) => {
    console.log("Form submitted with data:", data);
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
            {isNewHerb ? "Nueva Hierba" : `Editar Hierba: ${herb?.pinyin_name}`}
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
                  name="pinyin_name"
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
                  name="chinese_name"
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
                  name="english_name"
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
                  name="latin_name"
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
                  name="pregnancy_considerations"
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