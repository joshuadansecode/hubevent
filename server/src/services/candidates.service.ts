import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class CandidatesService {
  async findByEvent(eventId: string) {
    return prisma.candidate.findMany({
      where: { eventId },
      orderBy: { votesCount: 'desc' },
    });
  }

  async findByCategory(categoryId: string) {
    return prisma.candidate.findMany({
      where: { categoryId },
      orderBy: { votesCount: 'desc' },
    });
  }

  async findById(id: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { category: true, event: { select: { name: true } } },
    });
    if (!candidate) throw new NotFoundError('Candidat');
    return candidate;
  }

  async create(data: {
    categoryId: string;
    eventId: string;
    name: string;
    photoUrl?: string;
    gallery?: string[];
    videoUrl?: string;
    bio?: string;
    presentation?: string;
    community?: string;
    project?: string;
    socialLinks?: Record<string, string>;
  }) {
    return prisma.candidate.create({
      data: {
        ...data,
        gallery: JSON.stringify(data.gallery ?? []),
        socialLinks: data.socialLinks ?? {},
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findById(id);
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = JSON.stringify(data.gallery);
    }
    return prisma.candidate.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.candidate.delete({ where: { id } });
  }
}
