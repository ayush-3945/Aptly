const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Disable Mongoose buffering so operations NEVER wait 10 seconds when DB is offline!
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('?? MONGO_URI environment variable is not defined!');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`?? MongoDB Connection Issue: ${error.message}`);
    if (error.message.includes('authentication failed')) {
      console.warn('?? Tip: Check your MongoDB Atlas password for the DB user in .env');
    }
  }
};

module.exports = connectDB;
