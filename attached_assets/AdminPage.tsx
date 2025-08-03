import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus, Bell, LineChart, LayoutDashboard, Users, Settings, FileText, Database, Shield, PlusCircle } from "lucide-react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    search: "",
    plan: "all",
    status: "all"
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/users", {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Error fetching stats");
      return response.json();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number, data: any }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error updating user");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Usuario actualizado correctamente" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Error deleting user");
    },
    onSuccess: () => {
      toast({ title: "Usuario eliminado correctamente" });
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPlan = filters.plan === "all" || user.plan === filters.plan;
    const matchesStatus = filters.status === "all" || user.status === filters.status;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Apariencia</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Dashboard</CardTitle>
                <CardDescription>Gestiona las imágenes y su visualización en el dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Texto de Bienvenida</h3>
                  <div className="space-y-2">
                    <Input
                      defaultValue={localStorage.getItem('dashboardWelcomeText') || 'Welcome to the Traditional Chinese Medicine management system'}
                      onChange={(e) => {
                        localStorage.setItem('dashboardWelcomeText', e.target.value);
                        window.dispatchEvent(new Event('storage'));
                      }}
                      placeholder="Texto de bienvenida"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primera Imagen */}
                  <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                      {localStorage.getItem('dashboardImage1') ? (
                        <img 
                          src={localStorage.getItem('dashboardImage1')} 
                          alt="Dashboard Image 1" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <PlusCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById('image1-upload')?.click()}
                      >
                        Subir imagen
                      </Button>
                      {localStorage.getItem('dashboardImage1') && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            localStorage.removeItem('dashboardImage1');
                            localStorage.removeItem('dashboardImage1Title');
                            localStorage.removeItem('dashboardImage1Description');
                            window.location.reload();
                          }}
                        >
                          Eliminar imagen
                        </Button>
                      )}
                      <input 
                        type="file" 
                        id="image1-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              localStorage.setItem('dashboardImage1', reader.result as string);
                              window.location.reload();
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      defaultValue={localStorage.getItem('dashboardImage1Title') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        localStorage.setItem('dashboardImage1Title', value);
                      }}
                      placeholder="Título de la imagen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      defaultValue={localStorage.getItem('dashboardImage1Description') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        localStorage.setItem('dashboardImage1Description', value);
                      }}
                      placeholder="Descripción de la imagen"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localStorage.getItem('dashboardImage1Enabled') === 'true'}
                      onCheckedChange={(checked) => {
                        localStorage.setItem('dashboardImage1Enabled', checked.toString());
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>

                  {/* Segunda Imagen */}
                  <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                      {localStorage.getItem('dashboardImage2') ? (
                        <img 
                          src={localStorage.getItem('dashboardImage2')} 
                          alt="Dashboard Image 2" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <PlusCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById('image2-upload')?.click()}
                      >
                        Subir imagen
                      </Button>
                      {localStorage.getItem('dashboardImage2') && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            localStorage.removeItem('dashboardImage2');
                            localStorage.removeItem('dashboardImage2Description');
                            window.location.reload();
                          }}
                        >
                          Eliminar imagen
                        </Button>
                      )}
                      <input 
                        type="file" 
                        id="image2-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              localStorage.setItem('dashboardImage2', reader.result as string);
                              window.location.reload();
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      defaultValue={localStorage.getItem('dashboardImage2Title') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        localStorage.setItem('dashboardImage2Title', value);
                      }}
                      placeholder="Título de la imagen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      defaultValue={localStorage.getItem('dashboardImage2Description') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        localStorage.setItem('dashboardImage2Description', value);
                      }}
                      placeholder="Descripción de la imagen"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localStorage.getItem('dashboardImage2Enabled') === 'true'}
                      onCheckedChange={(checked) => {
                        localStorage.setItem('dashboardImage2Enabled', checked.toString());
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>
                </div>
              </CardContent>

              <CardHeader>
                <CardTitle>Apariencia del PDF</CardTitle>
                <CardDescription>
                  Personaliza cómo se verán los documentos PDF generados por todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logo</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                      {localStorage.getItem('pdfLogo') ? (
                        <img 
                          src={localStorage.getItem('pdfLogo')} 
                          alt="Logo PDF" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <PlusCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        Subir logo
                      </Button>
                      {localStorage.getItem('pdfLogo') && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            localStorage.removeItem('pdfLogo');
                            window.location.reload();
                          }}
                        >
                          Eliminar logo
                        </Button>
                      )}
                      <input 
                        type="file" 
                        id="logo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              localStorage.setItem('pdfLogo', reader.result as string);
                              window.location.reload();
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pie de página</h3>
                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Texto del pie de página</Label>
                    <Input 
                      id="footer-text"
                      placeholder="© 2024 MediCina TCM - Sistema Profesional de Medicina China"
                      defaultValue={localStorage.getItem('pdfFooter') || '© 2024 MediCina TCM - Sistema Profesional de Medicina China'}
                      onChange={(e) => {
                        localStorage.setItem('pdfFooter', e.target.value);
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      Este texto aparecerá en el pie de página de todos los PDFs generados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prescripciones Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPrescriptions || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prescripciones Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.proUsers || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Prescripciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        total: {
                          label: "Total",
                          theme: {
                            light: "hsl(var(--primary))",
                            dark: "hsl(var(--primary))"
                          }
                        }
                      }}
                    >
                      <RechartsPrimitive.AreaChart
                        data={[
                          { month: 'Ene', total: stats?.monthlyPrescriptions?.jan || 0 },
                          { month: 'Feb', total: stats?.monthlyPrescriptions?.feb || 0 },
                          { month: 'Mar', total: stats?.monthlyPrescriptions?.mar || 0 },
                          { month: 'Abr', total: stats?.monthlyPrescriptions?.apr || 0 },
                          { month: 'May', total: stats?.monthlyPrescriptions?.may || 0 },
                          { month: 'Jun', total: stats?.monthlyPrescriptions?.jun || 0 }
                        ]}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                      >
                        <RechartsPrimitive.XAxis dataKey="month" />
                        <RechartsPrimitive.YAxis />
                        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                        <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
                        <RechartsPrimitive.Area
                          type="monotone"
                          dataKey="total"
                          fill="url(#gradient)"
                          stroke="hsl(var(--primary))"
                        />
                        <RechartsPrimitive.defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </RechartsPrimitive.defs>
                      </RechartsPrimitive.AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Prescripciones por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Variación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Enero</TableCell>
                        <TableCell>{stats?.monthlyPrescriptions?.jan || 0}</TableCell>
                        <TableCell className="text-green-600">+{stats?.monthlyVariation?.jan || 0}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Febrero</TableCell>
                        <TableCell>{stats?.monthlyPrescriptions?.feb || 0}</TableCell>
                        <TableCell className="text-green-600">+{stats?.monthlyVariation?.feb || 0}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Marzo</TableCell>
                        <TableCell>{stats?.monthlyPrescriptions?.mar || 0}</TableCell>
                        <TableCell className="text-green-600">+{stats?.monthlyVariation?.mar || 0}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prescripciones Totales por Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>% del Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.userPrescriptions?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.total}</TableCell>
                          <TableCell>{user.percentage}%</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500">
                            No hay datos disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administra las cuentas de usuario del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={filters.search}
                      onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                      className="max-w-sm"
                    />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Crear Usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                          Ingresa los detalles del nuevo usuario
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const userData = {
                          fullName: formData.get('fullName'),
                          email: formData.get('email'),
                          password: formData.get('password'),
                          role: formData.get('role'),
                          plan: formData.get('plan'),
                          status: 'active'
                        };

                        fetch('/api/admin/users', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(userData)
                        })
                        .then(response => {
                          if (!response.ok) throw new Error('Error al crear usuario');
                          return response.json();
                        })
                        .then(() => {
                          toast({ title: "Usuario creado correctamente" });
                          (e.target as HTMLFormElement).reset();
                          (document.querySelector('[data-dialog-close]') as HTMLButtonElement)?.click();
                        })
                        .catch(error => {
                          toast({ 
                            title: "Error al crear usuario", 
                            variant: "destructive" 
                          });
                        });
                      }}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre completo</Label>
                            <Input id="fullName" name="fullName" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select name="role" defaultValue="user">
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuario</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="plan">Plan</Label>
                            <Select name="plan" defaultValue="basic">
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Básico</SelectItem>
                                <SelectItem value="pro">Pro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Crear Usuario</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex gap-4 mb-4">
                  <Select
                    value={filters.plan}
                    onValueChange={(value) => setFilters(f => ({ ...f, plan: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los planes</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.plan === "pro" ? "default" : "secondary"}>
                              {user.plan === "pro" ? "Pro" : "Básico"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "success" : "destructive"}>
                              {user.status === "active" ? "Activo" : "Suspendido"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => 
                                updateUserMutation.mutate({ userId: user.id, data: { role: value } })
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuario</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newStatus = user.status === "active" ? "suspended" : "active";
                                  updateUserMutation.mutate({ 
                                    userId: user.id, 
                                    data: { status: newStatus } 
                                  });
                                }}
                              >
                                {user.status === "active" ? "Suspender" : "Activar"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm("¿Estás seguro de eliminar este usuario?")) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Ajusta la configuración general de la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">Activa el modo mantenimiento del sistema</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registro de Usuarios</Label>
                      <p className="text-sm text-muted-foreground">Permite el registro de nuevos usuarios</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apariencia del PDF</CardTitle>
                <CardDescription>
                  Personaliza cómo se verán los documentos PDF generados por todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logo</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                      {localStorage.getItem('pdfLogo') ? (
                        <img 
                          src={localStorage.getItem('pdfLogo')} 
                          alt="Logo PDF" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <PlusCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        Subir logo
                      </Button>
                      {localStorage.getItem('pdfLogo') && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            localStorage.removeItem('pdfLogo');
                            window.location.reload();
                          }}
                        >
                          Eliminar logo
                        </Button>
                      )}
                      <input 
                        type="file" 
                        id="logo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              localStorage.setItem('pdfLogo', reader.result as string);
                              window.location.reload();
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pie de página</h3>
                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Texto del pie de página</Label>
                    <Input 
                      id="footer-text"
                      placeholder="© 2024 MediCina TCM - Sistema Profesional de Medicina China"
                      defaultValue={localStorage.getItem('pdfFooter') || '© 2024 MediCina TCM - Sistema Profesional de Medicina China'}
                      onChange={(e) => {
                        localStorage.setItem('pdfFooter', e.target.value);
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      Este texto aparecerá en el pie de página de todos los PDFs generados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Base de Datos</CardTitle>
                <CardDescription>Administra y mantén la base de datos del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Backup Automático</h3>
                      <p className="text-sm text-muted-foreground">Programa backups automáticos de la base de datos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Frecuencia de backup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Crear Backup Manual</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>Gestiona la seguridad del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Autenticación de dos factores</Label>
                      <p className="text-sm text-muted-foreground">Requerir 2FA para todos los administradores</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bloqueo de IP</Label>
                      <p className="text-sm text-muted-foreground">Bloquear IPs después de intentos fallidos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>Gestiona las notificaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Enviar notificaciones por correo</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">Activar notificaciones push</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}