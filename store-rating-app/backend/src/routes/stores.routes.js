const router = require('express').Router();
const ctrl   = require('../controllers/stores.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createStoreRules } = require('../validators/rules');

// All routes require login
router.use(authenticate);

router.post('/',
  authorize('admin'),
  createStoreRules,
  validate,
  ctrl.create
);

router.get('/', ctrl.getAll);

// Owner dashboard – must be placed before /:id to avoid collision
router.get('/my-dashboard', authorize('store_owner'), ctrl.getOwnerDashboard);

router.get('/:id', ctrl.getOne);

module.exports = router;
