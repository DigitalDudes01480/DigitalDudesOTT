import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deliverOrder,
  updatePaymentStatus,
  createLocalOrder,
  getOrderByCustomerCode,
  updateOrderAdmin,
  deleteOrderAdmin,
  updateOrderCredentials
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Specific routes first (before dynamic :id routes)
router.post('/', protect, upload.single('receipt'), createOrder);
router.post('/local', protect, authorize('admin'), createLocalOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/lookup/:customerCode', getOrderByCustomerCode);

// Dynamic :id routes last
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, authorize('admin'), updateOrderAdmin);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/deliver', protect, authorize('admin'), deliverOrder);
router.put('/:id/payment', protect, authorize('admin'), updatePaymentStatus);
router.put('/:id/credentials', protect, authorize('admin'), updateOrderCredentials);
router.delete('/:id', protect, authorize('admin'), deleteOrderAdmin);

export default router;
