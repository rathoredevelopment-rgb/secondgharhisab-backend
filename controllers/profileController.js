const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Credit = require('../models/Credit');

// @desc    प्रोफाइल और आंकड़े (stats) प्राप्त करें
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const [expenseCount, incomeCount, creditCount, totalExpenseAgg, firstExpense] = await Promise.all([
      Expense.countDocuments({ user: userId }),
      Income.countDocuments({ user: userId }),
      Credit.countDocuments({ user: userId }),
      Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.findOne({ user: userId }).sort({ date: 1 }),
    ]);

    const totalTransactions = expenseCount + incomeCount + creditCount;
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    // पहले लेनदेन से अब तक कितने महीने सक्रिय रहे
    let activeMonths = 0;
    if (firstExpense) {
      const now = new Date();
      const months =
        (now.getFullYear() - firstExpense.date.getFullYear()) * 12 +
        (now.getMonth() - firstExpense.date.getMonth()) +
        1;
      activeMonths = Math.max(months, 1);
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        stats: {
          totalTransactions,
          totalExpense,
          activeMonths,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    प्रोफाइल अपडेट करें (नाम, ईमेल, अवतार)
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (email && email.toLowerCase() !== req.user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This email is already in use' });
      }
      updateData.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
