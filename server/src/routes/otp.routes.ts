import { Router } from 'express';
import { OtpController } from '../controllers/otp.controller';

const router = Router();
const ctrl = new OtpController();

router.post('/send', ctrl.send.bind(ctrl));
router.post('/verify', ctrl.verify.bind(ctrl));

export default router;
