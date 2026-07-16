import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new TransactionsController();

router.get('/', authenticate, ctrl.findAll.bind(ctrl));
router.get('/stats', authenticate, ctrl.getStats.bind(ctrl));
router.post('/initiate', ctrl.initiate.bind(ctrl));
router.post('/:id/verify-otp', ctrl.verifyOtp.bind(ctrl));
router.post('/:id/confirm', authenticate, ctrl.confirmPayment.bind(ctrl));
router.post('/webhook', ctrl.handleWebhook.bind(ctrl));

export default router;
