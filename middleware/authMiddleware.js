const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT टोकन वेरिफाई करने वाला मिडलवेयर
const protect = async (req, res, next) => {


  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found, token is invalid' });
      }

      return next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ success: false, message: 'Unauthorized, token is invalid or has expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized, token not provided' });
  }
};

module.exports = { protect };
