const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI); // helpful log
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // const conn = await mongoose.connect("mongodb+srv://fundora_admin:FundoraBase%402020cluster0.okfrx9i.mongodb.net/fundoraDB?retryWrites=true&w=majority&appName=Cluster0");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
