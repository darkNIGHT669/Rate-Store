const router = require('express').Router();
const ctrl   = require('../controllers/ratings.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { submitRatingRules } = require('../validators/rules');

router.post(
  '/',
  authenticate,
  authorize('user'),        // only normal users can rate
  submitRatingRules,
  validate,
  ctrl.submit
);

module.exports = router;
