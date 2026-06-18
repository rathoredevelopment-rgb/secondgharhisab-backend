const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, changePassword } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getSettings).put(updateSettings);
router.put('/change-password', changePassword);

module.exports = router;
