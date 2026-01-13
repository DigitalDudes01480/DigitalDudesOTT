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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

const app = express();

// Connect to database at startup and ensure connection before handling requests
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('Database connection initialized successfully');
  } catch (err) {
    console.error('Failed to connect to database:', err);
    if (!isVercel) {
      process.exit(1);
    }
  }
};

// Initialize database connection
initializeDatabase();

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
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://www.digitaldudesott.shop',
      'https://frontend-cbve2o2m3-digitaldudes01480s-projects.vercel.app',
      'https://frontend-virid-nu-28.vercel.app',
      'https://frontend-virid-nu-28-psi.vercel.app'
    ];
    
    // Allow requests from Capacitor app and mobile schemes
    if (!origin || origin.startsWith('capacitor://') || origin.startsWith('ionic://') || origin.startsWith('http://localhost') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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

app.use(errorHandler);

if (!isVercel) {
  setInterval(() => {
    checkExpiredSubscriptions();
  }, 24 * 60 * 60 * 1000);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    checkExpiredSubscriptions();
  });
}

export default app;
