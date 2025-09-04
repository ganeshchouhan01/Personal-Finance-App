import express from 'express'
import { protect } from '../middleware/auth.js';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
   getRecentTransactions, 

  // bulkCreateTransactions,
  // importTransactions,
  // getTransactionCategories,
  // addTransactionCategory,
  // getRecurringTransactions,
  // updateRecurringTransaction,
  // skipNextRecurrence,
  // cancelRecurringTransaction
} from '../controllers/transactionController.js';
import { validateTransaction, validateObjectId, handleValidationErrors } from '../middleware/validation.js';
// const upload from '../middleware/upload');

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filtering and pagination
 * @access  Private
 * @query   page, limit, type, category, startDate, endDate, etc.
 */
router.get('/', getTransactions);


/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/stats', getTransactionStats);

/**
 * @route   GET /api/transactions/categories
 * @desc    Get all transaction categories
 * @access  Private
 */
// router.get('/categories', getTransactionCategories);

/**
 * @route   GET /api/transactions/recurring
 * @desc    Get all recurring transactions
 * @access  Private
 */
// router.get('/recurring', getRecurringTransactions);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction
 * @access  Private
 */
router.get('/:id', validateObjectId, getTransaction);

router.get('/recent', getRecentTransactions);
/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post('/', validateTransaction, handleValidationErrors, createTransaction);

/**
 * @route   POST /api/transactions/bulk
 * @desc    Create multiple transactions at once
 * @access  Private
 */
// router.post('/bulk', bulkCreateTransactions);

/**
 * @route   POST /api/transactions/import
 * @desc    Import transactions from file
 * @access  Private
 */
// router.post('/import', upload.single('file'), importTransactions);

/**
 * @route   POST /api/transactions/categories
 * @desc    Add new transaction category
 * @access  Private
 */
// router.post('/categories', addTransactionCategory);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.put('/:id', validateObjectId, validateTransaction, handleValidationErrors, updateTransaction);

/**
 * @route   PUT /api/transactions/recurring/:id
 * @desc    Update recurring transaction settings
 * @access  Private
 */
// router.put('/recurring/:id', validateObjectId, updateRecurringTransaction);

/**
 * @route   POST /api/transactions/recurring/:id/skip
 * @desc    Skip next occurrence of recurring transaction
 * @access  Private
 */
// router.post('/recurring/:id/skip', validateObjectId, skipNextRecurrence);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Private
 */
router.delete('/:id', validateObjectId, deleteTransaction);

/**
 * @route   DELETE /api/transactions/recurring/:id
 * @desc    Cancel recurring transaction
 * @access  Private
 */
// router.delete('/recurring/:id', validateObjectId, cancelRecurringTransaction);


export default router;