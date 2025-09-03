import express from 'express'
import { protect } from '../middleware/auth.js';
import {
  getMonthlySummary,
  getCategorySpending,
  getSpendingTrends,
  getFinancialHealth,
  getYearlyOverview,
  getTopExpenses,
  getIncomeVsExpense,
  getCashFlowAnalysis,
  getNetWorthTrend,
  getCustomReport
} from '../controllers/analyticsController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/analytics/monthly-summary
 * @desc    Get monthly income, expenses, and category breakdown
 * @access  Private
 * @query   year, month (e.g., year=2024, month=1)
 */
router.get('/monthly-summary', getMonthlySummary);

/**
 * @route   GET /api/analytics/category-spending
 * @desc    Get category-wise spending breakdown
 * @access  Private
 * @query   startDate, endDate, type (income/expense)
 */
router.get('/category-spending', getCategorySpending);

/**
 * @route   GET /api/analytics/spending-trends
 * @desc    Get spending trends over time
 * @access  Private
 * @query   months (number of months to analyze), type (income/expense)
 */
router.get('/spending-trends', getSpendingTrends);

/**
 * @route   GET /api/analytics/financial-health
 * @desc    Get financial health metrics and comparisons
 * @access  Private
 */
router.get('/financial-health', getFinancialHealth);

/**
 * @route   GET /api/analytics/yearly-overview
 * @desc    Get yearly financial overview
 * @access  Private
 * @query   year (default: current year)
 */
router.get('/yearly-overview', getYearlyOverview);

/**
 * @route   GET /api/analytics/top-expenses
 * @desc    Get top expenses by amount
 * @access  Private
 * @query   limit (default: 10), startDate, endDate
 */
router.get('/top-expenses', getTopExpenses);

/**
 * @route   GET /api/analytics/income-vs-expense
 * @desc    Get income vs expense comparison
 * @access  Private
 * @query   period (monthly/quarterly/yearly), months (default: 12)
 */
router.get('/income-vs-expense', getIncomeVsExpense);

/**
 * @route   GET /api/analytics/cash-flow
 * @desc    Get cash flow analysis
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/cash-flow', getCashFlowAnalysis);

/**
 * @route   GET /api/analytics/net-worth
 * @desc    Get net worth trend over time
 * @access  Private
 * @query   months (default: 12)
 */
router.get('/net-worth', getNetWorthTrend);

/**
 * @route   POST /api/analytics/custom-report
 * @desc    Generate custom financial report
 * @access  Private
 * @body    { metrics: [], period: {}, filters: {} }
 */
router.post('/custom-report', getCustomReport);

export default router;
