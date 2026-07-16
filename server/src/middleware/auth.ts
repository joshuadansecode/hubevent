import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token manquant');
  }

  const token = header.slice(7);
  const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
  req.user = decoded;
  next();
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError();
    }
    next();
  };
}
