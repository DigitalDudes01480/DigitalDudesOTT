import mongoose from 'mongoose';

let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

  if (!process.env.MONGODB_URI) {
    const err = new Error('MONGODB_URI is not set');
    console.error(err.message);
    if (!isVercel) process.exit(1);
    throw err;
  }

  if (cached.conn) return cached.conn;

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const conn = await cached.promise;
    cached.conn = conn;

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (!isVercel) process.exit(1);
    cached.promise = null;
    throw error;
  }
};

export default connectDB;
