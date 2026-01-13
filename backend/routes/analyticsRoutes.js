import express from 'express';
import {
  getAnalytics,
  getRevenueAnalytics,
  getCouponAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAnalytics);
router.get('/revenue', getRevenueAnalytics);
router.get('/coupons', getCouponAnalytics);

export default router;
