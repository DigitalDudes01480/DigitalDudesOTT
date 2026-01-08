import express from 'express';
import {
  createStripePaymentIntent,
  confirmStripePayment,
  createPayPalOrder,
  capturePayPalOrder,
  getStripeConfig,
  getPayPalConfig
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/stripe/config', getStripeConfig);
router.get('/paypal/config', getPayPalConfig);
router.post('/stripe/create-intent', protect, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);
router.post('/paypal/create-order', protect, createPayPalOrder);
router.post('/paypal/capture-order', protect, capturePayPalOrder);

export default router;
