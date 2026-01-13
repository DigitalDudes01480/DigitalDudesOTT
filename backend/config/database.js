import mongoose from 'mongoose';

let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    console.log('Waiting for existing database connection');
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  try {
    console.log('Creating new database connection...');
    
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    cached.conn = await cached.promise;

    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    cached.promise = null;
    cached.conn = null;
    if (!isVercel) process.exit(1);
    throw error;
  }
};

export default connectDB;
