const express = require('express');
const router = express.Router();

// ✅ TRANSACTION controller import karo
const {
  getAllTransactions,
  getExpenseTransactions,
  getIncomeTransactions,
  getCreditTransactions,
  getByCategory,
  getTransactionSummary,
  getGroupedTransactions
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',                       getAllTransactions);
router.get('/expenses',               getExpenseTransactions);
router.get('/incomes',                getIncomeTransactions);
router.get('/credits',                getCreditTransactions);
router.get('/category/:categoryName', getByCategory);
router.get('/summary',                getTransactionSummary);
router.get('/grouped',                getGroupedTransactions);

module.exports = router;