import { Router } from 'express';
import { VotePacksController } from '../controllers/votePacks.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const ctrl = new VotePacksController();

router.get('/event/:eventId', ctrl.findByEvent.bind(ctrl));
router.post('/', authenticate, authorize('admin', 'organizer'), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('admin', 'organizer'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('admin', 'organizer'), ctrl.delete.bind(ctrl));

export default router;
