const Credit = require('../models/Credit');

// @desc    सभी उधार रिकॉर्ड प्राप्त करें (lent/borrowed फ़िल्टर के साथ)
// @route   GET /api/credits?type=lent|borrowed&status=pending|paid
// @access  Private
const getCredits = async (req, res) => {
  try {
    const { type, status } = req.query;

    const query = { user: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const [credits, totalAgg] = await Promise.all([
      Credit.find(query).sort({ date: -1, createdAt: -1 }),
      Credit.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.status(200).json({
      success: true,
      count: credits.length,
      totalAmount: totalAgg[0]?.total || 0,
      data: credits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    उधार सारांश प्राप्त करें (Lent बनाम Borrowed कुल)
// @route   GET /api/credits/summary
// @access  Private
const getCreditSummary = async (req, res) => {
  try {
    const summary = await Credit.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      lent: { total: 0, count: 0 },
      borrowed: { total: 0, count: 0 },
    };

    summary.forEach((item) => {
      result[item._id] = { total: item.total, count: item.count };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    एक उधार रिकॉर्ड प्राप्त करें
// @route   GET /api/credits/:id
// @access  Private
const getCreditById = async (req, res) => {
  try {
    const credit = await Credit.findOne({ _id: req.params.id, user: req.user._id });

    if (!credit) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, data: credit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    नया उधार रिकॉर्ड जोड़ें (दिया या लिया हुआ)
// @route   POST /api/credits
// @access  Private
const createCredit = async (req, res) => {
  try {
    const { personName, amount, type, date, notes } = req.body;

    if (!personName || !amount || !type) {
      return res.status(400).json({ success: false, message: 'Name, amount, and type are required' });
    }

    if (!['lent', 'borrowed'].includes(type)) {
      return res.status(400).json({ success: false, message: 'प्रकार "lent" या "borrowed" होना चाहिए' });
    }

    const credit = await Credit.create({
      user: req.user._id,
      personName,
      amount,
      type,
      date,
      notes,
    });

    res.status(201).json({ success: true, message: 'Record added successfully', data: credit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    उधार रिकॉर्ड अपडेट करें
// @route   PUT /api/credits/:id
// @access  Private
const updateCredit = async (req, res) => {
  try {
    const exists = await Credit.findOne({ _id: req.params.id, user: req.user._id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const credit = await Credit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Record updated successfully', data: credit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    उधार को "paid" के रूप में चिह्नित करें
// @route   PUT /api/credits/:id/mark-paid
// @access  Private
const markAsPaid = async (req, res) => {
  try {
    const credit = await Credit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'paid' },
      { new: true }
    );

    if (!credit) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'The record has been marked as paid', data: credit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    उधार रिकॉर्ड हटाएं
// @route   DELETE /api/credits/:id
// @access  Private
const deleteCredit = async (req, res) => {
  try {
    const credit = await Credit.findOne({ _id: req.params.id, user: req.user._id });

    if (!credit) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await credit.deleteOne();

    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCredits,
  getCreditById,
  createCredit,
  updateCredit,
  markAsPaid,
  deleteCredit,
  getCreditSummary,
};
