import express from 'express'
import { protect } from '../middleware/auth';
import {
  exportTransactionsCSV,
  exportFinancialReport,
  getExportHistory,
  scheduleExport,
  cancelScheduledExport,
  getExportTemplates,
  createExportTemplate,
  deleteExportTemplate,
  exportBudgetReport,
  exportNetWorthStatement
} from '../controllers/exportController';

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/export/transactions/csv
 * @desc    Export transactions to CSV
 * @access  Private
 * @query   startDate, endDate, type, category, etc.
 */
router.get('/transactions/csv', exportTransactionsCSV);

/**
 * @route   GET /api/export/financial-report
 * @desc    Export comprehensive financial report (PDF/CSV)
 * @access  Private
 * @query   format (csv/pdf), period (monthly/quarterly/yearly)
 */
router.get('/financial-report', exportFinancialReport);

/**
 * @route   GET /api/export/budget-report
 * @desc    Export budget performance report
 * @access  Private
 * @query   period (monthly/quarterly)
 */
router.get('/budget-report', exportBudgetReport);

/**
 * @route   GET /api/export/net-worth
 * @desc    Export net worth statement
 * @access  Private
 * @query   format (csv/pdf)
 */
router.get('/net-worth', exportNetWorthStatement);

/**
 * @route   GET /api/export/history
 * @desc    Get export history for the user
 * @access  Private
 * @query   limit, page
 */
router.get('/history', getExportHistory);

/**
 * @route   GET /api/export/templates
 * @desc    Get saved export templates
 * @access  Private
 */
router.get('/templates', getExportTemplates);

/**
 * @route   POST /api/export/templates
 * @desc    Create a new export template
 * @access  Private
 */
router.post('/templates', createExportTemplate);

/**
 * @route   DELETE /api/export/templates/:id
 * @desc    Delete an export template
 * @access  Private
 */
router.delete('/templates/:id', deleteExportTemplate);

/**
 * @route   POST /api/export/schedule
 * @desc    Schedule automated exports
 * @access  Private
 */
router.post('/schedule', scheduleExport);

/**
 * @route   DELETE /api/export/schedule/:id
 * @desc    Cancel a scheduled export
 * @access  Private
 */
router.delete('/schedule/:id', cancelScheduledExport);

export default router;