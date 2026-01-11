import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createTutorial, deleteTutorial, getTutorials, updateTutorial } from '../controllers/tutorialController.js';

const router = express.Router();

router.get('/', getTutorials);
router.post('/', protect, authorize('admin'), createTutorial);
router.put('/:id', protect, authorize('admin'), updateTutorial);
router.delete('/:id', protect, authorize('admin'), deleteTutorial);

export default router;
