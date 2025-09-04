import express from 'express'
import { protect } from '../middleware/auth.js';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  checkBudgetStatus,
  getBudgetPerformance,
  bulkUpdateBudgets,
  copyBudgetToNewPeriod,
  getBudgetSuggestions,
  toggleBudgetActiveStatus
} from '../controllers/budgetController.js';
import { validateBudget, validateObjectId, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets for the user
 * @access  Private
 * @query   isActive (true/false), period (weekly/monthly/etc.)
 */
router.get('/', getBudgets);

/**
 * @route   GET /api/budgets/alerts
 * @desc    Get current budget alerts and notifications
 * @access  Private
 */
router.get('/alerts', getBudgetAlerts);

/**
 * @route   GET /api/budgets/suggestions
 * @desc    Get budget suggestions based on spending patterns
 * @access  Private
 */
router.get('/suggestions', getBudgetSuggestions);

/**
 * @route   GET /api/budgets/performance
 * @desc    Get budget performance overview
 * @access  Private
 * @query   period (current/last/monthly)
 */
router.get('/performance', getBudgetPerformance);

/**
 * @route   GET /api/budgets/:id
 * @desc    Get single budget by ID
 * @access  Private
 */
router.get('/:id', validateObjectId, getBudget);

/**
 * @route   GET /api/budgets/category/:category/status
 * @desc    Check budget status for a specific category
 * @access  Private
 */
router.get('/category/:category/status', checkBudgetStatus);

/**
 * @route   POST /api/budgets
 * @desc    Create a new budget
 * @access  Private
 */
router.post('/', validateBudget, handleValidationErrors, createBudget);

/**
 * @route   POST /api/budgets/bulk
 * @desc    Create or update multiple budgets at once
 * @access  Private
 */
router.post('/bulk', bulkUpdateBudgets);

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update a budget
 * @access  Private
 */
router.put('/:id', validateObjectId, validateBudget, handleValidationErrors, updateBudget);

/**
 * @route   PUT /api/budgets/:id/toggle-active
 * @desc    Toggle budget active status
 * @access  Private
 */
router.put('/:id/toggle-active', validateObjectId, toggleBudgetActiveStatus);

/**
 * @route   POST /api/budgets/:id/copy
 * @desc    Copy budget to a new period
 * @access  Private
 */
router.post('/:id/copy', validateObjectId, copyBudgetToNewPeriod);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Private
 */
router.delete('/:id', validateObjectId, deleteBudget);

export default router;