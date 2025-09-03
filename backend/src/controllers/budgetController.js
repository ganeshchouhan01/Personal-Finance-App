const Budget from '../models/Budget');
const Transaction from '../models/Transaction');
const moment from 'moment');

// Get all budgets for user
export const getBudgets = async (req, res, next) => {
  try {
    const { isActive, period } = req.query;
    
    const filter = { user: req.user._id };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (period) filter.period = period;

    const budgets = await Budget.find(filter).sort({ category: 1 });

    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = moment().startOf(budget.period).toDate();
        const endDate = moment().endOf(budget.period).toDate();

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
        const remaining = budget.amount - totalSpent;
        const percentageUsed = (totalSpent / budget.amount) * 100;

        return {
          ...budget.toObject(),
          totalSpent,
          remaining,
          percentageUsed: Math.min(100, percentageUsed),
          status: percentageUsed >= 100 ? 'Exceeded' : 
                 percentageUsed >= 80 ? 'Warning' : 'Good'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: budgetsWithSpending
    });
  } catch (error) {
    next(error);
  }
};

// Get single budget
export const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// Create new budget
export const createBudget = async (req, res, next) => {
  try {
    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category: req.body.category,
      period: req.body.period || 'monthly'
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }

    const budget = await Budget.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// Update budget
export const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// Delete budget
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get budget alerts
export const getBudgetAlerts = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      'notifications.enabled': true
    });

    const alerts = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = moment().startOf(budget.period).toDate();
        const endDate = moment().endOf(budget.period).toDate();

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
        const percentageUsed = (totalSpent / budget.amount) * 100;

        if (percentageUsed >= budget.notifications.threshold) {
          return {
            budgetId: budget._id,
            category: budget.category,
            budgetAmount: budget.amount,
            amountSpent: totalSpent,
            percentageUsed: Math.round(percentageUsed),
            remaining: budget.amount - totalSpent,
            alertLevel: percentageUsed >= 100 ? 'danger' : 'warning',
            message: percentageUsed >= 100 ?
              `Budget exceeded for ${budget.category}` :
              `Budget alert: ${Math.round(percentageUsed)}% used for ${budget.category}`
          };
        }

        return null;
      })
    );

    const filteredAlerts = alerts.filter(alert => alert !== null);

    res.status(200).json({
      success: true,
      data: filteredAlerts
    });
  } catch (error) {
    next(error);
  }
};

// Check budget status for specific category
export const checkBudgetStatus = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { period = 'monthly' } = req.query;

    const budget = await Budget.findOne({
      user: req.user._id,
      category,
      period,
      isActive: true
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found for this category'
      });
    }

    const startDate = moment().startOf(period).toDate();
    const endDate = moment().endOf(period).toDate();

    const spending = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          category,
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
    const percentageUsed = (totalSpent / budget.amount) * 100;

    res.status(200).json({
      success: true,
      data: {
        budget: budget.toObject(),
        spending: {
          totalSpent,
          percentageUsed: Math.round(percentageUsed),
          remaining: budget.amount - totalSpent,
          status: percentageUsed >= 100 ? 'Exceeded' : 
                 percentageUsed >= 80 ? 'Warning' : 'Good'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get budget performance
export const getBudgetPerformance = async (req, res, next) => {
  try {
    const { period = 'current' } = req.query;
    
    let startDate, endDate;
    
    switch (period) {
      case 'last':
        startDate = moment().subtract(1, 'month').startOf('month').toDate();
        endDate = moment().subtract(1, 'month').endOf('month').toDate();
        break;
      case 'current':
      default:
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
    }

    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      period: 'monthly'
    });

    const performance = await Promise.all(
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
        const percentageUsed = (totalSpent / budget.amount) * 100;

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          amountSpent: totalSpent,
          percentageUsed: Math.round(percentageUsed),
          remaining: budget.amount - totalSpent,
          status: percentageUsed >= 100 ? 'Exceeded' : 
                 percentageUsed >= 80 ? 'Warning' : 'Good',
          period: moment(startDate).format('MMMM YYYY')
        };
      })
    );

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update budgets
export const bulkUpdateBudgets = async (req, res, next) => {
  try {
    const { budgets } = req.body;

    const operations = budgets.map(budget => ({
      updateOne: {
        filter: {
          user: req.user._id,
          category: budget.category,
          period: budget.period || 'monthly'
        },
        update: { $set: budget },
        upsert: true
      }
    }));

    const result = await Budget.bulkWrite(operations);

    res.status(200).json({
      success: true,
      data: {
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Copy budget to new period
export const copyBudgetToNewPeriod = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to copy this budget'
      });
    }

    const newBudget = await Budget.create({
      ...budget.toObject(),
      _id: undefined,
      startDate: new Date(),
      endDate: null
    });

    res.status(201).json({
      success: true,
      data: newBudget
    });
  } catch (error) {
    next(error);
  }
};

// Get budget suggestions
export const getBudgetSuggestions = async (req, res, next) => {
  try {
    const { months = 3 } = req.query;
    const startDate = moment().subtract(parseInt(months), 'months').startOf('month').toDate();
    const endDate = moment().endOf('month').toDate();

    // Get average spending per category
    const spendingPatterns = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          averageMonthly: { $avg: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Generate suggestions
    const suggestions = spendingPatterns.map(pattern => ({
      category: pattern._id,
      currentSpending: pattern.totalSpent,
      averageMonthly: pattern.averageMonthly,
      suggestedBudget: Math.ceil(pattern.averageMonthly * 1.1), // 10% buffer
      transactionCount: pattern.transactionCount,
      confidence: pattern.transactionCount > 5 ? 'High' : pattern.transactionCount > 2 ? 'Medium' : 'Low'
    }));

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// Toggle budget active status
export const toggleBudgetActiveStatus = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this budget'
      });
    }

    budget.isActive = !budget.isActive;
    await budget.save();

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};