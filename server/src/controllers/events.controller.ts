import { Response, NextFunction } from 'express';
import { EventsService } from '../services/events.service';
import { AuthRequest } from '../types';

const eventsService = new EventsService();

export class EventsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { country, status } = req.query as any;
      const events = await eventsService.findAll({ country, status });
      res.json(events);
    } catch (err) { next(err); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventsService.findById(req.params.id);
      res.json(event);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, organizerId: req.user?.userId };
      const event = await eventsService.create(data);
      res.status(201).json(event);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventsService.update(req.params.id, req.body);
      res.json(event);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventsService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}
