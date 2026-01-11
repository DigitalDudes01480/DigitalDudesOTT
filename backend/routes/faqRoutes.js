import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createFaq, deleteFaq, getFaqs, updateFaq } from '../controllers/faqController.js';

const router = express.Router();

router.get('/', getFaqs);
router.post('/', protect, authorize('admin'), createFaq);
router.put('/:id', protect, authorize('admin'), updateFaq);
router.delete('/:id', protect, authorize('admin'), deleteFaq);

export default router;
