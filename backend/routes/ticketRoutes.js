import express from 'express';
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addMessage,
  updateTicketStatus,
  deleteTicket,
  getUnreadCount
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadTicketImages } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, uploadTicketImages, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/unread-count', protect, getUnreadCount);
router.get('/all', protect, authorize('admin'), getAllTickets);
router.get('/:id', protect, getTicketById);
router.post('/:id/message', protect, uploadTicketImages, addMessage);
router.put('/:id/status', protect, authorize('admin'), updateTicketStatus);
router.delete('/:id', protect, authorize('admin'), deleteTicket);

export default router;
