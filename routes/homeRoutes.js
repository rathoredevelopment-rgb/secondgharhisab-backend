const express = require('express');
const router = express.Router();

// ✅ HOME controller import karo
const {
  getHomeSummary,
  getTotalExpense,
  getAnnualExpense,
  getThisMonthExpense,
  getStats,
  getTotalIncome,
  getBudgetProgress,
  getQuickAddData
} = require('../controllers/homeController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary',         getHomeSummary);
router.get('/total-expense',   getTotalExpense);
router.get('/annual-expense',  getAnnualExpense);
router.get('/monthly-expense', getThisMonthExpense);
router.get('/stats',           getStats);
router.get('/total-income',    getTotalIncome);
router.get('/budget-progress', getBudgetProgress);
router.get('/quick-add',       getQuickAddData);

module.exports = router;