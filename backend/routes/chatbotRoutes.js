import express from 'express';
import { chat, createTicketFromChat, getSuggestions } from '../controllers/chatbotController.js';
import { placeOrderFromChat } from '../controllers/chatbotOrderController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All chatbot routes require authentication
router.use(protect);

// Chat endpoint
router.post('/chat', chat);

// Create ticket from chat
router.post('/create-ticket', createTicketFromChat);

// Place order from chat with receipt upload
router.post('/place-order', upload.single('receipt'), placeOrderFromChat);

// Get contextual suggestions
router.get('/suggestions', getSuggestions);

export default router;
