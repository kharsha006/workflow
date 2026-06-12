const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;
let isMemoryDB = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return false; // Not using memory DB
  } catch (error) {
    console.log(`Failed to connect to ${process.env.MONGO_URI} (${error.message}).`);
    console.log('Falling back to In-Memory MongoDB Server...');
    
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      const memoryConn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${memoryConn.connection.host}`);
      isMemoryDB = true;
      return true; // Using memory DB
    } catch (memError) {
      console.error(`In-Memory DB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = { connectDB, isMemoryDB };
