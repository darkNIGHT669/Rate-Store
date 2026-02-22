const { body } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const nameRules = () =>
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters');

const emailRules = () =>
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address');

const addressRules = () =>
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must be at most 400 characters');

const passwordRules = () =>
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8–16 characters')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain at least one uppercase letter and one special character'
    );

const newPasswordRules = () =>
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8–16 characters')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain at least one uppercase letter and one special character'
    );

const roleRules = () =>
  body('role')
    .optional()
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be one of: admin, user, store_owner');

const ratingValueRules = () =>
  body('value')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5');

module.exports = {
  registerRules: [nameRules(), emailRules(), addressRules(), passwordRules()],
  loginRules: [
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  createUserRules: [nameRules(), emailRules(), addressRules(), passwordRules(), roleRules()],
  createStoreRules: [
    nameRules(),
    emailRules(),
    addressRules(),
    body('ownerId').optional({ nullable: true }).isUUID().withMessage('Invalid owner ID'),
  ],
  updatePasswordRules: [newPasswordRules()],
  submitRatingRules: [
    body('storeId').isUUID().withMessage('Valid store ID required'),
    ratingValueRules(),
  ],
};
