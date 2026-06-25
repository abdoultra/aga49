const mongoose = require("mongoose");

const connectDB = async (mongoUri = process.env.MONGO_URI) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
