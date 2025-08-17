import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use environment variable or fallback to local database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tazkartiApp';
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected to:", mongoUri);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
