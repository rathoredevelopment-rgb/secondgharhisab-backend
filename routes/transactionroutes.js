const express = require('express');
const router = express.Router();
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

router.use(protect); // Sabhi routes protected

// ✅ MAIN - poora data ek saath (BEST)
router.get('/',                        getAllTransactions);

// ✅ TAB FILTERS (screen ke upar wale buttons)
router.get('/expenses',                getExpenseTransactions);   // खर्च tab
router.get('/incomes',                 getIncomeTransactions);    // आय tab
router.get('/credits',                 getCreditTransactions);    // उधार tab
router.get('/category/:categoryName',  getByCategory);            // Grocery tab

// ✅ EXTRA
router.get('/summary',                 getTransactionSummary);    // top card only
router.get('/grouped',                 getGroupedTransactions);   // date wise group

module.exports = router;