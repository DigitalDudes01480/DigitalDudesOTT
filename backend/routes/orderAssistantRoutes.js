import express from 'express';
import { chat, uploadReceipt, resetConversation } from '../controllers/orderAssistantController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public chat endpoint (no auth required for guest users)
router.post('/chat', chat);

// Upload receipt and create order
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);

// Reset conversation
router.post('/reset', resetConversation);

export default router;
