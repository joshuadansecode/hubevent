import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { AppError } from '../utils/errors';

export class AuthService {
  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Cet email est déjà utilisé');

    const password = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { ...data, password, role: 'public' },
      select: { id: true, email: true, name: true, role: true },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Email ou mot de passe incorrect');

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, organizerId: user.organizerId };
    const token = this.generateToken(payload);

    return { user: payload, token };
  }

  private generateToken(user: { id: string; email: string; name: string; role: string; organizerId?: string | null }) {
    const payload: JwtPayload = { userId: user.id, role: user.role as JwtPayload['role'], organizerId: user.organizerId };
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as any);
  }
}
