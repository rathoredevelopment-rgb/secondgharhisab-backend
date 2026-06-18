const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notification.routes');
dotenv.config();
connectDB();

const app = express();

// मिडलवेयर
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// रूट्स
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/credits', require('./routes/creditRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes'));
app.use('/api/notifications', notificationRoutes);


// हेल्थ चेक
app.get('/', (req, res) => {
  res.json({ success: true, message: '🏠 GharHisab API is running' });
});

// 404 हैंडलर
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ग्लोबल एरर हैंडलर
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'An error occurred on the server',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Port ${PORT} Running on(${process.env.NODE_ENV || 'development'})`);
});
