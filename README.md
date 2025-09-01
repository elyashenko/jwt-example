# JWT TypeScript Project 🚀

Полноценный проект для изучения работы с JWT (JSON Web Tokens) на TypeScript с использованием Express.js.

## 🎯 Что вы изучите

- **JWT токены**: создание, проверка, обновление
- **Аутентификация**: регистрация, вход, выход пользователей
- **Безопасность**: хеширование паролей, валидация
- **Middleware**: проверка токенов, роли, права доступа
- **TypeScript**: строгая типизация, интерфейсы, классы
- **API**: RESTful endpoints с Express.js
- **Тестирование**: Jest тесты для всех компонентов

## 🏗️ Архитектура проекта

```
src/
├── types/           # TypeScript интерфейсы и типы
├── utils/           # Утилиты для JWT и паролей
├── middleware/      # Express middleware
├── services/        # Бизнес-логика
├── controllers/     # HTTP контроллеры
├── routes/          # API маршруты
├── examples/        # Примеры использования
├── __tests__/       # Тесты
├── app.ts           # Основное приложение
└── index.ts         # Точка входа
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте файл `env.example` в `.env` и настройте секреты:

```bash
cp env.example .env
```

Отредактируйте `.env` файл:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Запуск проекта

**Режим разработки:**
```bash
npm run dev
```

**Продакшн сборка:**
```bash
npm run build
npm start
```

**Запуск тестов:**
```bash
npm test
```

## 📚 API Endpoints

### Аутентификация

| Метод | Endpoint | Описание | Аутентификация |
|-------|----------|----------|----------------|
| POST | `/api/auth/register` | Регистрация пользователя | ❌ |
| POST | `/api/auth/login` | Вход пользователя | ❌ |
| POST | `/api/auth/refresh-token` | Обновление токена | ❌ |
| POST | `/api/auth/logout` | Выход пользователя | ❌ |
| GET | `/api/auth/profile` | Профиль пользователя | ✅ |
| PUT | `/api/auth/profile` | Обновление профиля | ✅ |
| PUT | `/api/auth/change-password` | Смена пароля | ✅ |
| GET | `/api/auth/admin/users` | Админ панель | ✅ (admin) |

### Примеры использования

#### Регистрация пользователя

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'
```

#### Вход пользователя

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Доступ к защищенному ресурсу

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Обновление токена

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 🔐 JWT Токены

### Access Token
- **Назначение**: Доступ к защищенным ресурсам
- **Время жизни**: 24 часа (настраивается)
- **Содержимое**: userId, email, role, iat, exp

### Refresh Token
- **Назначение**: Обновление access токена
- **Время жизни**: 7 дней (настраивается)
- **Содержимое**: userId, tokenId, iat, exp

### Структура токена

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJ1c2VyMTIzIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.
SIGNATURE
```

## 🛡️ Безопасность

### Пароли
- Минимум 8 символов
- Заглавные и строчные буквы
- Цифры
- Специальные символы
- Хеширование с bcrypt (12 раундов)

### JWT
- Подпись с секретным ключом
- Проверка issuer и audience
- Время жизни токенов
- Refresh token механизм

### Middleware
- Проверка аутентификации
- Ролевая модель доступа
- Логирование запросов
- CORS настройки

## 🧪 Тестирование

Проект включает полный набор тестов:

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск тестов в watch режиме
npm run test:watch
```

### Тестируемые компоненты
- JWT сервис (создание, проверка, декодирование)
- Сервис паролей (хеширование, валидация)
- Middleware аутентификации
- API endpoints

## 📖 Примеры кода

### Создание JWT токена

```typescript
import { jwtService } from './utils/jwt';

const payload = {
  userId: 'user123',
  email: 'user@example.com',
  role: 'user'
};

const token = jwtService.generateAccessToken(payload);
```

### Проверка токена

```typescript
try {
  const verified = jwtService.verifyAccessToken(token);
  console.log('User ID:', verified.userId);
  console.log('Role:', verified.role);
} catch (error) {
  console.error('Invalid token:', error.message);
}
```

### Хеширование пароля

```typescript
import { passwordService } from './utils/password';

const hashedPassword = await passwordService.hashPassword('MyPassword123!');
const isValid = await passwordService.comparePassword('MyPassword123!', hashedPassword);
```

### Middleware аутентификации

```typescript
import { authenticateToken, requireRole } from './middleware/auth';

// Требует аутентификации
router.get('/profile', authenticateToken, getProfile);

// Требует роль admin
router.get('/admin', authenticateToken, requireRole('admin'), adminPanel);
```

## 🔧 Настройка и кастомизация

### Изменение времени жизни токенов

```typescript
// В .env файле
JWT_EXPIRES_IN=1h        // 1 час
JWT_REFRESH_EXPIRES_IN=30d  // 30 дней
```

### Добавление новых ролей

```typescript
// В types/index.ts
export type UserRole = 'user' | 'admin' | 'moderator' | 'premium';

// В middleware/auth.ts
export const requireRole = (roles: UserRole | UserRole[]) => {
  // ... логика проверки ролей
};
```

### Кастомизация JWT payload

```typescript
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions?: string[];
  customField?: any;
  iat?: number;
  exp?: number;
}
```

## 🚨 Важные замечания

### Безопасность
- **НИКОГДА** не храните секретные ключи в коде
- Используйте сильные секреты (минимум 32 символа)
- В продакшене используйте HTTPS
- Ограничьте CORS настройки

### Производительность
- JWT токены увеличивают размер запросов
- Храните минимально необходимые данные в токене
- Используйте refresh токены для длительных сессий

### Масштабирование
- В продакшене используйте Redis для хранения refresh токенов
- Рассмотрите использование JWT blacklist для logout
- Мониторьте размер JWT токенов

## 📚 Дополнительные ресурсы

- [JWT.io](https://jwt.io/) - Интерактивная отладка JWT
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT спецификация
- [Express.js](https://expressjs.com/) - Веб-фреймворк
- [TypeScript](https://www.typescriptlang.org/) - Типизированный JavaScript

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](../../issues) на GitHub
2. Создайте новое issue с описанием проблемы
3. Опишите шаги для воспроизведения
4. Приложите логи и примеры кода

---

**Удачного изучения JWT! 🎉**
