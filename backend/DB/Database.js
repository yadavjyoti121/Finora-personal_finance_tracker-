// import mongoose from "mongoose";

// export const connectDB = async (req, res) => {
//     const db = process.env.MONGO_URL;

//     const {connection} = await mongoose.connect(db, { useNewUrlParser: true });

//     console.log(`MongoDB Connected to ${connection.host}`);

// }
// ...existing code...


// import dotenv from "dotenv";
// dotenv.config({ path: ".env" })
// import mongoose from 'mongoose';

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      tlsAllowInvalidCertificates: true, // only for local testing
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // stop the app if DB connection fails
  }
};

export default connectDB;


// export const connectDB = async () => {
//     const db = process.env.MONGO_URL;
//     if (!db) {
//         console.error("MONGO_URL is not set. Create backend/config/config.env and set MONGO_URL.");
//         throw new Error("Missing MONGO_URL environment variable");
//     }

//     const { connection } = await mongoose.connect(db);
//     console.log(`MongoDB Connected to ${connection.host}`);
// }