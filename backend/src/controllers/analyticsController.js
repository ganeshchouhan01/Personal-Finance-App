import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import moment from 'moment';
// Get monthly summary
export const getMonthlySummary = async (req, res, next) => {
  try {
    const { year = moment().year(), month = moment().month() + 1 } = req.query;
    const startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
    const endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();

    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          categories: {
            $push: {
              category: '$category',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    const income = transactions.find(t => t._id === 'income') || { total: 0, categories: [] };
    const expenses = transactions.find(t => t._id === 'expense') || { total: 0, categories: [] };

    // Calculate category breakdown for expenses
    const categoryBreakdown = expenses.categories.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += curr.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        income: income.total,
        expenses: expenses.total,
        netBalance: income.total - expenses.total,
        categoryBreakdown,
        month: moment(startDate).format('MMMM YYYY')
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category-wise spending
export const getCategorySpending = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;

    const matchStage = {
      user: req.user._id,
      type: type
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const categorySpending = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categorySpending
    });
  } catch (error) {
    next(error);
  }
};

// Get spending trends over time
 export const getSpendingTrends = async (req, res, next) => {
  try {
    const { months = 6, type = 'expense' } = req.query;

    const startDate = moment().subtract(parseInt(months), 'months').startOf('month').toDate();
    const endDate = moment().endOf('month').toDate();

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: type,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the response
    const formattedTrends = trends.map(trend => ({
      period: `${moment().month(trend._id.month - 1).format('MMM')} ${trend._id.year}`,
      totalAmount: trend.totalAmount,
      transactionCount: trend.transactionCount
    }));

    res.status(200).json({
      success: true,
      data: formattedTrends
    });
  } catch (error) {
    next(error);
  }
};

// Get financial health metrics
export const getFinancialHealth = async (req, res, next) => {
  try {
    const currentMonthStart = moment().startOf('month').toDate();
    const currentMonthEnd = moment().endOf('month').toDate();
    const lastMonthStart = moment().subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = moment().subtract(1, 'month').endOf('month').toDate();

    // Current month stats
    const currentMonthStats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Last month stats
    const lastMonthStats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentIncome = currentMonthStats.find(s => s._id === 'income')?.total || 0;
    const currentExpense = currentMonthStats.find(s => s._id === 'expense')?.total || 0;
    const lastIncome = lastMonthStats.find(s => s._id === 'income')?.total || 0;
    const lastExpense = lastMonthStats.find(s => s._id === 'expense')?.total || 0;

    // Calculate metrics
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;
    const expenseGrowth = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0;
    const incomeGrowth = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          income: currentIncome,
          expense: currentExpense,
          net: currentIncome - currentExpense
        },
        lastMonth: {
          income: lastIncome,
          expense: lastExpense,
          net: lastIncome - lastExpense
        },
        metrics: {
          savingsRate: Math.round(savingsRate),
          expenseGrowth: Math.round(expenseGrowth),
          incomeGrowth: Math.round(incomeGrowth),
          financialHealth: savingsRate > 20 ? 'Excellent' : savingsRate > 10 ? 'Good' : savingsRate > 0 ? 'Fair' : 'Needs Improvement'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get yearly overview
export const getYearlyOverview = async (req, res, next) => {
  try {
    const { year = moment().year() } = req.query;
    const startDate = moment(`${year}-01-01`).startOf('year').toDate();
    const endDate = moment(`${year}-12-31`).endOf('year').toDate();

    const yearlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthData = yearlyData.filter(d => d._id.month === month);
      const income = monthData.find(d => d._id.type === 'income')?.totalAmount || 0;
      const expense = monthData.find(d => d._id.type === 'expense')?.totalAmount || 0;
      
      return {
        month: moment().month(i).format('MMMM'),
        income,
        expense,
        net: income - expense
      };
    });

    const yearlyTotals = yearlyData.reduce((acc, curr) => {
      if (curr._id.type === 'income') {
        acc.income += curr.totalAmount;
      } else {
        acc.expense += curr.totalAmount;
      }
      return acc;
    }, { income: 0, expense: 0 });

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        totalIncome: yearlyTotals.income,
        totalExpense: yearlyTotals.expense,
        netBalance: yearlyTotals.income - yearlyTotals.expense,
        monthlyBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get top expenses
export const getTopExpenses = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const matchStage = {
      user: req.user._id,
      type: 'expense'
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const topExpenses = await Transaction.find(matchStage)
      .sort({ amount: -1 })
      .limit(parseInt(limit))
      .select('amount category date note paymentMethod');

    res.status(200).json({
      success: true,
      data: topExpenses
    });
  } catch (error) {
    next(error);
  }
};

// Get income vs expense comparison
export const getIncomeVsExpense = async (req, res, next) => {
  try {
    const { period = 'monthly', months = 12 } = req.query;
    const startDate = moment().subtract(parseInt(months), 'months').toDate();
    const endDate = moment().toDate();

    const comparisonData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            period: period === 'monthly' ? { 
              year: { $year: '$date' },
              month: { $month: '$date' }
            } : period === 'quarterly' ? {
              year: { $year: '$date' },
              quarter: { $ceil: { $divide: [{ $month: '$date' }, 3] } }
            } : {
              year: { $year: '$date' }
            }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.period.year': 1, '_id.period.month': 1, '_id.period.quarter': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    next(error);
  }
};

// Get cash flow analysis
export const getCashFlowAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = { user: req.user._id };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const cashFlow = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          dailyIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          dailyExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: cashFlow
    });
  } catch (error) {
    next(error);
  }
};

