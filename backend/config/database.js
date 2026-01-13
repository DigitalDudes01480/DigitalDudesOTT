import mongoose from 'mongoose';

// Disable buffering globally
mongoose.set('bufferCommands', false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  // Return existing connection if available
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Wait for existing connection attempt
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      // Fall through to create new connection
    }
  }

  try {
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
    };

    console.log('Initiating MongoDB connection...');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    cached.conn = await cached.promise;
    
    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    
    // Add connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return cached.conn;
  } catch (e) {
    console.error('❌ MongoDB connection failed:', {
      message: e.message,
      code: e.code,
      name: e.name
    });
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
};

export default connectDB;
