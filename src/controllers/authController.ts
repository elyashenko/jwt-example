import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { CreateUserRequest, LoginRequest, ApiResponse } from '../types';

export class AuthController {
  /**
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      // Валидация входных данных
      if (!userData.email || !userData.password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      // Проверка формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      const user = await userService.register(userData);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: user
      };

      res.status(201).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Аутентификация пользователя
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;

      // Валидация входных данных
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      const authResponse = await userService.login(loginData);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: authResponse
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      res.status(401).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Обновление access токена
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
        return;
      }

      const { accessToken } = await userService.refreshAccessToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken }
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      res.status(401).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Выход пользователя
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
        return;
      }

      await userService.logout(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    } catch (_) {
      // При выходе игнорируем ошибки
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    }
  }

  /**
   * Получение профиля текущего пользователя
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const user = await userService.getProfile(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get profile';
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const updates = req.body;
      const user = await userService.updateProfile(req.user.userId, updates);

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: user
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
        return;
      }

      await userService.changePassword(req.user.userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  }
}

export const authController = new AuthController();
