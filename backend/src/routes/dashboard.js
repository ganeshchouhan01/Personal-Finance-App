// backend/routes/dashboard.js
import express from 'express'
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js'

const router = express.Router();

// Get dashboard summary
router.get('/summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // Calculate start and end of month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    // Get all transactions for the month
    const transactions = await Transaction.find({
      user: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate category breakdown
    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {});
    
    res.json({
      income,
      expenses,
      balance: income - expenses,
      categoryBreakdown,
      transactions: transactions.slice(0, 5) // Recent transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

export default router;