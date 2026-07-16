import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: '7d',

  // FedaPay
  fedapayApiKey: process.env.FEDAPAY_API_KEY || '',
  fedapaySecretKey: process.env.FEDAPAY_SECRET_KEY || '',
  fedapayMode: process.env.FEDAPAY_MODE || 'sandbox',

  // SMS (Twilio)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

  // OTP
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 3,
  otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN) || 60,
};
