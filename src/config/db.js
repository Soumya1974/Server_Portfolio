import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not set. Please specify a connection string in server/.env.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
  } catch (error) {
    console.error(`Mongodb connection error: ${error.message}`);
    console.warn('Server will remain running, but database operations may fail until MongoDB is connected.');
  }
}
