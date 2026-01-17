import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  checkWishlistStatus, 
  clearWishlist 
} from '../controllers/wishlistController.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', getWishlist);

// Add product to wishlist
router.post('/product/:productId', addToWishlist);

// Remove product from wishlist
router.delete('/product/:productId', removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlistStatus);

// Clear entire wishlist
router.delete('/clear', clearWishlist);

export default router;
