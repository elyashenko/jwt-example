import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { JWTPayload, RefreshTokenPayload } from '../types';

export class JWTService {
  private readonly secret: string;
  private readonly refreshSecret: string;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Создает JWT токен доступа
   */
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'jwt-typescript-project',
      audience: 'users'
    };
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Создает refresh токен
   */
  generateRefreshToken(userId: string, tokenId: string): string {
    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'jwt-typescript-project',
      audience: 'users'
    };
    return jwt.sign({ userId, tokenId }, this.refreshSecret, options);
  }

  /**
   * Проверяет JWT токен доступа
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'jwt-typescript-project',
        audience: 'users'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Проверяет refresh токен
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'jwt-typescript-project',
        audience: 'users'
      }) as RefreshTokenPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Декодирует JWT токен без проверки подписи
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Проверяет, истек ли токен
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Получает время истечения токена
   */
  getTokenExpirationTime(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

// Экспортируем экземпляр сервиса
export const jwtService = new JWTService();
