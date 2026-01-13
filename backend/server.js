import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { checkExpiredSubscriptions } from './controllers/subscriptionController.js';
import passport from './config/passport.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import tutorialRoutes from './routes/tutorialRoutes.js';
import orderAssistantRoutes from './routes/orderAssistantRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import testRoutes from './routes/testRoutes.js';
import sharedProfileRoutes from './routes/sharedProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in production, just log
});

const app = express();

// Connect to database at startup - don't block server startup
connectDB()
  .then(() => console.log('Database connection initialized successfully'))
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    // Don't exit - let Railway restart the service
  });

// For Vercel serverless, ensure connection before each request
if (isVercel) {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error('Request DB connection error:', err.message);
      return res.status(503).json({ 
        success: false, 
        message: 'Database temporarily unavailable. Please try again.' 
      });
    }
  });
} else {
  // For Railway/traditional hosting, add a simple health check
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://www.digitaldudesott.shop',
      'https://digitaldudesott.shop',
      'https://frontend-virid-nu-28.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin) {
      return callback(null, true);
    }

    if (
      origin.startsWith('capacitor://') ||
      origin.startsWith('ionic://') ||
      origin.startsWith('http://localhost') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Dudes API is running',
    version: '1.0.0'
  });
});

app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GITHUB_COMMIT_SHA || null,
    config: {
      frontendUrlConfigured: Boolean(process.env.FRONTEND_URL),
      backendUrlConfigured: Boolean(process.env.BACKEND_URL),
      email: {
        sesConfigured:
          Boolean(process.env.AWS_ACCESS_KEY_ID) &&
          Boolean(process.env.AWS_SECRET_ACCESS_KEY) &&
          Boolean(process.env.EMAIL_FROM),
        resendConfigured: Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.EMAIL_FROM),
        smtpConfigured:
          Boolean(process.env.EMAIL_HOST) &&
          Boolean(process.env.EMAIL_USER) &&
          Boolean(process.env.EMAIL_PASSWORD) &&
          Boolean(process.env.EMAIL_FROM)
      },
      oauth: {
        googleConfigured:
          Boolean(process.env.GOOGLE_CLIENT_ID) &&
          Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
          Boolean(process.env.BACKEND_URL) &&
          Boolean(process.env.FRONTEND_URL),
        facebookConfigured:
          Boolean(process.env.FACEBOOK_APP_ID) &&
          Boolean(process.env.FACEBOOK_APP_SECRET) &&
          Boolean(process.env.BACKEND_URL) &&
          Boolean(process.env.FRONTEND_URL)
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/order-assistant', orderAssistantRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

// Test routes
app.use('/api/test', testRoutes);

// Shared profile routes
app.use('/api/shared-profile', sharedProfileRoutes);

app.use(errorHandler);

// Always start server for Railway and other platforms
const PORT = process.env.PORT || 5001;

// Start server immediately - don't wait for anything
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 API ready at: http://localhost:${PORT}/api`);
  console.log(`📱 Health check at: http://localhost:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export default app;
