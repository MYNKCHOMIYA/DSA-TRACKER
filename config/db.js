const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('example')) {
      console.warn('⚠️  No valid MONGODB_URI set. Running without database.');
      console.warn('   Set MONGODB_URI in .env to enable full functionality.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️  Server running without database. API routes will return errors.');
  }
};

module.exports = connectDB;
