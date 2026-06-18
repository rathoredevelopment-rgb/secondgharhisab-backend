const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT टोकन जनरेट करें
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    साइन अप करें (नया खाता बनाएं)
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    लॉग इन करें
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    वर्तमान लॉगिन उपयोगकर्ता प्राप्त करें
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

// @desc    पासवर्ड भूल गए - रीसेट टोकन जनरेट करें
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 मिनट में समाप्त
    await user.save();

    // ⚠️ नोट: प्रोडक्शन में resetToken को यूज़र के ईमेल/SMS पर भेजें (जैसे Nodemailer/Twilio से)।
    // यहाँ डेवलपमेंट सुविधा के लिए सीधे रिस्पॉन्स में भेजा जा रहा है।
    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    टोकन से पासवर्ड रीसेट करें
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: 'Please enter a new password with at least 6 characters' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};
