import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'medicina-china-secret-key';

// Usuarios predefinidos
const predefinedUsers = {
  admin: {
    id: 1,
    email: "admin@example.com",
    username: "admin",
    password: "$2b$10$8nGvtH9qHJ9Qd8bF7F1Hy.r3YX9lKoXX6hGN0Y7xZ9Kj8X7r9Zj.e", // admin123
    fullName: "Administrator",
    role: "admin"
  },
  user: {
    id: 2,
    email: "user@example.com",
    username: "user",
    password: "$2b$10$8nGvtH9qHJ9Qd8bF7F1Hy.r3YX9lKoXX6hGN0Y7xZ9Kj8X7r9Zj.e", // user123
    fullName: "Usuario Terapeuta",
    role: "user"
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    // Verificar si es uno de los usuarios predefinidos
    const user = identifier === 'admin' ? predefinedUsers.admin :
                 identifier === 'user' ? predefinedUsers.user : null;

    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Verificar la contraseña
    const isPasswordValid = identifier === 'admin' && password === 'admin123' ||
                          identifier === 'user' && password === 'user123';

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar token JWT con toda la información necesaria
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        username: user.username,
        fullName: user.fullName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Establecer cookie de autenticación
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    // Enviar respuesta exitosa
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('auth_token');
  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

export const getProfile = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // Retornar el usuario predefinido correspondiente
    const user = req.user.role === 'admin' ? predefinedUsers.admin : predefinedUsers.user;

    return res.status(200).json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      username: user.username
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};