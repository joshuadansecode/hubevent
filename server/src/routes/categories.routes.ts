import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const ctrl = new CategoriesController();

router.get('/event/:eventId', ctrl.findByEvent.bind(ctrl));
router.get('/:id', ctrl.findById.bind(ctrl));
router.post('/', authenticate, authorize('admin', 'organizer'), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('admin', 'organizer'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('admin', 'organizer'), ctrl.delete.bind(ctrl));

export default router;
