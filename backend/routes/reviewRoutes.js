import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addReview, getProductReviews, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

// Public route - get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected routes - require authentication
router.post('/product/:productId', verifyJWT, addReview);
router.put('/product/:productId/:reviewId', verifyJWT, updateReview);
router.delete('/product/:productId/:reviewId', verifyJWT, deleteReview);

export default router;
