import express from 'express';
import {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  getAllTransactions,
  updateTransactionStatus,
  refundTransaction
} from '../controllers/transactionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/my-transactions', protect, getMyTransactions);
router.get('/all', protect, authorize('admin'), getAllTransactions);
router.get('/:id', protect, getTransactionById);
router.put('/:id/status', protect, authorize('admin'), updateTransactionStatus);
router.put('/:id/refund', protect, authorize('admin'), refundTransaction);

export default router;