// Get net worth trend
export const getNetWorthTrend = async (req, res, next) => {
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
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Calculate cumulative net worth
    let cumulativeNetWorth = 0;
    const netWorthTrend = netWorthData.map(monthData => {
      const net = monthData.totalIncome - monthData.totalExpense;
      cumulativeNetWorth += net;
      
      return {
        period: `${moment().month(monthData._id.month - 1).format('MMM')} ${monthData._id.year}`,
        income: monthData.totalIncome,
        expense: monthData.totalExpense,
        net,
        cumulativeNetWorth
      };
    });

    res.status(200).json({
      success: true,
      data: netWorthTrend
    });
  } catch (error) {
    next(error);
  }
};

// Get custom report
export const getCustomReport = async (req, res, next) => {
  try {
    const { metrics, period, filters } = req.body;

    // Build match stage based on filters
    const matchStage = { user: req.user._id };
    
    if (filters) {
      if (filters.type) matchStage.type = filters.type;
      if (filters.category) matchStage.category = new RegExp(filters.category, 'i');
      if (filters.startDate || filters.endDate) {
        matchStage.date = {};
        if (filters.startDate) matchStage.date.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.date.$lte = new Date(filters.endDate);
      }
      if (filters.minAmount || filters.maxAmount) {
        matchStage.amount = {};
        if (filters.minAmount) matchStage.amount.$gte = parseFloat(filters.minAmount);
        if (filters.maxAmount) matchStage.amount.$lte = parseFloat(filters.maxAmount);
      }
    }

    const aggregationPipeline = [{ $match: matchStage }];

    // Add grouping based on period
    if (period && period.granularity) {
      let groupId = {};
      
      switch (period.granularity) {
        case 'daily':
          groupId = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          };
          break;
        case 'weekly':
          groupId = {
            year: { $year: '$date' },
            week: { $week: '$date' }
          };
          break;
        case 'monthly':
          groupId = {
            year: { $year: '$date' },
            month: { $month: '$date' }
          };
          break;
        case 'yearly':
          groupId = {
            year: { $year: '$date' }
          };
          break;
        default:
          groupId = {
            year: { $year: '$date' },
            month: { $month: '$date' }
          };
      }

      aggregationPipeline.push({
        $group: {
          _id: groupId,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          },
          transactionCount: { $sum: 1 }
        }
      });

      aggregationPipeline.push({ $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } });
    }

    const reportData = await Transaction.aggregate(aggregationPipeline);

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};