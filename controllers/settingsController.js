const User = require('../models/User');

// @desc    सेटिंग्स प्राप्त करें (नोटिफिकेशन, डार्क मोड, भाषा)
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  res.status(200).json({ success: true, data: req.user.settings });
};

// @desc    सेटिंग्स अपडेट करें
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { notifications, darkMode, language } = req.body;
    const updateData = {};

    if (notifications !== undefined) updateData['settings.notifications'] = notifications;
    if (darkMode !== undefined) updateData['settings.darkMode'] = darkMode;
    if (language !== undefined) updateData['settings.language'] = language;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.status(200).json({ success: true, message: 'Settings updated successfully', data: user.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    पासवर्ड बदलें
// @route   PUT /api/settings/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please enter your current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings, changePassword };
