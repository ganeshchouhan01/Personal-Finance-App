import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a budget amount'],
    min: [0, 'Budget amount must be positive']
  },
  period: {
    type: String,
    required: true,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    }
  },
  rollover: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user and category
budgetSchema.index({ user: 1, category: 1 }, { unique: true });
const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;