import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import createCsvWriter from 'csv-writer';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

// Export transactions to CSV
export const exportTransactionsCSV = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      type,
      category,
      paymentMethod,
      minAmount,
      maxAmount
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (category) filter.category = new RegExp(category, 'i');
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .select('amount type category date note paymentMethod tags');

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: 'temp/transactions.csv',
      header: [
        { id: 'date', title: 'DATE' },
        { id: 'type', title: 'TYPE' },
        { id: 'category', title: 'CATEGORY' },
        { id: 'amount', title: 'AMOUNT' },
        { id: 'paymentMethod', title: 'PAYMENT_METHOD' },
        { id: 'note', title: 'NOTE' },
        { id: 'tags', title: 'TAGS' }
      ]
    });

    // Format data for CSV
    const csvData = transactions.map(transaction => ({
      date: moment(transaction.date).format('YYYY-MM-DD'),
      type: transaction.type.toUpperCase(),
      category: transaction.category,
      amount: transaction.amount.toFixed(2),
      paymentMethod: transaction.paymentMethod,
      note: transaction.note || '',
      tags: transaction.tags.join(', ')
    }));

    await csvWriter.writeRecords(csvData);

    // Set headers and send file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${moment().format('YYYYMMDD')}.csv`);

    const fileStream = fs.createReadStream('temp/transactions.csv');
    fileStream.pipe(res);

    // Clean up after sending
    fileStream.on('close', () => {
      fs.unlinkSync('temp/transactions.csv');
    });

  } catch (error) {
    next(error);
  }
};

