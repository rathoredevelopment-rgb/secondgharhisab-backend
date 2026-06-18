const express = require('express');
const router = express.Router();
const {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeCategories,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/categories', getIncomeCategories);
router.route('/').get(getIncomes).post(createIncome);
router.route('/:id').get(getIncomeById).put(updateIncome).delete(deleteIncome);

module.exports = router;
