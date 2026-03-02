const { Router } = require('express');
const controller = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorize('admin'), controller.listUsers);
router.patch('/:id/status', authorize('admin'), controller.toggleUserStatus);
router.post('/:id/roles', authorize('admin'), controller.assignRoles);
router.delete('/:id', authorize('admin'), controller.deleteUser);

// Self or admin
router.get('/:id', authorize('admin', 'moderator'), controller.getUserById);
router.patch('/:id', controller.updateUser); // service-layer ownership check

module.exports = router;
