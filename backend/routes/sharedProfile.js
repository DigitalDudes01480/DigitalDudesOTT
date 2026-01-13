import express from 'express';
import {
  generateSharedProfileCode,
  requestSharedProfileCode,
  validateSharedProfileCode,
  getUserSharedProfileCodes,
  getSharedProfileRequests
} from '../controllers/sharedProfileController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/subscriptions/:subscriptionId/generate-code', protect, authorize('admin'), generateSharedProfileCode);
router.get('/requests', protect, authorize('admin'), getSharedProfileRequests);

// Customer routes
router.post('/subscriptions/:subscriptionId/request-code', protect, requestSharedProfileCode);
router.get('/my-codes', protect, getUserSharedProfileCodes);
router.get('/validate/:code', validateSharedProfileCode);

export default router;
