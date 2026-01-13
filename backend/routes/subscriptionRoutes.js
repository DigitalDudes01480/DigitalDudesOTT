import express from 'express';
import {
  getMySubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  updateSubscription,
  cancelSubscription,
  requestSignInCode,
  sendSignInCode,
  getSignInCodeRequests
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-subscriptions', protect, getMySubscriptions);
router.get('/all', protect, authorize('admin'), getAllSubscriptions);
router.get('/sign-in-requests', protect, authorize('admin'), getSignInCodeRequests);
router.get('/:id', protect, getSubscriptionById);
router.put('/:id', protect, authorize('admin'), updateSubscription);
router.put('/:id/cancel', protect, cancelSubscription);
router.post('/:id/request-signin-code', protect, requestSignInCode);
router.post('/send-signin-code', protect, authorize('admin'), sendSignInCode);

export default router;
