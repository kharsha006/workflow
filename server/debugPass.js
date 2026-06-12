const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('./models/User');
const seedData = require('./utils/seedData');

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  
  await seedData(true);
  
  const user = await User.findOne({ email: 'demo@workflow.com' }).select('+password');
  console.log('User password hash in DB:', user.password);
  
  const isMatch = await user.matchPassword('password123');
  console.log('Does password123 match?', isMatch);
  
  process.exit();
}

run();
