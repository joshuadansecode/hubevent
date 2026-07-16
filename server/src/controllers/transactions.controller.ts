import { Response, NextFunction } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { AuthRequest } from '../types';

const transactionsService = new TransactionsService();

export class TransactionsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, status } = req.query as any;
      const txs = await transactionsService.findAll({ eventId, status });
      res.json(txs);
    } catch (err) { next(err); }
  }

  async initiate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionsService.initiate({
        ...req.body,
        userId: req.user?.userId,
      });
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async verifyOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { otpCode } = req.body;
      const result = await transactionsService.verifyOtp(req.params.id, otpCode);
      res.json(result);
    } catch (err) { next(err); }
  }

  async confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tx = await transactionsService.confirmPayment(req.params.id);
      res.json(tx);
    } catch (err) { next(err); }
  }

  async handleWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionsService.handleWebhook(req.body);
      res.json({ received: true, transaction: result });
    } catch (err) { next(err); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await transactionsService.getStats(req.query.eventId as string);
      res.json(stats);
    } catch (err) { next(err); }
  }
}