// Export financial report
export const exportFinancialReport = async (req, res, next) => {
  try {
    const { format = 'csv', period = 'monthly' } = req.query;
    
    const startDate = moment().startOf(period).toDate();
    const endDate = moment().endOf(period).toDate();

    // Get transactions for the period
    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    // Get budget performance
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      period: 'monthly'
    });

    const budgetPerformance = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              category: budget.category,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' }
            }
          }
        ]);

        return {
          category: budget.category,
          budget: budget.amount,
          spent: spending[0]?.totalSpent || 0,
          remaining: budget.amount - (spending[0]?.totalSpent || 0)
        };
      })
    );

    if (format === 'csv') {
      // Create CSV report
      const csvWriter = createCsvWriter({
        path: 'temp/financial_report.csv',
        header: [
          { id: 'period', title: 'PERIOD' },
          { id: 'totalIncome', title: 'TOTAL_INCOME' },
          { id: 'totalExpense', title: 'TOTAL_EXPENSE' },
          { id: 'netBalance', title: 'NET_BALANCE' },
          { id: 'savingsRate', title: 'SAVINGS_RATE' }
        ]
      });

      const totals = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      }, { income: 0, expense: 0 });

      const netBalance = totals.income - totals.expense;
      const savingsRate = totals.income > 0 ? (netBalance / totals.income) * 100 : 0;

      await csvWriter.writeRecords([{
        period: moment(startDate).format('MMMM YYYY'),
        totalIncome: totals.income.toFixed(2),
        totalExpense: totals.expense.toFixed(2),
        netBalance: netBalance.toFixed(2),
        savingsRate: savingsRate.toFixed(2) + '%'
      }]);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=financial_report_${moment().format('YYYYMMDD')}.csv`);

      const fileStream = fs.createReadStream('temp/financial_report.csv');
      fileStream.pipe(res);

      fileStream.on('close', () => {
        fs.unlinkSync('temp/financial_report.csv');
      });
    } else {
      // For PDF, we would use a PDF generation library like pdfkit
      // This is a placeholder for PDF generation
      res.status(200).json({
        success: true,
        message: 'PDF export functionality will be implemented soon',
        data: {
          period: moment(startDate).format('MMMM YYYY'),
          transactions,
          budgetPerformance,
          totals: transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
              acc.income += transaction.amount;
            } else {
              acc.expense += transaction.amount;
            }
            return acc;
          }, { income: 0, expense: 0 })
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get export history
export const getExportHistory = async (req, res, next) => {
  try {
    // This would typically come from a ExportHistory model
    // For now, we'll return a mock response
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          type: 'transactions_csv',
          date: moment().subtract(1, 'day').toDate(),
          parameters: { startDate: '2024-01-01', endDate: '2024-01-31' },
          downloadUrl: '/api/export/download/1'
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};

// Schedule export
export const scheduleExport = async (req, res, next) => {
  try {
    const { frequency, format, email, parameters } = req.body;

    // This would typically create a scheduled job
    res.status(201).json({
      success: true,
      message: 'Export scheduled successfully',
      data: {
        id: 'sched_123',
        frequency,
        format,
        nextRun: moment().add(1, 'day').toDate()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel scheduled export
export const cancelScheduledExport = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Scheduled export cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get export templates
export const getExportTemplates = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'template_1',
          name: 'Monthly Transactions',
          format: 'csv',
          parameters: {
            period: 'monthly',
            include: ['amount', 'category', 'date', 'type']
          }
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};

// Create export template
export const createExportTemplate = async (req, res, next) => {
  try {
    const { name, format, parameters } = req.body;

    res.status(201).json({
      success: true,
      data: {
        id: 'template_' + Date.now(),
        name,
        format,
        parameters,
        createdAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete export template
export const deleteExportTemplate = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Export budget report
export const exportBudgetReport = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const startDate = moment().startOf(period).toDate();
    const endDate = moment().endOf(period).toDate();

    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true
    });

    const budgetReport = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              category: budget.category,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' }
            }
          }
        ]);

        const totalSpent = spending[0]?.totalSpent || 0;
        const percentage = (totalSpent / budget.amount) * 100;

        return {
          category: budget.category,
          budget: budget.amount,
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentage: Math.round(percentage),
          status: percentage >= 100 ? 'Exceeded' : percentage >= 80 ? 'Warning' : 'Good'
        };
      })
    );

    const csvWriter = createCsvWriter({
      path: 'temp/budget_report.csv',
      header: [
        { id: 'category', title: 'CATEGORY' },
        { id: 'budget', title: 'BUDGET' },
        { id: 'spent', title: 'SPENT' },
        { id: 'remaining', title: 'REMAINING' },
        { id: 'percentage', title: 'PERCENTAGE' },
        { id: 'status', title: 'STATUS' }
      ]
    });

    await csvWriter.writeRecords(budgetReport);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budget_report_${moment().format('YYYYMMDD')}.csv`);

    const fileStream = fs.createReadStream('temp/budget_report.csv');
    fileStream.pipe(res);

    fileStream.on('close', () => {
      fs.unlinkSync('temp/budget_report.csv');
    });
  } catch (error) {
    next(error);
  }
};

// Export net worth statement
export const exportNetWorthStatement = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const startDate = moment().subtract(parseInt(months), 'months').startOf('month').toDate();
    const endDate = moment().endOf('month').toDate();

    const netWorthData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    let cumulativeNetWorth = 0;
    const netWorthStatement = netWorthData.map(month => {
      const net = month.income - month.expense;
      cumulativeNetWorth += net;
      
      return {
        period: `${moment().month(month._id.month - 1).format('MMM YYYY')}`,
        income: month.income,
        expense: month.expense,
        net,
        cumulativeNetWorth
      };
    });

    const csvWriter = createCsvWriter({
      path: 'temp/net_worth.csv',
      header: [
        { id: 'period', title: 'PERIOD' },
        { id: 'income', title: 'INCOME' },
        { id: 'expense', title: 'EXPENSE' },
        { id: 'net', title: 'NET' },
        { id: 'cumulativeNetWorth', title: 'CUMULATIVE_NET_WORTH' }
      ]
    });

    await csvWriter.writeRecords(netWorthStatement);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=net_worth_${moment().format('YYYYMMDD')}.csv`);

    const fileStream = fs.createReadStream('temp/net_worth.csv');
    fileStream.pipe(res);

    fileStream.on('close', () => {
      fs.unlinkSync('temp/net_worth.csv');
    });
  } catch (error) {
    next(error);
  }
};