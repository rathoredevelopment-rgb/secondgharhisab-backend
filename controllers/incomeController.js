const Income = require('../models/Income');

// डिफ़ॉल्ट आय श्रेणियां (UI में दिखाने के लिए)
const DEFAULT_CATEGORIES = [
  { name: 'Salary', icon: 'briefcase' },
  { name: 'Business', icon: 'shop' },
  { name: 'Investment', icon: 'chart' },
  { name: 'Freelance', icon: 'laptop' },
  { name: 'Other', icon: 'dots' },
];

// @desc    सभी आय प्राप्त करें (फ़िल्टर + पेजिनेशन के साथ)
// @route   GET /api/incomes?category=&startDate=&endDate=&search=&page=&limit=
// @access  Private
const getIncomes = async (req, res) => {
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

    const [incomes, total, totalAmountAgg] = await Promise.all([
      Income.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Income.countDocuments(query),
      Income.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.status(200).json({
      success: true,
      count: incomes.length,
      total,
      totalAmount: totalAmountAgg[0]?.total || 0,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: incomes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    एक आय प्राप्त करें
// @route   GET /api/incomes/:id
// @access  Private
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    res.status(200).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    नई आय जोड़ें
// @route   POST /api/incomes
// @access  Private
const createIncome = async (req, res) => {
  try {
    const { category, amount, description, date, receivedVia } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ success: false, message: 'Category and amount are required' });
    }

    const income = await Income.create({
      user: req.user._id,
      category,
      amount,
      description,
      date,
      receivedVia,
    });

    res.status(201).json({ success: true, message: 'Income added successfully', data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    आय अपडेट करें
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const exists = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Income updated successfully', data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    आय हटाएं
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    await income.deleteOne();

    res.status(200).json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    आय श्रेणियां प्राप्त करें (डिफ़ॉल्ट + उपयोगकर्ता की इस्तेमाल की गई)
// @route   GET /api/incomes/categories
// @access  Private
const getIncomeCategories = async (req, res) => {
  try {
    const usedCategories = await Income.distinct('category', { user: req.user._id });
    res.status(200).json({ success: true, default: DEFAULT_CATEGORIES, used: usedCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeCategories,
};
