const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personName: {
      type: String,
      required: [true, 'व्यक्ति का नाम आवश्यक है'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'राशि आवश्यक है'],
      min: [1, 'राशि 0 से अधिक होनी चाहिए'],
    },
    type: {
      type: String,
      enum: ['lent', 'borrowed'], // lent = दिया हुआ उधार, borrowed = लिया हुआ उधार
      required: [true, 'Type (lent/borrowed) Required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

creditSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Credit', creditSchema);
