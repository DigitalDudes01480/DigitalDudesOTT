import express from 'express';
import { protect } from '../middleware/auth.js';
import { addReview, getProductReviews, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

// Public route - get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected routes - require authentication
router.post('/product/:productId', protect, addReview);
router.put('/product/:productId/:reviewId', protect, updateReview);
router.delete('/product/:productId/:reviewId', protect, deleteReview);

export default router;
