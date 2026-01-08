import express from 'express';
import {
  getMySubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  updateSubscription,
  cancelSubscription
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-subscriptions', protect, getMySubscriptions);
router.get('/all', protect, authorize('admin'), getAllSubscriptions);
router.get('/:id', protect, getSubscriptionById);
router.put('/:id', protect, authorize('admin'), updateSubscription);
router.put('/:id/cancel', protect, cancelSubscription);

export default router;
