import { Response, NextFunction } from 'express';
import { CategoriesService } from '../services/categories.service';
import { AuthRequest } from '../types';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async findByEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cats = await categoriesService.findByEvent(req.params.eventId);
      res.json(cats);
    } catch (err) { next(err); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cat = await categoriesService.findById(req.params.id);
      res.json(cat);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cat = await categoriesService.create(req.body);
      res.status(201).json(cat);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cat = await categoriesService.update(req.params.id, req.body);
      res.json(cat);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await categoriesService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}
