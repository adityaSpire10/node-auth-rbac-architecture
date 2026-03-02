const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = Router();

// Public routes (rate limited)
router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.post('/refresh', authLimiter, controller.refreshTokens);
router.post('/logout', controller.logout);

// Protected routes
router.get('/me', authenticate, controller.getMe);
router.post('/logout-all', authenticate, controller.logoutAll);
router.patch('/change-password', authenticate, controller.changePassword);

module.exports = router;
