import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Clave secreta para JWT (debe estar en variables de entorno en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'medicina-china-secret-key';

// Extender la interfaz Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware para verificar si el usuario está autenticado
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token de las cookies o del header Authorization
    const token = req.cookies.auth_token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Verificar que el token tenga la información necesaria
    if (!decoded || !decoded.role) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Asignar el usuario decodificado al request
    req.user = decoded;

    if (!decoded.role) {
      return res.status(403).json({ message: 'Tu cuenta tiene permisos insuficientes' });
    }

    next();

  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para verificar si el usuario tiene un rol específico
 */
export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
    }

    next();
  };
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies.token;
  const headerToken = req.headers.authorization?.split(' ')[1];
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};