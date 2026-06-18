const Expense = require('../models/Expense');

// डिफ़ॉल्ट खर्च श्रेणियां (UI में दिखाने के लिए)
const DEFAULT_CATEGORIES = [
  { name: 'Grocery', icon: 'basket' },
  { name: 'Vegetables', icon: 'apple' },
  { name: 'Milk', icon: 'glass' },
  { name: 'Transport', icon: 'bus' },
  { name: 'Rent', icon: 'home' },
  { name: 'Electricity', icon: 'bolt' },
  { name: 'Medical', icon: 'medkit' },
  { name: 'Other', icon: 'dots' },
];

// @desc    सभी खर्च प्राप्त करें (फ़िल्टर + पेजिनेशन के साथ)
// @route   GET /api/expenses?category=&startDate=&endDate=&search=&page=&limit=
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.description = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, total, totalAmountAgg] = await Promise.all([
      Expense.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(query),
      Expense.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalAmount: totalAmountAgg[0]?.total || 0,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    एक खर्च प्राप्त करें
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    नया खर्च जोड़ें
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { category, amount, description, date, paymentMethod } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ success: false, message: 'Category and amount are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      category,
      amount,
      description,
      date,
      paymentMethod,
    });

    res.status(201).json({ success: true, message: 'Expense added successfully', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    खर्च अपडेट करें
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const exists = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    खर्च हटाएं
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    खर्च श्रेणियां प्राप्त करें (डिफ़ॉल्ट + उपयोगकर्ता की इस्तेमाल की गई)
// @route   GET /api/expenses/categories
// @access  Private
const getExpenseCategories = async (req, res) => {
  try {
    const usedCategories = await Expense.distinct('category', { user: req.user._id });
    res.status(200).json({ success: true, default: DEFAULT_CATEGORIES, used: usedCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
};
