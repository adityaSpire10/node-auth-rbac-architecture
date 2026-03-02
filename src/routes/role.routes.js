const { Router } = require('express');
const controller = require('../controllers/role.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'moderator'), controller.listRoles);
router.get('/:id', authorize('admin', 'moderator'), controller.getRoleById);
router.post('/', authorize('admin'), controller.createRole);
router.put('/:id', authorize('admin'), controller.updateRole);
router.delete('/:id', authorize('admin'), controller.deleteRole);

module.exports = router;
