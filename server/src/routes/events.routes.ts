import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const ctrl = new EventsController();

router.get('/', ctrl.findAll.bind(ctrl));
router.get('/:id', ctrl.findById.bind(ctrl));
router.post('/', authenticate, authorize('admin', 'organizer'), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('admin', 'organizer'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('admin'), ctrl.delete.bind(ctrl));

export default router;
