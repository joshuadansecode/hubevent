import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export class OtpService {
  async generate(phone: string, purpose = 'vote'): Promise<string> {
    const cooldown = await prisma.otpCode.findFirst({
      where: {
        phone,
        purpose,
        usedAt: null,
        createdAt: { gte: new Date(Date.now() - env.otpResendCooldownSeconds * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (cooldown) {
      const remaining = env.otpResendCooldownSeconds - Math.floor((Date.now() - cooldown.createdAt.getTime()) / 1000);
      throw new AppError(429, `Veuillez attendre ${remaining}s avant de renvoyer un code`);
    }

    const code = crypto.randomInt(1000, 9999).toString();

    await prisma.otpCode.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt: new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000),
      },
    });

    await this.sendSms(phone, code);

    return code;
  }

  async verify(phone: string, code: string, purpose = 'vote'): Promise<boolean> {
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        purpose,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new AppError(400, 'Code OTP invalide ou expiré');
    }

    if (otp.attempts >= env.otpMaxAttempts) {
      throw new AppError(429, 'Trop de tentatives. Demandez un nouveau code.');
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date(), attempts: { increment: 1 } },
    });

    return true;
  }

  private async sendSms(phone: string, code: string): Promise<void> {
    if (env.nodeEnv === 'development' || !env.twilioAccountSid) {
      console.log(`[OTP] Code for ${phone}: ${code}`);
      return;
    }

    try {
      const twilioMod: any = await Function('return import("twilio")')();
      const client = twilioMod.default(env.twilioAccountSid, env.twilioAuthToken);
      await client.messages.create({
        body: `HubEvent: votre code de verification est ${code}. Valable ${env.otpExpiryMinutes} min.`,
        from: env.twilioPhoneNumber,
        to: phone,
      });
    } catch {
      console.log(`[OTP] SMS non envoyé (twilio non installé ou pas configuré). Code: ${code}`);
    }
  }
}
