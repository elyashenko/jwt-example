import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types';
import { passwordService } from '../utils/password';
import { jwtService } from '../utils/jwt';

// Имитация базы данных (в реальном проекте здесь была бы БД)
class InMemoryUserStore {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, string> = new Map(); // tokenId -> userId

  async createUser(userData: CreateUserRequest): Promise<User> {
    const id = uuidv4();
    const hashedPassword = await passwordService.hashPassword(userData.password);
    
    const user: User = {
      id,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(id, user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async saveRefreshToken(tokenId: string, userId: string): Promise<void> {
    this.refreshTokens.set(tokenId, userId);
  }

  async removeRefreshToken(tokenId: string): Promise<void> {
    this.refreshTokens.delete(tokenId);
  }

  async validateRefreshToken(tokenId: string): Promise<boolean> {
    return this.refreshTokens.has(tokenId);
  }

  async updateUser(userId: string, user: User): Promise<void> {
    this.users.set(userId, user);
  }
}

const userStore = new InMemoryUserStore();

export class UserService {
  /**
   * Регистрация нового пользователя
   */
  async register(userData: CreateUserRequest): Promise<Omit<User, 'password'>> {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await userStore.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Проверяем сложность пароля
    const passwordValidation = passwordService.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Создаем пользователя
    const user = await userStore.createUser(userData);
    
    // Возвращаем пользователя без пароля
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Аутентификация пользователя
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    // Находим пользователя по email
    const user = await userStore.findUserByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Проверяем пароль
    const isPasswordValid = await passwordService.comparePassword(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Генерируем токены
    const tokenId = uuidv4();
    const accessToken = jwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    const refreshToken = jwtService.generateRefreshToken(user.id, tokenId);

    // Сохраняем refresh токен
    await userStore.saveRefreshToken(tokenId, user.id);

    // Возвращаем ответ
    const { password: _password, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Обновление access токена
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Проверяем refresh токен
      const payload = jwtService.verifyRefreshToken(refreshToken);
      
      // Проверяем, существует ли токен в базе
      const isValidToken = await userStore.validateRefreshToken(payload.tokenId);
      if (!isValidToken) {
        throw new Error('Invalid refresh token');
      }

      // Находим пользователя
      const user = await userStore.findUserById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Генерируем новый access токен
      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return { accessToken };
    } catch (_) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Выход пользователя
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = jwtService.verifyRefreshToken(refreshToken);
      await userStore.removeRefreshToken(payload.tokenId);
    } catch (_) {
      // Игнорируем ошибки при выходе
    }
  }

  /**
   * Получение профиля пользователя
   */
  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await userStore.findUserById(userId);
    if (!user) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'password'>>): Promise<Omit<User, 'password'>> {
    const user = await userStore.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Обновляем поля
    Object.assign(user, updates, { updatedAt: new Date() });
    
    // Сохраняем обновленного пользователя
    userStore.updateUser(userId, user);

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Смена пароля
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userStore.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await passwordService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Проверяем сложность нового пароля
    const passwordValidation = passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Хешируем новый пароль
    const hashedNewPassword = await passwordService.hashPassword(newPassword);
    
    // Обновляем пароль
    user.password = hashedNewPassword;
    user.updatedAt = new Date();
    
    userStore.updateUser(userId, user);
  }
}

export const userService = new UserService();
