import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function LoginPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier">Usuario o Email</label>
              <Input
                id="identifier"
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData(f => ({ ...f, identifier: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Contraseña</label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta? <Link href="/register" className="text-primary hover:underline">Regístrate</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Error al registrarse");

      toast({
        title: "Registro exitoso",
        description: "Por favor inicia sesión para continuar"
      });

      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el registro",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para comenzar a usar el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName">Nombre Completo</label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Contraseña</label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Registrarse
            </Button>
            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}