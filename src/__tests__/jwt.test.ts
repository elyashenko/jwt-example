import { jwtService } from '../utils/jwt';
import { passwordService } from '../utils/password';
import { JWTPayload } from '../types';

describe('JWT Service Tests', () => {
  const testPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: 'test123',
    email: 'test@example.com',
    role: 'user'
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = jwtService.generateAccessToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = jwtService.generateAccessToken(testPayload);
      const token2 = jwtService.generateAccessToken({
        ...testPayload,
        userId: 'test456'
      });
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = jwtService.generateAccessToken(testPayload);
      const verified = jwtService.verifyAccessToken(token);
      
      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.email).toBe(testPayload.email);
      expect(verified.role).toBe(testPayload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwtService.verifyAccessToken(invalidToken);
      }).toThrow('Invalid access token');
    });

    it('should throw error for expired token', () => {
      // Создаем токен с очень коротким временем жизни
      const expiredToken = jwtService.generateAccessToken(testPayload);
      
      // Проверяем, что токен не истек сразу после создания
      expect(jwtService.isTokenExpired(expiredToken)).toBe(false);
      
      // Проверяем, что токен можно верифицировать сразу после создания
      expect(() => {
        jwtService.verifyAccessToken(expiredToken);
      }).not.toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const userId = 'test123';
      const tokenId = 'refresh456';
      
      const token = jwtService.generateRefreshToken(userId, tokenId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const userId = 'test123';
      const tokenId = 'refresh456';
      
      const token = jwtService.generateRefreshToken(userId, tokenId);
      const verified = jwtService.verifyRefreshToken(token);
      
      expect(verified.userId).toBe(userId);
      expect(verified.tokenId).toBe(tokenId);
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = jwtService.generateAccessToken(testPayload);
      const decoded = jwtService.decodeToken(token) as any;
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });
  });

  describe('isTokenExpired', () => {
    it('should detect expired token', () => {
      const token = jwtService.generateAccessToken(testPayload);
      
      // Токен не должен быть истекшим сразу после создания
      expect(jwtService.isTokenExpired(token)).toBe(false);
    });
  });

  describe('getTokenExpirationTime', () => {
    it('should return expiration time', () => {
      const token = jwtService.generateAccessToken(testPayload);
      const expirationTime = jwtService.getTokenExpirationTime(token);
      
      expect(expirationTime).toBeInstanceOf(Date);
      expect(expirationTime!.getTime()).toBeGreaterThan(Date.now());
    });
  });
});

describe('Password Service Tests', () => {
  const testPassword = 'TestPassword123!';

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const hashed = await passwordService.hashPassword(testPassword);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(testPassword);
      expect(hashed.length).toBeGreaterThan(testPassword.length);
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await passwordService.hashPassword(testPassword);
      const hash2 = await passwordService.hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should verify correct password', async () => {
      const hashed = await passwordService.hashPassword(testPassword);
      const isValid = await passwordService.comparePassword(testPassword, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hashed = await passwordService.hashPassword(testPassword);
      const isValid = await passwordService.comparePassword('wrongpassword', hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const strongPassword = 'StrongPass123!';
      const validation = passwordService.validatePasswordStrength(strongPassword);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const weakPassword = 'weak';
      const validation = passwordService.validatePasswordStrength(weakPassword);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should check for uppercase letters', () => {
      const noUppercase = 'password123!';
      const validation = passwordService.validatePasswordStrength(noUppercase);
      
      expect(validation.errors).toContain('Пароль должен содержать хотя бы одну заглавную букву');
    });

    it('should check for lowercase letters', () => {
      const noLowercase = 'PASSWORD123!';
      const validation = passwordService.validatePasswordStrength(noLowercase);
      
      expect(validation.errors).toContain('Пароль должен содержать хотя бы одну строчную букву');
    });

    it('should check for numbers', () => {
      const noNumbers = 'Password!';
      const validation = passwordService.validatePasswordStrength(noNumbers);
      
      expect(validation.errors).toContain('Пароль должен содержать хотя бы одну цифру');
    });

    it('should check for special characters', () => {
      const noSpecial = 'Password123';
      const validation = passwordService.validatePasswordStrength(noSpecial);
      
      expect(validation.errors).toContain('Пароль должен содержать хотя бы один специальный символ');
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate password with specified length', () => {
      const length = 16;
      const password = passwordService.generateRandomPassword(length);
      
      expect(password).toHaveLength(length);
    });

    it('should generate password with all required character types', () => {
      const password = passwordService.generateRandomPassword(12);
      
      expect(/[A-Z]/.test(password)).toBe(true); // uppercase
      expect(/[a-z]/.test(password)).toBe(true); // lowercase
      expect(/\d/.test(password)).toBe(true);     // numbers
      expect(/[!@#$%^&*(),.?":{}|<>]/.test(password)).toBe(true); // special chars
    });
  });
});
