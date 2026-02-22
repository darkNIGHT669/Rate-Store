const router = require('express').Router();
const ctrl   = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require admin
router.use(authenticate, authorize('admin'));

router.get('/',       ctrl.getAll);
router.get('/stats',  ctrl.getStats);
router.get('/:id',    ctrl.getOne);

module.exports = router;
