import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  note: {
    type: String,
    maxlength: [200, 'Note cannot be more than 200 characters'],
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card', 'debit card', 'bank transfer', 'digital wallet', 'other'],
    default: 'other'
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextDate: Date,
    endDate: Date
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String
  },
  attachments: [{
    url: String,
    publicId: String,
    fileName: String
  }],
  tags: [String],
  isExcludedFromReports: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, category: 1 });
transactionSchema.index({ user: 1, date: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction