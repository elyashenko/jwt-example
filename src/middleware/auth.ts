import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../utils/jwt';
import { JWTPayload } from '../types';

// Расширяем интерфейс Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware для проверки JWT токена
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token is required'
    });
    return;
  }

  try {
    const payload = jwtService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (_) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired access token'
    });
  }
};

/**
 * Middleware для проверки роли пользователя
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware для проверки владения ресурсом
 */
export const requireOwnership = (resourceIdField: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
    
    if (!resourceId) {
      res.status(400).json({
        success: false,
        error: 'Resource ID is required'
      });
      return;
    }

    // Проверяем, является ли пользователь владельцем ресурса
    // или имеет роль администратора
    if (req.user.userId !== resourceId && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied to this resource'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware для логирования аутентификации
 */
export const logAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const user = req.user ? req.user.email : 'anonymous';
    
    console.log(`[AUTH] ${req.method} ${req.path} - User: ${user} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
};
