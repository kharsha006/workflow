const cron = require('node-cron');
const DailyStatusLog = require('../models/DailyStatusLog');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

const setupCronJobs = () => {
  // Run every day at 18:00 (6:00 PM)
  cron.schedule('0 18 * * *', async () => {
    console.log('Running daily status lock cron job...');
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Find all unlocked logs for today and lock them
      const result = await DailyStatusLog.updateMany(
        { date: todayStr, isLocked: false },
        { $set: { isLocked: true } }
      );

      console.log(`Locked ${result.modifiedCount} daily status logs for ${todayStr}`);
    } catch (error) {
      console.error('Error running daily status lock cron job:', error);
    }
  });
  
  // Run every day at 08:00 AM for birthdays
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily birthday check cron job...');
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // Find users with today's birthday
      // MongoDB aggregation to match day and month of dateOfBirth
      const users = await User.aggregate([
        {
          $addFields: {
            birthMonth: { $month: "$dateOfBirth" },
            birthDay: { $dayOfMonth: "$dateOfBirth" }
          }
        },
        {
          $match: {
            birthMonth: currentMonth,
            birthDay: currentDay,
            status: { $ne: 'inactive' }
          }
        }
      ]);

      console.log(`Found ${users.length} users with birthdays today.`);

      for (const user of users) {
        try {
          await sendEmail({
            to: user.email,
            subject: `Happy Birthday ${user.name}! 🎂 - WorkFlow Team`,
            text: `Dear ${user.name},\n\nWishing you a very Happy Birthday!\n\nBest Wishes,\nThe WorkFlow Team`,
            html: `<h3>Dear ${user.name},</h3><p>Wishing you a very <strong>Happy Birthday!</strong> 🎈🥳</p><br><p>Best Wishes,</p><p>The WorkFlow Team</p>`
          });
          console.log(`Sent birthday email to ${user.email}`);
        } catch (emailErr) {
          console.error(`Failed to send birthday email to ${user.email}`, emailErr);
        }
      }
    } catch (error) {
      console.error('Error running daily birthday cron job:', error);
    }
  });

  console.log('Cron jobs initialized');
};

module.exports = setupCronJobs;
