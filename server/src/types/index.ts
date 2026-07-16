import { Request } from 'express';

export type UserRole = 'admin' | 'organizer' | 'public';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  organizerId?: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
