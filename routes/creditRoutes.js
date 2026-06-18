const express = require('express');
const router = express.Router();
const {
  getCredits,
  getCreditById,
  createCredit,
  updateCredit,
  markAsPaid,
  deleteCredit,
  getCreditSummary,
} = require('../controllers/creditController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getCreditSummary);
router.route('/').get(getCredits).post(createCredit);
router.put('/:id/mark-paid', markAsPaid);
router.route('/:id').get(getCreditById).put(updateCredit).delete(deleteCredit);

module.exports = router;
