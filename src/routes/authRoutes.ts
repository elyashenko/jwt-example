import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Публичные маршруты (не требуют аутентификации)
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Защищенные маршруты (требуют аутентификации)
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));
router.put('/change-password', authenticateToken, authController.changePassword.bind(authController));

// Административные маршруты (требуют роль admin)
router.get('/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    data: { message: 'This is an admin-only endpoint' }
  });
});

export default router;
