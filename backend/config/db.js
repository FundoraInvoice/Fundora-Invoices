const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI); // helpful log
    const conn = await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
