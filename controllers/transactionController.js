const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Credit = require('../models/Credit');

// ============================================
// लेन-देन SCREEN - SAARI APIs
// ============================================

// @desc    Sabhi transactions (Expense + Income + Credit) ek saath
// @route   GET /api/transactions
// @access  Private
const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({ user: userId }).lean();
    const incomes  = await Income.find({ user: userId }).lean();
    const credits  = await Credit.find({ user: userId }).lean();

    const taggedExpenses = expenses.map(e => ({ ...e, transactionType: 'expense' }));
    const taggedIncomes  = incomes.map(i  => ({ ...i, transactionType: 'income'  }));
    const taggedCredits  = credits.map(c  => ({ ...c, transactionType: 'credit'  }));

    const allTransactions = [...taggedExpenses, ...taggedIncomes, ...taggedCredits]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIncome  = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSaved   = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: {
        summary: { totalIncome, totalExpense, totalSaved },
        totalCount: allTransactions.length,
        transactions: allTransactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sirf Expense (खर्च tab)
// @route   GET /api/transactions/expenses
const getExpenseTransactions = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).lean();
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.status(200).json({
      success: true,
      data: { total, count: expenses.length, transactions: expenses.map(e => ({ ...e, transactionType: 'expense' })) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sirf Income (आय tab)
// @route   GET /api/transactions/incomes
const getIncomeTransactions = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 }).lean();
    const total = incomes.reduce((sum, i) => sum + i.amount, 0);
    res.status(200).json({
      success: true,
      data: { total, count: incomes.length, transactions: incomes.map(i => ({ ...i, transactionType: 'income' })) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sirf Credit/Udhar (उधार tab)
// @route   GET /api/transactions/credits
const getCreditTransactions = async (req, res) => {
  try {
    const credits = await Credit.find({ user: req.user._id }).sort({ date: -1 }).lean();
    const totalLent     = credits.filter(c => c.type === 'lent').reduce((sum, c) => sum + c.amount, 0);
    const totalBorrowed = credits.filter(c => c.type === 'borrowed').reduce((sum, c) => sum + c.amount, 0);
    res.status(200).json({
      success: true,
      data: { totalLent, totalBorrowed, count: credits.length, transactions: credits.map(c => ({ ...c, transactionType: 'credit' })) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Category filter (Grocery, Milk etc.)
// @route   GET /api/transactions/category/:categoryName
const getByCategory = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id, category: req.params.categoryName }).sort({ date: -1 }).lean();
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.status(200).json({
      success: true,
      data: { category: req.params.categoryName, total, count: expenses.length, transactions: expenses }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Top card summary (आय, खर्च, बचत)
// @route   GET /api/transactions/summary
const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ user: userId });
    const incomes  = await Income.find({ user: userId });
    const creditCount = await Credit.countDocuments({ user: userId });

    const totalIncome  = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSaved   = totalIncome - totalExpense;
    const totalCount   = expenses.length + incomes.length + creditCount;

    res.status(200).json({
      success: true,
      data: { totalCount, totalIncome, totalExpense, totalSaved }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Date wise grouped transactions
// @route   GET /api/transactions/grouped
const getGroupedTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ user: userId }).lean();
    const incomes  = await Income.find({ user: userId }).lean();
    const credits  = await Credit.find({ user: userId }).lean();

    const all = [
      ...expenses.map(e => ({ ...e, transactionType: 'expense' })),
      ...incomes.map(i  => ({ ...i, transactionType: 'income'  })),
      ...credits.map(c  => ({ ...c, transactionType: 'credit'  }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Date ke hisaab se group karo
    const grouped = {};
    all.forEach(txn => {
      const dateKey = new Date(txn.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(txn);
    });

    const groupedArray = Object.entries(grouped).map(([date, items]) => ({ date, items }));

    res.status(200).json({ success: true, data: groupedArray });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getExpenseTransactions,
  getIncomeTransactions,
  getCreditTransactions,
  getByCategory,
  getTransactionSummary,
  getGroupedTransactions
};