import { Response, NextFunction } from 'express';
import { VotePacksService } from '../services/votePacks.service';
import { AuthRequest } from '../types';

const votePacksService = new VotePacksService();

export class VotePacksController {
  async findByEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const packs = await votePacksService.findByEvent(req.params.eventId);
      res.json(packs);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pack = await votePacksService.create(req.body);
      res.status(201).json(pack);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pack = await votePacksService.update(req.params.id, req.body);
      res.json(pack);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await votePacksService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}
