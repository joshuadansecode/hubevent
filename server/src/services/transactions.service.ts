import { prisma } from '../config/database';
import { NotFoundError, AppError } from '../utils/errors';
import { OtpService } from './otp.service';
import { FedaPayService } from './fedapay.service';

const COMMISSION_RATE = 0.07;
const otpService = new OtpService();
const fedapayService = new FedaPayService();

export class TransactionsService {
  async findAll(filters?: { eventId?: string; status?: string }) {
    return prisma.transaction.findMany({
      where: {
        ...(filters?.eventId && { eventId: filters.eventId }),
        ...(filters?.status && { status: filters.status as any }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundError('Transaction');
    return tx;
  }

  async initiate(data: {
    eventId: string;
    candidateId: string;
    buyerName: string;
    buyerPhone: string;
    amountCFA: number;
    votesCount: number;
    paymentMethod: string;
    packName?: string;
    userId?: string;
  }) {
    const commissionCFA = Math.round(data.amountCFA * COMMISSION_RATE);
    const organizerShareCFA = data.amountCFA - commissionCFA;

    const event = await prisma.event.findUnique({ where: { id: data.eventId }, select: { name: true } });
    if (!event) throw new NotFoundError('Événement');

    const candidate = await prisma.candidate.findUnique({ where: { id: data.candidateId }, select: { name: true } });
    if (!candidate) throw new NotFoundError('Candidat');

    const tx = await prisma.transaction.create({
      data: {
        ...data,
        eventName: event.name,
        candidateName: candidate.name,
        commissionCFA,
        organizerShareCFA,
        status: 'en_attente',
      },
    });

    if (data.paymentMethod === 'mobile_money') {
      const code = await otpService.generate(data.buyerPhone, 'vote');
      return { transaction: tx, otpRequired: true, message: 'Code OTP envoyé par SMS' };
    }

    const checkout = await fedapayService.createCheckout({
      amount: data.amountCFA,
      description: `Vote pour ${candidate.name} - ${event.name}`,
      callbackUrl: `${process.env.APP_URL || 'http://localhost:4000'}/api/transactions/webhook`,
      reference: tx.id,
      customerName: data.buyerName,
      customerPhone: data.buyerPhone,
    });

    return { transaction: tx, checkoutUrl: checkout.url };
  }

  async verifyOtp(transactionId: string, otpCode: string) {
    const tx = await this.findById(transactionId);
    if (tx.status !== 'en_attente') throw new AppError(400, 'Transaction déjà traitée');

    await otpService.verify(tx.buyerPhone, otpCode, 'vote');

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { otpVerified: true },
    });

    if (tx.paymentMethod === 'mobile_money') {
      return this.confirmPayment(transactionId);
    }

    return { message: 'OTP vérifié, vous pouvez procéder au paiement' };
  }

  async confirmPayment(id: string) {
    const tx = await this.findById(id);
    if (tx.status !== 'en_attente') throw new AppError(400, 'Transaction déjà traitée');

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: 'confirme' },
    });

    await prisma.candidate.update({
      where: { id: tx.candidateId },
      data: { votesCount: { increment: tx.votesCount } },
    });

    return updated;
  }

  async failPayment(id: string) {
    await this.findById(id);
    return prisma.transaction.update({
      where: { id },
      data: { status: 'echoue' },
    });
  }

  async handleWebhook(payload: { reference: string; status: string }) {
    const tx = await this.findById(payload.reference);
    if (!tx) throw new NotFoundError('Transaction');

    if (payload.status === 'approved' || payload.status === 'accepted') {
      return this.confirmPayment(tx.id);
    }

    return this.failPayment(tx.id);
  }

  async getStats(eventId?: string) {
    const where = eventId ? { eventId, status: 'confirme' as const } : { status: 'confirme' as const };

    const result = await prisma.transaction.aggregate({
      where,
      _sum: { amountCFA: true, commissionCFA: true, organizerShareCFA: true, votesCount: true },
      _count: true,
    });

    return {
      totalVolumeCFA: result._sum.amountCFA ?? 0,
      totalCommissionCFA: result._sum.commissionCFA ?? 0,
      totalOrganizerShareCFA: result._sum.organizerShareCFA ?? 0,
      totalVotes: result._sum.votesCount ?? 0,
      totalTransactions: result._count,
    };
  }
}
