import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { VoteType } from '@prisma/client';

export class CategoriesService {
  async findByEvent(eventId: string) {
    return prisma.category.findMany({
      where: { eventId },
      include: { _count: { select: { candidates: true } } },
    });
  }

  async findById(id: string) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { candidates: { orderBy: { votesCount: 'desc' } } },
    });
    if (!cat) throw new NotFoundError('Catégorie');
    return cat;
  }

  async create(data: {
    eventId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    voteType?: VoteType;
    maxCandidates?: number;
  }) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findById(id);
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.category.delete({ where: { id } });
  }
}
