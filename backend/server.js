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

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-cbve2o2m3-digitaldudes01480s-projects.vercel.app',
    'https://frontend-virid-nu-28.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

setInterval(() => {
  checkExpiredSubscriptions();
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  checkExpiredSubscriptions();
});

export default app;
