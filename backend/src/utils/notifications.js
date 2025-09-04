import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { sendBudgetAlertEmail } from './emailService.js';
import moment from 'moment';

// Check budget alerts
export const checkBudgetAlerts = async (userId, category, amount, date) => {
  try {
    const budget = await Budget.findOne({
      user: userId,
      category,
      isActive: true,
      'notifications.enabled': true
    });

    if (!budget) return null;

    const periodStart = moment(date).startOf(budget.period).toDate();
    const periodEnd = moment(date).endOf(budget.period).toDate();

    const spending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          category,
          date: { $gte: periodStart, $lte: periodEnd }
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

    // Check if we should send an alert
    if (percentageUsed >= budget.notifications.threshold) {
      const user = await User.findById(userId);
      
      if (user) {
        await sendBudgetAlertEmail(user, {
          category: budget.category,
          budgetAmount: budget.amount,
          amountSpent: totalSpent,
          percentageUsed,
          remaining: budget.amount - totalSpent,
          period: moment(periodStart).format('MMMM YYYY')
        });
      }

      return {
        budgetId: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        amountSpent: totalSpent,
        percentageUsed,
        remaining: budget.amount - totalSpent,
        alertLevel: percentageUsed >= 100 ? 'danger' : 'warning'
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking budget alerts:', error);
    return null;
  }
};

// Get all active budget alerts for user
export const getUserBudgetAlerts = async (userId) => {
  try {
    const budgets = await Budget.find({
      user: userId,
      isActive: true,
      'notifications.enabled': true
    });

    const alerts = await Promise.all(
      budgets.map(async (budget) => {
        const periodStart = moment().startOf(budget.period).toDate();
        const periodEnd = moment().endOf(budget.period).toDate();

        const spending = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: 'expense',
              category: budget.category,
              date: { $gte: periodStart, $lte: periodEnd }
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
            period: moment(periodStart).format('MMMM YYYY'),
            alertLevel: percentageUsed >= 100 ? 'danger' : 'warning',
            message: percentageUsed >= 100 ?
              `Budget exceeded for ${budget.category}` :
              `Budget alert: ${Math.round(percentageUsed)}% used for ${budget.category}`
          };
        }

        return null;
      })
    );

    return alerts.filter(alert => alert !== null);
  } catch (error) {
    console.error('Error getting user budget alerts:', error);
    return [];
  }
};

// Check for upcoming recurring transactions
export const checkRecurringTransactions = async (userId) => {
  try {
    const tomorrow = moment().add(1, 'day').startOf('day').toDate();
    const dayAfterTomorrow = moment().add(2, 'day').endOf('day').toDate();

    const upcomingRecurring = await Transaction.find({
      user: userId,
      'recurring.isRecurring': true,
      'recurring.nextDate': {
        $gte: tomorrow,
        $lte: dayAfterTomorrow
      }
    });

    return upcomingRecurring;
  } catch (error) {
    console.error('Error checking recurring transactions:', error);
    return [];
  }
};

// Send low balance alert (if you integrate with bank accounts in the future)
export const checkLowBalanceAlert = async (userId, currentBalance, minimumBalance = 100) => {
  try {
    if (currentBalance < minimumBalance) {
      const user = await User.findById(userId);
      // You would implement actual notification logic here
      console.log(`Low balance alert for user ${user.email}: $${currentBalance}`);
      return {
        alert: true,
        currentBalance,
        minimumBalance,
        message: `Low balance alert: $${currentBalance} is below minimum of $${minimumBalance}`
      };
    }
    return { alert: false };
  } catch (error) {
    console.error('Error checking low balance:', error);
    return { alert: false, error: error.message };
  }
};

// Monthly spending summary notification
export const sendMonthlySummary = async (userId) => {
  try {
    const startDate = moment().subtract(1, 'month').startOf('month').toDate();
    const endDate = moment().subtract(1, 'month').endOf('month').toDate();

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const income = monthlyData.find(d => d._id === 'income')?.total || 0;
    const expense = monthlyData.find(d => d._id === 'expense')?.total || 0;
    const net = income - expense;

    return {
      month: moment(startDate).format('MMMM YYYY'),
      income,
      expense,
      net,
      transactionCount: monthlyData.reduce((sum, d) => sum + d.count, 0)
    };
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    return null;
  }
};

// Weekly financial digest
export const generateWeeklyDigest = async (userId) => {
  try {
    const startDate = moment().subtract(1, 'week').startOf('day').toDate();
    const endDate = moment().endOf('day').toDate();

    const weeklyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            day: { $dayOfWeek: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const topExpenses = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    })
    .sort({ amount: -1 })
    .limit(5)
    .select('amount category date note');

    return {
      period: `${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D')}`,
      weeklyData,
      topExpenses,
      totalTransactions: weeklyData.reduce((sum, d) => sum + d.count, 0)
    };
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    return null;
  }
};

// Notification preferences check
export const canSendNotification = async (userId, notificationType) => {
  try {
    const user = await User.findById(userId);
    
    // This would check user's notification preferences
    // For now, assume all notifications are enabled
    return true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return false;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    // This would update the notification status in database
    // Placeholder implementation
    return { success: true, message: 'Notification marked as read' };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId) => {
  try {
    // This would count unread notifications from database
    // Placeholder implementation
    return 0;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
};

