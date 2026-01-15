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
  deleteOrderAdmin
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('receipt'), createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/lookup/:customerCode', getOrderByCustomerCode);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, authorize('admin'), updateOrderAdmin);
router.delete('/:id', protect, authorize('admin'), deleteOrderAdmin);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/deliver', protect, authorize('admin'), deliverOrder);
router.put('/:id/payment', protect, authorize('admin'), updatePaymentStatus);
router.post('/local', protect, authorize('admin'), createLocalOrder);

export default router;
