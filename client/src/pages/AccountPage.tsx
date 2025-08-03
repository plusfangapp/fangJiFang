import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  CalendarClock,
  CreditCard,
  Database,
  Globe,
  HelpCircle,
  Info,
  Laptop,
  LogOut,
  Mail,
  MessageSquare,
  Moon, 
  Phone,
  Shield,
  Sun, 
  Trash2,
  User,
  UserCog,
  UserPlus,
  Users,
  PlusCircle,
  FilePlus,
  ClipboardEdit,
  X,
  Pill
} from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChromePicker } from 'react-color';

export default function AccountPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("account");

  // Estados para condiciones médicas
  const [medicalConditions, setMedicalConditions] = useState<Array<{id: string, name: string}>>([]);
  const [newConditionName, setNewConditionName] = useState("");
  const [editingCondition, setEditingCondition] = useState<{id: string, name: string} | null>(null);
  const [isSavingConditions, setIsSavingConditions] = useState(false);

  // Estados para medicaciones
  const [medications, setMedications] = useState<Array<{id: string, name: string, dosage: string, frequency: string}>>([]);
  const [newMedicationName, setNewMedicationName] = useState("");
  const [editingMedication, setEditingMedication] = useState<{id: string, name: string} | null>(null);

  // Estados del usuario
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Dr. Usuario');
  const [userImage, setUserImage] = useState(localStorage.getItem('userImage') || '');
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(!localStorage.getItem('userImage'));

  // Cargar condiciones médicas y medicaciones al iniciar
  useEffect(() => {
    // Cargar condiciones médicas
    const savedConditions = localStorage.getItem('medicalConditions');
    if (savedConditions) {
      try {
        setMedicalConditions(JSON.parse(savedConditions));
      } catch (error) {
        console.error("Error loading medical conditions:", error);
        // Inicializar con condiciones médicas por defecto si hay un error
        setMedicalConditions([
          { id: "mc1", name: "Embarazo" },
          { id: "mc2", name: "Hipertensión" },
          { id: "mc3", name: "Diabetes Tipo 2" },
          { id: "mc4", name: "Enfermedad hepática" }
        ]);
      }
    } else {
      // Inicializar con condiciones médicas por defecto
      const defaultMedicalConditions = [
        { id: "mc1", name: "Embarazo" },
        { id: "mc2", name: "Hipertensión" },
        { id: "mc3", name: "Diabetes Tipo 2" },
        { id: "mc4", name: "Enfermedad hepática" }
      ];
      setMedicalConditions(defaultMedicalConditions);

      // Guardar las condiciones por defecto
      localStorage.setItem('medicalConditions', JSON.stringify(defaultMedicalConditions));
    }

    // Cargar medicaciones
    const savedMedications = localStorage.getItem('medications');
    if (savedMedications) {
      try {
        setMedications(JSON.parse(savedMedications));
      } catch (error) {
        console.error("Error loading medications:", error);
        // Inicializar con medicaciones por defecto si hay un error
        const defaultMedications = [
          { id: "med1", name: "Paracetamol", dosage: "500mg", frequency: "Cada 8 horas" },
          { id: "med2", name: "Ibuprofeno", dosage: "400mg", frequency: "Cada 12 horas" },
          { id: "med3", name: "Omeprazol", dosage: "20mg", frequency: "Una vez al día" }
        ];
        setMedications(defaultMedications);
        localStorage.setItem('medications', JSON.stringify(defaultMedications));
      }
    } else {
      // Inicializar con medicaciones por defecto
      const defaultMedications = [
        { id: "med1", name: "Paracetamol", dosage: "500mg", frequency: "Cada 8 horas" },
        { id: "med2", name: "Ibuprofeno", dosage: "400mg", frequency: "Cada 12 horas" },
        { id: "med3", name: "Omeprazol", dosage: "20mg", frequency: "Una vez al día" }
      ];
      setMedications(defaultMedications);
      localStorage.setItem('medications', JSON.stringify(defaultMedications));
    }
  }, []);

  // Para fines de demostración
  const mockUser = {
    id: 1,
    name: "",
    email: "",
    phone: "",
    profession: "Medicina Tradicional China",
    specialty: "",
    avatarUrl: "",
    subscription: "Premium",
    signupDate: "2023-06-15",
    paymentStatus: "Activo",
    billingHistory: [
      { id: 1, date: "2024-04-01", amount: "€49.99", status: "Pagado" },
      { id: 2, date: "2024-03-01", amount: "€49.99", status: "Pagado" },
      { id: 3, date: "2024-02-01", amount: "€49.99", status: "Pagado" }
    ],
    preferences: {
      language: "es",
      theme: "light",
      compactView: true,
      alphabeticalOrder: true,
      notifications: true
    },
    security: {
      lastPasswordChange: "2024-01-10",
      twoFactorEnabled: false,
      connectedDevices: [
        { id: 1, name: "MacBook Pro", lastAccess: "2024-05-15 14:23" },
        { id: 2, name: "iPhone 14", lastAccess: "2024-05-15 12:45" }
      ]
    }
  };

  const handleSaveProfile = () => {
    setIsLoading(true);

    // Guardar el nombre de usuario en localStorage
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const phoneInput = document.getElementById('phone') as HTMLInputElement;

    if (nameInput && nameInput.value) {
      localStorage.setItem('userName', nameInput.value);
      setUserName(nameInput.value);
    }

    if (emailInput) {
      localStorage.setItem('userEmail', emailInput.value);
    }

    if (phoneInput) {
      localStorage.setItem('userPhone', phoneInput.value);
    }

    // Simulación de guardado
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Perfil actualizado",
        description: "La información de tu perfil ha sido actualizada correctamente.",
      });

      // Forzar recarga para actualizar el avatar en la barra
      window.location.reload();
    }, 1000);
  };

  const handleChangePassword = () => {
    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido cambiada correctamente.",
    });
  };

  const handleLogoutAllDevices = () => {
    toast({
      title: "Sesiones cerradas",
      description: "Se han cerrado todas las sesiones en dispositivos remotos.",
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente.",
        variant: "destructive"
      });
    }
  };

  // Función para guardar las condiciones médicas en localStorage
  const saveMedicalConditions = (conditions: Array<{id: string, name: string}>) => {
    try {
      localStorage.setItem('medicalConditions', JSON.stringify(conditions));
    } catch (error) {
      console.error("Error saving medical conditions:", error);
    }
  };

  // Función para guardar las medicaciones en localStorage
  const saveMedications = (medicationList: Array<{id: string, name: string, dosage: string, frequency: string}>) => {
    try {
      localStorage.setItem('medications', JSON.stringify(medicationList));
    } catch (error) {
      console.error("Error saving medications:", error);
    }
  };

  // Funciones para condiciones médicas
  const addMedicalCondition = () => {
    if (newConditionName.trim() === "") return;

    // Generar un ID único para la nueva condición
    const newId = `mc${Date.now()}`;

    // Crear la nueva lista de condiciones
    const updatedConditions = [
      ...medicalConditions,
      { id: newId, name: newConditionName.trim() }
    ];

    // Actualizar el estado
    setMedicalConditions(updatedConditions);

    // Guardar en localStorage
    saveMedicalConditions(updatedConditions);

    // Limpiar el input
    setNewConditionName("");

    toast({
      title: "Condición médica añadida",
      description: `Se ha añadido la condición "${newConditionName.trim()}" correctamente.`
    });
  };

  const startEditCondition = (condition: {id: string, name: string}) => {
    setEditingCondition(condition);
  };

  const updateCondition = () => {
    if (!editingCondition || editingCondition.name.trim() === "") return;

    // Actualizar la condición en la lista
    const updatedConditions = medicalConditions.map(condition => 
      condition.id === editingCondition.id 
        ? { ...condition, name: editingCondition.name.trim() } 
        : condition
    );

    // Actualizar el estado
    setMedicalConditions(updatedConditions);

    // Guardar en localStorage
    saveMedicalConditions(updatedConditions);

    setEditingCondition(null);

    toast({
      title: "Condición médica actualizada",
      description: "La condición médica ha sido actualizada correctamente."
    });
  };

  const cancelEdit = () => {
    setEditingCondition(null);
    setEditingMedication(null);
  };

  const deleteCondition = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta condición médica?")) {
      // Filtrar la condición de la lista
      const updatedConditions = medicalConditions.filter(condition => condition.id !== id);

      // Actualizar el estado
      setMedicalConditions(updatedConditions);

      // Guardar en localStorage
      saveMedicalConditions(updatedConditions);

      toast({
        title: "Condición médica eliminada",
        description: "La condición médica ha sido eliminada correctamente."
      });
    }
  };

  // Funciones para medicaciones
  const addMedication = () => {
    if (newMedicationName.trim() === "") return;

    // Generar un ID único para la nueva medicación
    const newId = `med${Date.now()}`;

    // Crear la nueva medicación
    const newMedication = {
      id: newId,
      name: newMedicationName.trim(),
      dosage: newMedicationDosage.trim(),
      frequency: newMedicationFrequency.trim()
    };

    // Crear la nueva lista de medicaciones
    const updatedMedications = [...medications, newMedication];

    // Actualizar el estado
    setMedications(updatedMedications);

    // Guardar en localStorage
    saveMedications(updatedMedications);

    // Limpiar los inputs
    setNewMedicationName("");
    setNewMedicationDosage("");
    setNewMedicationFrequency("");

    toast({
      title: "Medicación añadida",
      description: `Se ha añadido la medicación "${newMedicationName.trim()}" correctamente.`
    });
  };

  const startEditMedication = (medication: {id: string, name: string, dosage: string, frequency: string}) => {
    setEditingMedication(medication);
  };

  const updateMedication = () => {
    if (!editingMedication || editingMedication.name.trim() === "") return;

    // Actualizar la medicación en la lista
    const updatedMedications = medications.map(medication => 
      medication.id === editingMedication.id 
        ? { 
            ...medication, 
            name: editingMedication.name.trim(),
            dosage: editingMedication.dosage.trim(),
            frequency: editingMedication.frequency.trim()
          } 
        : medication
    );

    // Actualizar el estado
    setMedications(updatedMedications);

    // Guardar en localStorage
    saveMedications(updatedMedications);

    setEditingMedication(null);

    toast({
      title: "Medicación actualizada",
      description: "La medicación ha sido actualizada correctamente."
    });
  };

  const deleteMedication = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta medicación?")) {
      // Filtrar la medicación de la lista
      const updatedMedications = medications.filter(medication => medication.id !== id);

      // Actualizar el estado
      setMedications(updatedMedications);

      // Guardar en localStorage
      saveMedications(updatedMedications);

      toast({
        title: "Medicación eliminada",
        description: "La medicación ha sido eliminada correctamente."
      });
    }
  };

  return (
    <Layout>
      <div className="w-full px-4 py-4 bg-[#F2F2F7]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mi Cuenta</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-6 gap-2 mb-6 bg-[#EBEBF0]">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow">
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow">
              <CreditCard className="w-4 h-4" />
              <span>Cuenta</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow">
              <UserCog className="w-4 h-4" />
              <span>Preferencias</span>
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow">
              <ClipboardEdit className="w-4 h-4" />
              <span>Prescripciones</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow">
              <Shield className="w-4 h-4" />
              <span>Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow">
              <HelpCircle className="w-4 h-4" />
              <span>Herramientas</span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Información del Usuario */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>
                  Actualiza tu información personal y profesional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar y datos personales en layout responsivo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Avatar y botones - primera columna */}
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="relative">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 rounded-full overflow-hidden">
                          {userImage && !useDefaultAvatar ? (
                            <img 
                              src={userImage} 
                              alt="Imagen del usuario" 
                              className="w-full h-full object-cover"
                              onError={() => {
                                setUseDefaultAvatar(true);
                                localStorage.removeItem('userImage');
                              }}
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center text-white cursor-pointer relative"
                              style={{ backgroundColor: localStorage.getItem('avatarColor') || '#4F46E5' }}
                              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                            >
                              <span className="text-xl font-bold">
                                {userName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase()}
                              </span>
                              {showAvatarSelector && (
                                <div className="absolute top-24 left-0 z-50">
                                  <ChromePicker
                                    color={localStorage.getItem('avatarColor') || '#4F46E5'}
                                    onChange={(color) => {
                                      localStorage.setItem('avatarColor', color.hex);
                                      window.location.reload();
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {showAvatarSelector && (
                            <div id="color-picker" className="hidden absolute top-24 left-0 z-50">
                              <ChromePicker
                                color={localStorage.getItem('avatarColor') || '#4F46E5'}
                                onChange={(color) => {
                                  localStorage.setItem('avatarColor', color.hex);
                                  window.location.reload();
                                }}
                              />
                            </div>
                          )}
                          </div>
                        <div 
                          className="relative cursor-pointer"
                          onClick={(e) => {
                            const colorInput = document.createElement('input');
                            colorInput.type = 'color';
                            colorInput.value = localStorage.getItem('avatarColor') || '#4F46E5';
                            colorInput.addEventListener('change', (event) => {
                              const input = event.target as HTMLInputElement;
                              localStorage.setItem('avatarColor', input.value);
                              window.location.reload();
                            });
                            colorInput.click();
                          }}
                          title="Haz clic para cambiar el color"
                        >
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs py-1 min-w-[120px]"
                        onClick={() => {
                          document.getElementById('avatar-upload')?.click();
                        }}
                      >
                        Subir imagen
                      </Button>

                      {userImage && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs py-1 min-w-[120px]"
                          onClick={() => {
                            setUserImage('');
                            setUseDefaultAvatar(true);
                            localStorage.removeItem('userImage');
                          }}
                        >
                          Predeterminado
                        </Button>
                      )}
                    </div>

                    {/* Input file oculto */}
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setUserImage(base64String);
                            setUseDefaultAvatar(false);
                            localStorage.setItem('userImage', base64String);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  {/* Datos personales - segunda y tercera columna */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm">Nombre completo</Label>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <Input id="name" defaultValue={localStorage.getItem('userName') || ''} placeholder="Tu nombre completo" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Input 
                          id="email" 
                          defaultValue={localStorage.getItem('userEmail') || ''} 
                          placeholder="Tu correo electrónico" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <Input 
                          id="phone" 
                          defaultValue={localStorage.getItem('userPhone') || ''} 
                          placeholder="Teléfono de contacto" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="profession" className="text-sm">Profesión</Label>
                      <Select defaultValue={mockUser.profession}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu profesión" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medicina Tradicional China">Medicina Tradicional China</SelectItem>
                          <SelectItem value="Acupuntura">Acupuntura</SelectItem>
                          <SelectItem value="Herbolario">Herbolario</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label htmlFor="specialty" className="text-sm">Especialidad</Label>
                      <Input id="specialty" placeholder="Tu especialidad" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Pestaña de Información de la Cuenta */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your subscription and billing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Information */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Plan {mockUser.subscription}</h3>
                      <p className="text-sm text-gray-500">
                        Sign up date: {new Date(mockUser.signupDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {mockUser.paymentStatus}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Button variant="outline">Cambiar de plan</Button>
                  </div>
                </div>

                {/* Historial de facturación */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" />
                    Historial de facturación
                  </h3>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 border-b text-sm font-medium">
                      <div>Fecha</div>
                      <div>Importe</div>
                      <div>Estado</div>
                    </div>
                    {mockUser.billingHistory.map((item) => (
                      <div key={item.id} className="grid grid-cols-3 gap-4 p-3 border-b last:border-b-0 hover:bg-gray-50 text-sm">
                        <div>{item.date}</div>
                        <div>{item.amount}</div>
                        <div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-right">
                    <Button variant="link" className="text-sm">Ver historial completo</Button>
                  </div>
                </div>

                {/* Método de pago */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Método de pago
                  </h3>
                  <div className="flex items-center gap-4 p-3 border rounded-md">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">VISA</span>
                    </div>
                    <div>
                      <p className="font-medium">Visa terminada en 4242</p>
                      <p className="text-sm text-gray-500">Expira 12/25</p>
                    </div>
                    <Button variant="link" className="ml-auto">Editar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Preferencias del Usuario */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
                <CardDescription>
                  Personaliza tu experiencia con la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Idioma */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="language" className="text-base font-medium">Idioma</Label>
                    </div>
                    <Select defaultValue={mockUser.preferences.language}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                </div>

                {/* Tema */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {mockUser.preferences.theme === 'light' ? (
                        <Sun className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-gray-500" />
                      )}
                      <Label htmlFor="theme" className="text-base font-medium">Tema</Label>
                    </div>
                    <Select defaultValue={mockUser.preferences.theme}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                </div>

                {/* Opciones de visualización */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-gray-500" />
                    Opciones de visualización
                  </h3>

                  <div className="ml-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-view">Vista compacta</Label>
                      <Switch id="compact-view" checked={mockUser.preferences.compactView} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="alphabetical-order">Orden alfabético</Label>
                      <Switch id="alphabetical-order" checked={mockUser.preferences.alphabeticalOrder} />
                    </div>
                  </div>
                  <Separator />
                </div>

                {/* Notificaciones */}
                <div className="space-y-3">
                  {/* Selector de color del avatar */}
                    <div className="space-y-2">
                      <Label>Color del Avatar</Label>
                      <div className="flex gap-2">
                        {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                          <div key={color} className="relative">
                            <button
                              className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                              style={{ backgroundColor: color }}
                              onClick={(e) => {
                                const el = e.currentTarget;
                                const picker = el.nextElementSibling;
                                if (picker) {
                                  picker.classList.toggle('hidden');
                                }
                              }}
                            />
                            <div className="hidden absolute z-50 top-10 left-0">
                              <ChromePicker
                                color={color}
                                onChange={(newColor) => {
                                  localStorage.setItem('avatarColor', newColor.hex);
                                  window.location.reload();
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="notifications" className="text-base font-medium">Notificaciones</Label>
                    </div>
                    <Switch id="notifications" checked={mockUser.preferences.notifications} />
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Recibe actualizaciones sobre nuevas características y mejoras del sistema</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => toast({ title: "Preferencias guardadas" })}>
                  Guardar preferencias
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Pestaña de Seguridad */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>
                  Gestiona la seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cambiar contraseña */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Cambiar contraseña
                  </h3>
                  <p className="text-sm text-gray-500 ml-6">
                    Última actualización: {new Date(mockUser.security.lastPasswordChange).toLocaleDateString()}
                  </p>
                  <div className="grid gap-3 ml-6">
                    <div className="space-y-1">
                      <Label htmlFor="current-password">Contraseña actual</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-password">Nueva contraseña</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button onClick={handleChangePassword} className="w-full sm:w-auto">
                      Cambiar contraseña
                    </Button>
                  </div>
                  <Separator className="my-4" />
                </div>

                {/* Autenticación en dos pasos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="2fa" className="text-base font-medium">Autenticación en dos pasos</Label>
                    </div>
                    <Switch id="2fa" checked={mockUser.security.twoFactorEnabled} />
                  </div>
                  <p className="text-sm text-gray-500 ml-6">
                    Aumenta la seguridad de tu cuenta requiriendo un código además de tu contraseña
                  </p>
                  <Separator className="my-2" />
                </div>

                {/* Dispositivos conectados */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-gray-500" />
                    Dispositivos conectados
                  </h3>
                  <div className="border rounded-md">
                    {mockUser.security.connectedDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-gray-500">Último acceso: {device.lastAccess}</p>
                        </div>
                        <Button variant="outline" size="sm">Cerrar sesión</Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="secondary" onClick={handleLogoutAllDevices}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar sesión en todos los dispositivos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Prescripciones */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Prescripciones</CardTitle>
                <CardDescription>
                  Administra las condiciones médicas que pueden seleccionarse en las prescripciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sección de Condiciones Médicas - Lado Izquierdo */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Condiciones Médicas</h3>

                    {/* Formulario para añadir nueva condición */}
                    <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                      <h4 className="font-medium text-sm mb-3">Añadir nueva condición médica</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nombre de la condición médica"
                          value={newConditionName}
                          onChange={(e) => setNewConditionName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && addMedicalCondition()}
                        />
                        <Button 
                          onClick={addMedicalCondition} 
                          disabled={newConditionName.trim() === ""}
                          className="gap-1"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Añadir</span>
                        </Button>
                      </div>
                    </div>

                    {/* Lista de condiciones médicas */}
                    <div className="border rounded-lg overflow-hidden mb-6">
                      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <h4 className="font-medium text-sm">Condiciones médicas configuradas</h4>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="gap-1 text-xs h-8"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de que deseas eliminar todas las condiciones médicas? Esta acción no se puede deshacer.")) {
                              // Borrar todas las condiciones
                              setMedicalConditions([]);
                              localStorage.removeItem('medicalConditions');
                              toast({
                                title: "Condiciones eliminadas",
                                description: "Se han eliminado todas las condiciones médicas personalizadas.",
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Borrar todas</span>
                        </Button>
                      </div>

                      <div className="divide-y">
                        {medicalConditions.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No hay condiciones médicas configuradas. Añade una nueva condición.
                          </div>
                        ) : (
                          medicalConditions.map(condition => (
                            <div key={condition.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                              {editingCondition?.id === condition.id ? (
                                <div className="flex items-center gap-2 w-full">
                                  <Input
                                    value={editingCondition.name}
                                    onChange={(e) => setEditingCondition({...editingCondition, name: e.target.value})}
                                    className="flex-1"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                                      Cancelar
                                    </Button>
                                    <Button size="sm" onClick={updateCondition}>
                                      Guardar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm">{condition.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => startEditCondition(condition)}
                                    >
                                      <ClipboardEdit className="h-4 w-4 text-gray-500" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => deleteCondition(condition.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sección de Medicaciones - Lado Derecho */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Medicaciones</h3>

                    {/* Formulario para añadir nueva medicación */}
                    <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                      <h4 className="font-medium text-sm mb-3">Añadir nueva medicación</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nombre de la medicación"
                          value={newMedicationName}
                          onChange={(e) => setNewMedicationName(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => {
                            if (newMedicationName.trim()) {
                              const newMed = {
                                id: `med${Date.now()}`,
                                name: newMedicationName.trim()
                              };
                              setMedications([...medications, newMed]);
                              localStorage.setItem('medications', JSON.stringify([...medications, newMed]));
                              setNewMedicationName('');
                              toast({
                                title: "Medicación añadida",
                                description: `Se ha añadido "${newMedicationName.trim()}" correctamente.`
                              });
                            }
                          }} 
                          disabled={newMedicationName.trim() === ""}
                          className="gap-1"
                        >
                          <Pill className="h-4 w-4" />
                          <span>Añadir</span>
                        </Button>
                      </div>
                    </div>

                    {/* Lista de medicaciones */}
                    <div className="border rounded-lg overflow-hidden mb-6">
                      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <h4 className="font-medium text-sm">Medicaciones configuradas</h4>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="gap-1 text-xs h-8"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de que deseas eliminar todas las medicaciones? Esta acción no se puede deshacer.")) {
                              // Borrar todas las medicaciones
                              setMedications([]);
                              localStorage.removeItem('medications');
                              toast({
                                title: "Medicaciones eliminadas",
                                description: "Se han eliminado todas las medicaciones personalizadas.",
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Borrar todas</span>
                        </Button>
                      </div>

                      <div className="divide-y">
                        {medications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No hay medicaciones configuradas. Añade una nueva medicación.
                          </div>
                        ) : (
                          medications.map(medication => (
                            <div key={medication.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                              {editingMedication?.id === medication.id ? (
                                <div className="flex flex-col w-full gap-2">
                                  <div className="flex items-center gap-2 w-full">
                                    <Input
                                      value={editingMedication.name}
                                      onChange={(e) => setEditingMedication({...editingMedication, name: e.target.value})}
                                      className="flex-1"
                                      placeholder="Nombre de la medicación"
                                      autoFocus
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 w-full">
                                    <Input
                                      value={editingMedication.dosage}
                                      onChange={(e) => setEditingMedication({...editingMedication, dosage: e.target.value})}
                                      className="flex-1"
                                      placeholder="Dosificación (ej: 500mg)"
                                    />
                                    <Input
                                      value={editingMedication.frequency}
                                      onChange={(e) => setEditingMedication({...editingMedication, frequency: e.target.value})}
                                      className="flex-1"
                                      placeholder="Frecuencia (ej: cada 8 horas)"
                                    />
                                  </div>
                                  <div className="flex items-center justify-end gap-1 mt-1">
                                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                                      Cancelar
                                    </Button>
                                    <Button size="sm" onClick={updateMedication}>
                                      Guardar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{medication.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => startEditMedication(medication)}
                                    >
                                      <ClipboardEdit className="h-4 w-4 text-gray-500" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => deleteMedication(medication.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between">
                <div className="text-sm text-gray-500">
                  <p>Las condiciones médicas y medicaciones se utilizarán para evaluar automáticamente posibles contraindicaciones, precauciones e interacciones medicamentosas en las prescripciones.</p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Pestaña de Herramientas */}
          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Herramientas y accesos rápidos</CardTitle>
                <CardDescription>
                  Accede a funciones adicionales y gestiona tus datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Soporte técnico */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Soporte técnico
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm">Contacta con nuestro equipo para resolver dudas o problemas.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Contactar soporte</Button>
                    </CardFooter>
                  </Card>

                  {/* Enviar feedback */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Sugerencias
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm">Comparte tus ideas para mejorar la plataforma.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Enviar sugerencias</Button>
                    </CardFooter>
                  </Card>

                  {/* Exportar datos */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        Exportar datos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm">Descarga toda tu información personal (RGPD).</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Exportar datos</Button>
                    </CardFooter>
                  </Card>

                  {/* Eliminar cuenta */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm">Permanently delete your account and all your data.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Información de la versión */}
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Versión 1.0.0</p>
                  <p className="mt-1">© {new Date().getFullYear()} Chinese Medicine Manager</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}