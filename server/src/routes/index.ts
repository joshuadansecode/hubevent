import { Router } from 'express';
import authRoutes from './auth.routes';
import eventsRoutes from './events.routes';
import categoriesRoutes from './categories.routes';
import candidatesRoutes from './candidates.routes';
import votePacksRoutes from './votePacks.routes';
import transactionsRoutes from './transactions.routes';
import otpRoutes from './otp.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/candidates', candidatesRoutes);
router.use('/vote-packs', votePacksRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/otp', otpRoutes);

export default router;
