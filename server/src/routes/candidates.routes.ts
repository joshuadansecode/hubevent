import { Router } from 'express';
import { CandidatesController } from '../controllers/candidates.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const ctrl = new CandidatesController();

router.get('/event/:eventId', ctrl.findByEvent.bind(ctrl));
router.get('/category/:categoryId', ctrl.findByCategory.bind(ctrl));
router.get('/:id', ctrl.findById.bind(ctrl));
router.post('/', authenticate, authorize('admin', 'organizer'), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('admin', 'organizer'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('admin', 'organizer'), ctrl.delete.bind(ctrl));

export default router;
