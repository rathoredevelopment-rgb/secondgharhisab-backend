const Expense = require('../models/Expense');
const Income = require('../models/Income');

// ============================================
// HOME SCREEN - SAARI APIs
// ============================================

// @desc    Total Expense, Annual Expense, This Month
// @route   GET /api/home/summary
// @access  Private
const getHomeSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // 1. IS MAHINE KI DATE RANGE
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 2. IS SAAL KI DATE RANGE
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    // 3. TOTAL EXPENSE (sabhi time)
    const allExpenses = await Expense.find({ user: userId });
    const totalExpense = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 4. ANNUAL EXPENSE (is saal ka)
    const annualExpenses = await Expense.find({
      user: userId,
      date: { $gte: yearStart, $lte: yearEnd }
    });
    const annualExpense = annualExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 5. THIS MONTH EXPENSE
    const monthExpenses = await Expense.find({
      user: userId,
      date: { $gte: monthStart, $lte: monthEnd }
    });
    const thisMonthExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 6. TOTAL INCOME (sabhi time)
    const allIncomes = await Income.find({ user: userId });
    const totalIncome = allIncomes.reduce((sum, i) => sum + i.amount, 0);

    // 7. THIS MONTH INCOME
    const monthIncomes = await Income.find({
      user: userId,
      date: { $gte: monthStart, $lte: monthEnd }
    });
    const thisMonthIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);

    // 8. SAVINGS (Income - Expense)
    const saved = totalIncome - totalExpense;
    const thisMonthSaved = thisMonthIncome - thisMonthExpense;

    // 9. BUDGET PROGRESS (%)
    let budgetProgress = 0;
    if (totalIncome > 0) {
      budgetProgress = Math.round((totalExpense / totalIncome) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        // Top Card - Total Expense
        totalExpense,

        // Right side cards
        annualExpense,
        thisMonthExpense,

        // Bottom stats bar
        spent: totalExpense,
        income: totalIncome,
        saved,

        // Left small card
        totalIncome,
        thisMonthIncome,
        thisMonthSaved,

        // Budget Progress card
        budgetProgress: `${budgetProgress}%`,
        budgetProgressNumber: budgetProgress,
        budgetText: `₹${totalExpense} spent of ₹${totalIncome}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Total Expense only
// @route   GET /api/home/total-expense
// @access  Private
const getTotalExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      data: { totalExpense }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Annual Expense
// @route   GET /api/home/annual-expense
// @access  Private
const getAnnualExpense = async (req, res) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: yearStart, $lte: yearEnd }
    });
    const annualExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      data: { annualExpense, year: now.getFullYear() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    This Month Expense
// @route   GET /api/home/monthly-expense
// @access  Private
const getThisMonthExpense = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: monthStart, $lte: monthEnd }
    });
    const thisMonthExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        thisMonthExpense,
        month: now.toLocaleString('default', { month: 'long' }),
        year: now.getFullYear()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Spent, Income, Saved stats bar
// @route   GET /api/home/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({ user: userId });
    const incomes = await Income.find({ user: userId });

    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const income = incomes.reduce((sum, i) => sum + i.amount, 0);
    const saved = income - spent;

    res.status(200).json({
      success: true,
      data: { spent, income, saved }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Total Income card
// @route   GET /api/home/total-income
// @access  Private
const getTotalIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id });
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    res.status(200).json({
      success: true,
      data: { totalIncome }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Budget Progress card
// @route   GET /api/home/budget-progress
// @access  Private
const getBudgetProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({ user: userId });
    const incomes = await Income.find({ user: userId });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    let progressPercent = 0;
    if (totalIncome > 0) {
      progressPercent = Math.min(Math.round((totalExpense / totalIncome) * 100), 100);
    }

    res.status(200).json({
      success: true,
      data: {
        progressPercent,
        progressText: `${progressPercent}%`,
        spentAmount: totalExpense,
        totalIncome,
        displayText: `₹${totalExpense} spent of ₹${totalIncome}`,
        isOverBudget: totalExpense > totalIncome
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick Add shortcuts data (recent categories)
// @route   GET /api/home/quick-add
// @access  Private
const getQuickAddData = async (req, res) => {
  try {
    // Quick add ke liye available shortcuts
    const quickAddOptions = [
      { id: 1, label: 'Grocery',   icon: 'basket',  type: 'expense',  route: '/add-expense?category=Grocery'   },
      { id: 2, label: 'Expense',   icon: 'minus',   type: 'expense',  route: '/add-expense'                     },
      { id: 3, label: 'Income',    icon: 'plus',    type: 'income',   route: '/add-income'                      },
      { id: 4, label: 'Credit',    icon: 'person',  type: 'credit',   route: '/credit'                          }
    ];

    res.status(200).json({
      success: true,
      data: { quickAddOptions }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHomeSummary,
  getTotalExpense,
  getAnnualExpense,
  getThisMonthExpense,
  getStats,
  getTotalIncome,
  getBudgetProgress,
  getQuickAddData
};