import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, googleAuth, googleCallback, facebookAuth, facebookCallback } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Facebook OAuth routes
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

export default router;
