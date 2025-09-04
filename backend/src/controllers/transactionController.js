import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { checkBudgetAlerts } from '../utils/notifications.js';

// Get all transactions with filtering, sorting, and pagination
export const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      paymentMethod,
      search
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    
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
    
    if (search) {
      filter.$or = [
        { note: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// Get single transaction
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Create new transaction
export const createTransaction = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const transaction = await Transaction.create(req.body);

    // Check for budget alerts
    if (transaction.type === 'expense') {
      await checkBudgetAlerts(req.user.id, transaction.category, transaction.amount, transaction.date);
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Update transaction
export const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this transaction'
      });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = { user: req.user._id };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const income = stats.find(s => s._id === 'income') || { totalAmount: 0, count: 0, averageAmount: 0 };
    const expense = stats.find(s => s._id === 'expense') || { totalAmount: 0, count: 0, averageAmount: 0 };
    
    const netBalance = income.totalAmount - expense.totalAmount;

    res.status(200).json({
      success: true,
      data: {
        income: income.totalAmount,
        expense: expense.totalAmount,
        netBalance,
        transactionCount: income.count + expense.count,
        averageIncome: income.averageAmount,
        averageExpense: expense.averageAmount
      }
    });
  } catch (error) {
    next(error);
  }
};
// src/controllers/transactionController.js

// Get recent transactions
export const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const recentTransactions = await Transaction.find({
      user: req.user._id
    })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .select('type amount category date description paymentMethod');
    
    res.status(200).json({
      success: true,
      data: recentTransactions
    });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent transactions'
    });
  }
};

// Helper function to get week number
const getWeek = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};