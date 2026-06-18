const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      // जैसे: Salary, Business, Investment, Freelance, Other
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receivedVia: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank', 'Other'],
      default: 'Cash',
    },
  },
  { timestamps: true }
);

incomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
