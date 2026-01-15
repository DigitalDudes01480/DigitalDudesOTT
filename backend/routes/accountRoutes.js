import express from 'express';
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  renewAccount,
  getExpiringSoon
} from '../controllers/accountController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/expiring-soon', getExpiringSoon);
router.get('/', getAllAccounts);
router.post('/', createAccount);
router.get('/:id', getAccountById);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);
router.put('/:id/renew', renewAccount);

export default router;
