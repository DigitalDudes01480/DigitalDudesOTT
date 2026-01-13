import express from 'express';
import { testEmail, testOrderEmail } from '../controllers/testController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Test email endpoints
router.post('/email', protect, admin, testEmail);
router.post('/order-email', protect, admin, testOrderEmail);

export default router;
