const Expense = require('../models/Expense');
const Income = require('../models/Income');

// दी गई अवधि (week/month/year) के लिए शुरू और अंत तारीख निकालें
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week': {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1); // सोमवार से सप्ताह शुरू
      startDate = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
      break;
    }
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'month':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate: now };
};

// @desc    वित्तीय रिपोर्ट प्राप्त करें (सप्ताह/महीना/साल या कस्टम तारीख)
// @route   GET /api/reports?period=week|month|year
//          GET /api/reports?startDate=...&endDate=...
// @access  Private
const getReport = async (req, res) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;

    let dateRange;
    if (customStart && customEnd) {
      dateRange = { startDate: new Date(customStart), endDate: new Date(customEnd) };
    } else {
      dateRange = getDateRange(period);
    }

    const matchFilter = {
      user: req.user._id,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    };

    const [expenseAgg, incomeAgg, categoryBreakdown] = await Promise.all([
      Expense.aggregate([{ $match: matchFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $match: matchFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalExpense = expenseAgg[0]?.total || 0;
    const totalIncome = incomeAgg[0]?.total || 0;
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Number(((savings / totalIncome) * 100).toFixed(2)) : 0;

    const categories = categoryBreakdown.map((cat) => ({
      category: cat._id,
      total: cat.total,
      count: cat.count,
      percentage: totalExpense > 0 ? Number(((cat.total / totalExpense) * 100).toFixed(2)) : 0,
    }));

    res.status(200).json({
      success: true,
      period,
      dateRange,
      data: {
        totalIncome,
        totalExpense,
        savings,
        savingsRate,
        categoryBreakdown: categories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReport };
