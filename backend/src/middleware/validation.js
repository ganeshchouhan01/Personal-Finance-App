import { body, validationResult, param } from 'express-validator';
import User from '../models/User.js';

// Check for validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('Email already in use');
      }
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Transaction validation
export const validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit card', 'debit card', 'bank transfer', 'digital wallet', 'other'])
    .withMessage('Invalid payment method')
];

// Budget validation
export const validateBudget = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('period')
    .optional()
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid period')
];

// ObjectId validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];