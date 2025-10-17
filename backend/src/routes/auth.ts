import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, markTourVisto, getTourStatus } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/mark-tour-visto', authenticate, markTourVisto);
router.get('/tour-status', authenticate, getTourStatus);

export default router;
