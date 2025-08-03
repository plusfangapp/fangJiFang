import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Palette, Upload, Download, Bell, User, Settings, FileUp, FileDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColorSelector } from "@/components/color-selector";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useLanguage, Language } from "@/lib/language-context";

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor introduce un email válido.",
  }),
});

const appearanceFormSchema = z.object({
  color: z.enum(["azul", "verde", "ambar", "rojo", "purpura"]),
  fontSize: z.enum(["pequeño", "normal", "grande"]),
});

const notificationsFormSchema = z.object({
  patientReminders: z.boolean().default(true),
  herbUpdates: z.boolean().default(false),
  systemUpdates: z.boolean().default(true),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  // Manejar cambio de idioma
  const handleLanguageChange = (newLanguage: string) => {
    if (newLanguage === 'es' || newLanguage === 'en') {
      setLanguage(newLanguage as Language);
    }
  };

  // Formulario de cuenta
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "Dr. López",
      email: "correo@example.com",
    },
  });

  // Formulario de apariencia
  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      color: "azul",
      fontSize: "normal",
    },
  });

  // Formulario de notificaciones
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      patientReminders: true,
      herbUpdates: false,
      systemUpdates: true,
    },
  });

  // Funciones para manejar envío de formularios
  function onAccountSubmit(data: z.infer<typeof accountFormSchema>) {
    toast({
      title: t('toast.account_updated'),
      description: t('toast.account_updated.description'),
    });
  }

  function onAppearanceSubmit(data: z.infer<typeof appearanceFormSchema>) {
    toast({
      title: t('toast.appearance_updated'),
      description: t('toast.appearance_updated.description'),
    });
  }

  function onNotificationsSubmit(data: z.infer<typeof notificationsFormSchema>) {
    toast({
      title: t('toast.notifications_updated'),
      description: t('toast.notifications_updated.description'),
    });
  }

  function handleImport() {
    // Lógica para importar datos
    toast({
      title: t('toast.import_started'),
      description: t('toast.import_started.description'),
    });
  }

  function handleExport() {
    // Lógica para exportar datos
    toast({
      title: t('toast.export_done'),
      description: t('toast.export_done.description'),
    });
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <Separator className="my-6" />
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>{t('settings.general')}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{t('settings.account')}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>{t('settings.appearance')}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>{t('settings.notifications')}</span>
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>{t('settings.import_export')}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Contenido de las pestañas */}
          <TabsContent value="general" className="space-y-4">
            {/* Sección General */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-semibold">{t('settings.general')}</h2>
              </div>
              <Card>
              <CardHeader>
                <CardDescription>
                  {t('settings.general.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t('settings.version')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.current_version')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t('settings.language')}</h3>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t('settings.database')}</h3>
                  <Button variant="outline">{t('settings.make_backup')}</Button>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t('settings.reset_app')}</h3>
                  <Button variant="destructive">{t('settings.reset_default')}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección de Cuenta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{t('settings.account')}</h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  {t('settings.account.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountForm}>
                  <form
                    onSubmit={accountForm.handleSubmit(onAccountSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={accountForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.name')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('settings.name.description')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.email')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('settings.email.description')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">{t('settings.save_changes')}</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sección de Apariencia */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{t('settings.appearance')}</h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  {t('settings.appearance.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Selector de color principal */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t('settings.main_color')}</h3>
                    <div className="flex items-center space-x-2">
                      <ColorSelector />
                      <span className="text-sm text-muted-foreground">{t('settings.select_color')}</span>
                    </div>
                  </div>
                  
                  {/* Selector de tamaño de fuente */}
                  <Form {...appearanceForm}>
                    <form
                      onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={appearanceForm.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('settings.font_size')}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pequeño">{t('settings.font_size.small')}</SelectItem>
                                <SelectItem value="normal">{t('settings.font_size.normal')}</SelectItem>
                                <SelectItem value="grande">{t('settings.font_size.large')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('settings.font_size.description')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="mt-4">{t('settings.save_preferences')}</Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección de Notificaciones */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{t('settings.notifications')}</h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  {t('settings.notifications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form
                    onSubmit={notificationsForm.handleSubmit(
                      onNotificationsSubmit
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={notificationsForm.control}
                      name="patientReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel>{t('settings.patient_reminders')}</FormLabel>
                            <FormDescription>
                              {t('settings.patient_reminders.description')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="herbUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel>{t('settings.herb_updates')}</FormLabel>
                            <FormDescription>
                              {t('settings.herb_updates.description')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="systemUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel>{t('settings.system_updates')}</FormLabel>
                            <FormDescription>
                              {t('settings.system_updates.description')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-4">{t('settings.save_preferences')}</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sección de Importar/Exportar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{t('settings.import_export')}</h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  {t('settings.import_export.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sección de Importar */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileUp className="h-4 w-4 mr-2" />
                        {t('settings.import_data')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {t('settings.import.description')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-col space-y-2">
                            <Button onClick={handleImport} className="w-full">
                              <Upload className="h-4 w-4 mr-2" />
                              {t('settings.select_file')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sección de Exportar */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileDown className="h-4 w-4 mr-2" />
                        {t('settings.export_data')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {t('settings.export.description')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-col space-y-2">
                            <Button onClick={handleExport} className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              {t('settings.export_all')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}