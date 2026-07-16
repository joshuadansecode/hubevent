import { Response, NextFunction } from 'express';
import { CandidatesService } from '../services/candidates.service';
import { AuthRequest } from '../types';

const candidatesService = new CandidatesService();

export class CandidatesController {
  async findByEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidates = await candidatesService.findByEvent(req.params.eventId);
      res.json(candidates);
    } catch (err) { next(err); }
  }

  async findByCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidates = await candidatesService.findByCategory(req.params.categoryId);
      res.json(candidates);
    } catch (err) { next(err); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await candidatesService.findById(req.params.id);
      res.json(candidate);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await candidatesService.create(req.body);
      res.status(201).json(candidate);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await candidatesService.update(req.params.id, req.body);
      res.json(candidate);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await candidatesService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}
