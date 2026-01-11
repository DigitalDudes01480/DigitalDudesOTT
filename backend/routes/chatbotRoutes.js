import express from 'express';
import { chat, createTicketFromChat, getSuggestions } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chatbot routes require authentication
router.use(protect);

// Chat endpoint
router.post('/chat', chat);

// Create ticket from chat
router.post('/create-ticket', createTicketFromChat);

// Get contextual suggestions
router.get('/suggestions', getSuggestions);

export default router;
