import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getCouponStats
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (require authentication)
router.post('/validate', protect, validateCoupon);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllCoupons)
  .post(createCoupon);

router.get('/stats', getCouponStats);

router.route('/:id')
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

router.post('/apply', applyCoupon);

export default router;
