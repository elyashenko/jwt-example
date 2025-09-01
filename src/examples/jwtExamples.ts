import { jwtService } from '../utils/jwt';
import { passwordService } from '../utils/password';

/**
 * Примеры работы с JWT токенами
 */
export class JWTExamples {
  
  /**
   * Демонстрация создания и проверки JWT токена
   */
  static demonstrateBasicJWT(): void {
    console.log('\n🔐 === Basic JWT Example ===');
    
    // Создаем payload для токена
    const payload = {
      userId: 'user123',
      email: 'user@example.com',
      role: 'user'
    };

    // Генерируем токен
    const token = jwtService.generateAccessToken(payload);
    console.log('Generated JWT Token:', token);

    // Проверяем токен
    try {
      const verified = jwtService.verifyAccessToken(token);
      console.log('Verified Payload:', verified);
    } catch (error) {
      console.error('Token verification failed:', error);
    }

    // Декодируем токен без проверки подписи
    const decoded = jwtService.decodeToken(token);
    console.log('Decoded Token (without verification):', decoded);
  }

  /**
   * Демонстрация refresh токенов
   */
  static demonstrateRefreshTokens(): void {
    console.log('\n🔄 === Refresh Token Example ===');
    
    const userId = 'user123';
    const tokenId = 'token456';

    // Генерируем refresh токен
    const refreshToken = jwtService.generateRefreshToken(userId, tokenId);
    console.log('Generated Refresh Token:', refreshToken);

    // Проверяем refresh токен
    try {
      const verified = jwtService.verifyRefreshToken(refreshToken);
      console.log('Verified Refresh Token Payload:', verified);
    } catch (error) {
      console.error('Refresh token verification failed:', error);
    }
  }

  /**
   * Демонстрация проверки истечения токена
   */
  static demonstrateTokenExpiration(): void {
    console.log('\n⏰ === Token Expiration Example ===');
    
    // Создаем токен с коротким временем жизни (1 секунда)
    const payload = {
      userId: 'user123',
      email: 'user@example.com',
      role: 'user'
    };

    const shortLivedToken = jwtService.generateAccessToken(payload);
    console.log('Short-lived token created');

    // Проверяем время истечения
    const expirationTime = jwtService.getTokenExpirationTime(shortLivedToken);
    console.log('Token expires at:', expirationTime);

    // Проверяем, истек ли токен
    const isExpired = jwtService.isTokenExpired(shortLivedToken);
    console.log('Is token expired?', isExpired);
  }

  /**
   * Демонстрация работы с паролями
   */
  static async demonstratePasswordHandling(): Promise<void> {
    console.log('\n🔒 === Password Handling Example ===');
    
    const password = 'MySecurePassword123!';
    
    // Проверяем сложность пароля
    const validation = passwordService.validatePasswordStrength(password);
    console.log('Password validation:', validation);

    // Хешируем пароль
    const hashedPassword = await passwordService.hashPassword(password);
    console.log('Hashed password:', hashedPassword);

    // Проверяем пароль
    const isMatch = await passwordService.comparePassword(password, hashedPassword);
    console.log('Password matches:', isMatch);

    // Генерируем случайный пароль
    const randomPassword = passwordService.generateRandomPassword(16);
    console.log('Generated random password:', randomPassword);
  }

  /**
   * Демонстрация полного цикла аутентификации
   */
  static demonstrateFullAuthCycle(): void {
    console.log('\n🔄 === Full Authentication Cycle ===');
    
    // 1. Пользователь регистрируется
    console.log('1. User registration');
    const userData = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      role: 'user'
    };

    // 2. Создается JWT токен
    console.log('2. JWT token generation');
    const accessToken = jwtService.generateAccessToken({
      userId: 'newuser123',
      email: userData.email,
      role: userData.role
    });

    // 3. Создается refresh токен
    console.log('3. Refresh token generation');
    const refreshToken = jwtService.generateRefreshToken('newuser123', 'refresh123');

    // 4. Токены отправляются клиенту
    console.log('4. Tokens sent to client');
    console.log('   Access Token:', accessToken.substring(0, 50) + '...');
    console.log('   Refresh Token:', refreshToken.substring(0, 50) + '...');

    // 5. Клиент использует access токен для запросов
    console.log('5. Client uses access token for requests');
    try {
      const verified = jwtService.verifyAccessToken(accessToken);
      console.log('   Token verified successfully:', verified.email);
    } catch (error) {
      console.error('   Token verification failed:', error);
    }

    // 6. При истечении access токена, клиент использует refresh токен
    console.log('6. Client refreshes access token');
    try {
      const refreshPayload = jwtService.verifyRefreshToken(refreshToken);
      console.log('   Refresh token verified:', refreshPayload.userId);
      
      // Генерируем новый access токен
      const newAccessToken = jwtService.generateAccessToken({
        userId: refreshPayload.userId,
        email: userData.email,
        role: userData.role
      });
      console.log('   New access token generated');
    } catch (error) {
      console.error('   Refresh token verification failed:', error);
    }
  }

  /**
   * Запуск всех примеров
   */
  static async runAllExamples(): Promise<void> {
    console.log('🚀 Starting JWT Examples...\n');
    
    try {
      this.demonstrateBasicJWT();
      this.demonstrateRefreshTokens();
      this.demonstrateTokenExpiration();
      await this.demonstratePasswordHandling();
      this.demonstrateFullAuthCycle();
      
      console.log('\n✅ All examples completed successfully!');
    } catch (error) {
      console.error('\n❌ Error running examples:', error);
    }
  }
}

// Экспортируем для использования в других файлах
export default JWTExamples;
