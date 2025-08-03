import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { ZodError } from 'zod';

/**
 * Obtener todos los usuarios (solo administradores)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Obtener parámetros de paginación y filtrado
    const { page = '1', limit = '10', role, status, search } = req.query as { 
      page?: string; 
      limit?: string; 
      role?: string;
      status?: string;
      search?: string;
    };
    
    // Convertir a números
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    
    // Validar que sean números positivos
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ message: 'Los parámetros de paginación deben ser números positivos' });
    }
    
    // Obtener todos los usuarios
    const allUsers = await storage.getAllUsers();
    
    // Aplicar filtros si hay
    let filteredUsers = allUsers;
    
    // Filtrar por rol si se especifica
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Filtrar por estado si se especifica
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    // Filtrar por búsqueda en email o nombre completo
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower) || 
        user.fullName.toLowerCase().includes(searchLower)
      );
    }
    
    // Calcular paginación
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    
    // Obtener los usuarios paginados
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Crear respuesta con metadatos de paginación
    return res.status(200).json({
      totalUsers: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limitNumber),
      currentPage: pageNumber,
      users: paginatedUsers.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        plan: user.plan,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }))
    });
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Obtener un usuario por ID (solo administradores)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Enviar datos del usuario sin la contraseña
    return res.status(200).json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      plan: user.plan,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    });
    
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Actualizar un usuario (solo administradores)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Solo permitir actualizar ciertos campos
    const { fullName, email, role, status, plan } = req.body;
    
    const updates: any = {};
    
    if (fullName !== undefined) updates.fullName = fullName;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (plan !== undefined) updates.plan = plan;
    
    // Verificar si se está cambiando el email y si ya existe
    if (email && email !== user.email) {
      const existingUserWithEmail = await storage.getUserByEmail(email);
      if (existingUserWithEmail) {
        return res.status(400).json({ message: 'El email ya está en uso por otro usuario' });
      }
    }
    
    // Actualizar usuario
    const updatedUser = await storage.updateUser(userId, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'No se pudo actualizar el usuario' });
    }
    
    return res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        status: updatedUser.status,
        plan: updatedUser.plan,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt
      }
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Eliminar un usuario (solo administradores)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    // Verificar si el usuario existe
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // No permitir eliminar al administrador principal (ID 1)
    if (userId === 1) {
      return res.status(403).json({ message: 'No se puede eliminar al administrador principal' });
    }
    
    // Eliminar usuario
    const deleted = await storage.deleteUser(userId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'No se pudo eliminar el usuario' });
    }
    
    return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Obtener estadísticas (solo administradores)
 */
export const getStats = async (_req: Request, res: Response) => {
  try {
    const allUsers = await storage.getAllUsers();
    
    // Contar usuarios por rol
    const usersByRole = {
      admin: allUsers.filter(user => user.role === 'admin').length,
      user: allUsers.filter(user => user.role === 'user').length
    };
    
    // Contar usuarios por estado
    const usersByStatus = {
      active: allUsers.filter(user => user.status === 'active').length,
      inactive: allUsers.filter(user => user.status === 'inactive').length,
      suspended: allUsers.filter(user => user.status === 'suspended').length
    };
    
    // Contar usuarios por plan
    const usersByPlan = {
      basic: allUsers.filter(user => user.plan === 'basic').length,
      premium: allUsers.filter(user => user.plan === 'premium').length,
      enterprise: allUsers.filter(user => user.plan === 'enterprise').length
    };
    
    // Obtener últimos 5 usuarios registrados
    const recentUsers = [...allUsers]
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }));
    
    return res.status(200).json({
      totalUsers: allUsers.length,
      usersByRole,
      usersByStatus,
      usersByPlan,
      recentUsers
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Forzar restablecimiento de contraseña (solo administradores)
 */
export const forcePasswordReset = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Generar token para restablecer contraseña
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    // Establecer fecha de caducidad (24 horas)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 24);
    
    // Actualizar usuario con token
    await storage.updateUser(userId, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });
    
    // En una aplicación real, aquí enviaríamos un email al usuario
    // con el enlace que contiene el token para restablecer contraseña
    
    return res.status(200).json({
      message: 'Se ha iniciado el proceso de restablecimiento de contraseña',
      // Solo para desarrollo, en producción no se devolvería el token
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
    
  } catch (error) {
    console.error('Error al forzar restablecimiento de contraseña:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Crear usuario administrador (solo para desarrollo)
 */
export const createAdminUser = async (req: Request, res: Response) => {
  // Solo permitir en entorno de desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Esta ruta solo está disponible en entorno de desarrollo' });
  }
  
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    
    // Verificar si ya existe un usuario con ese email
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear el usuario administrador
    const adminUser = await storage.createUser({
      email,
      password: hashedPassword,
      fullName,
      role: 'admin',
      status: 'active',
      plan: 'enterprise',
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: null,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    return res.status(201).json({
      message: 'Usuario administrador creado correctamente',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role
      }
    });
    
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};