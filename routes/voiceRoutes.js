const express = require('express');
const router = express.Router();
const { parseVoice, createFromVoice } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/parse', parseVoice);
router.post('/', createFromVoice);

module.exports = router;
