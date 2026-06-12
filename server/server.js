const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const setupCronJobs = require('./utils/cronJobs');

// Load env vars
dotenv.config();

// Connect to database and seed if memory DB
connectDB().then(async (isMemory) => {
  if (isMemory) {
    console.log('Seeding memory database...');
    const seedData = require('./utils/seedData');
    await seedData(true); // skipConnect = true
  }
});

// Initialize Cron Jobs
setupCronJobs();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes will be mounted here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/daily-status', require('./routes/dailyStatus'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/escalations', require('./routes/escalations'));

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
