import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class VotePacksService {
  async findByEvent(eventId: string) {
    return prisma.votePack.findMany({ where: { eventId } });
  }

  async findById(id: string) {
    const pack = await prisma.votePack.findUnique({ where: { id } });
    if (!pack) throw new NotFoundError('Pack de votes');
    return pack;
  }

  async create(data: {
    eventId: string;
    name: string;
    votesCount: number;
    priceCFA: number;
  }) {
    const discountPercent = this.calculateDiscount(data.votesCount, data.priceCFA);
    return prisma.votePack.create({ data: { ...data, discountPercent } });
  }

  async update(id: string, data: { name?: string; votesCount?: number; priceCFA?: number }) {
    const existing = await this.findById(id);
    const votesCount = data.votesCount ?? existing.votesCount;
    const priceCFA = data.priceCFA ?? existing.priceCFA;
    const discountPercent = this.calculateDiscount(votesCount, priceCFA);

    return prisma.votePack.update({
      where: { id },
      data: { ...data, discountPercent },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.votePack.delete({ where: { id } });
  }

  private calculateDiscount(votesCount: number, priceCFA: number) {
    const basePrice = votesCount * 100;
    if (basePrice <= 0) return 0;
    return Math.round((1 - priceCFA / basePrice) * 100);
  }
}
