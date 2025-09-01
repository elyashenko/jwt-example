import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { logAuthentication } from './middleware/auth';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для логирования
app.use(logAuthentication);

// Middleware для CORS (в продакшене настройте более строго)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Маршруты
app.use('/api/auth', authRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'JWT TypeScript API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      register: '/api/auth/register',
      login: '/api/auth/login',
      profile: '/api/auth/profile',
      refresh: '/api/auth/refresh-token',
      logout: '/api/auth/logout'
    }
  });
});

// Middleware для обработки 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Middleware для обработки ошибок
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});

export default app;
