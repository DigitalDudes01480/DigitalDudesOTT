import express from 'express';
import {
  getDashboardStats,
  getAllCustomers,
  toggleCustomerStatus,
  getCustomerDetails
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerDetails);
router.put('/customers/:id/toggle-status', toggleCustomerStatus);

export default router;
