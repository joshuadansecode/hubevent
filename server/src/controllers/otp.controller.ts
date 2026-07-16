import { Response, NextFunction } from 'express';
import { OtpService } from '../services/otp.service';
import { AuthRequest } from '../types';

const otpService = new OtpService();

export class OtpController {
  async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phone, purpose } = req.body;
      const code = await otpService.generate(phone, purpose || 'vote');
      res.json({ message: 'Code envoyé', code: process.env.NODE_ENV === 'development' ? code : undefined });
    } catch (err) { next(err); }
  }

  async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phone, code, purpose } = req.body;
      await otpService.verify(phone, code, purpose || 'vote');
      res.json({ message: 'Code vérifié avec succès' });
    } catch (err) { next(err); }
  }
}
