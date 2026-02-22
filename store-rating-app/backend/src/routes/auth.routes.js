const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  createUserRules,
  updatePasswordRules,
} = require('../validators/rules');

// Public
router.post('/register', registerRules, validate, ctrl.register);
router.post('/login',    loginRules,    validate, ctrl.login);

// Protected – any logged-in user
router.get('/me',               authenticate, ctrl.me);
router.patch('/password',       authenticate, updatePasswordRules, validate, ctrl.updatePassword);

// Admin only
router.post('/users', authenticate, authorize('admin'), createUserRules, validate, ctrl.createUser);

module.exports = router;
