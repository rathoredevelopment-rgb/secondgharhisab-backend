const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications
const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    const notification = await Notification.create({
      user: req.user._id,
      title,
      message,
      type,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications
const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearNotifications,
};