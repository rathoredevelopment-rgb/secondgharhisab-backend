const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
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
      // जैसे: Grocery, Vegetables, Milk, Transport, Rent, Electricity, Medical, Other
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
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank', 'Other'],
      default: 'Cash',
    },
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
