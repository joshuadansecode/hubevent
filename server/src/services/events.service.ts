import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { EventStatus } from '@prisma/client';

export class EventsService {
  async findAll(filters?: { country?: string; status?: EventStatus }) {
    return prisma.event.findMany({
      where: {
        ...(filters?.country && { country: filters.country }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { _count: { select: { categories: true, candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        categories: { include: { _count: { select: { candidates: true } } } },
        candidates: { orderBy: { votesCount: 'desc' } },
        votePacks: true,
      },
    });
    if (!event) throw new NotFoundError('Événement');
    return event;
  }

  async create(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    posterUrl?: string;
    country?: string;
    city?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    voteStartDate?: string;
    voteEndDate?: string;
    isAccompanied?: boolean;
    votePriceCFA?: number;
    organizerId?: string;
    organizerName?: string;
  }) {
    return prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
        posterUrl: data.posterUrl,
        country: data.country,
        city: data.city,
        location: data.location,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        voteStartDate: data.voteStartDate ? new Date(data.voteStartDate) : null,
        voteEndDate: data.voteEndDate ? new Date(data.voteEndDate) : null,
        isAccompanied: data.isAccompanied ?? false,
        votePriceCFA: data.votePriceCFA,
        organizerId: data.organizerId,
        organizerName: data.organizerName,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findById(id);
    return prisma.event.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.event.delete({ where: { id } });
  }
}
