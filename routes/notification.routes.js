const express = require('express');
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearNotifications,
} = require('../controllers/notification.controller');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification)
  .delete(protect, clearNotifications);

router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;