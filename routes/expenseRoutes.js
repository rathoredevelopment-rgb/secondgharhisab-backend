const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/categories', getExpenseCategories);
router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').get(getExpenseById).put(updateExpense).delete(deleteExpense);

module.exports = router;
