export interface OtpRecord {
  id: string;
  email: string;
  code: string;
  type: 'signup' | 'login' | 'reset_password';
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  lastSentAt: Date;
  verified: boolean;
}

export class OtpService {
  private otpStore: Map<string, OtpRecord> = new Map();
  private readonly DEFAULT_EXPIRATION_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly RESEND_COOLDOWN_SECONDS = 30;

  async generateOtp(email: string, type: 'signup' | 'login' | 'reset_password'): Promise<string> {
    const key = `${email.toLowerCase()}:${type}`;
    const now = new Date();

    const existing = this.otpStore.get(key);
    if (existing && !existing.verified) {
      const elapsedSeconds = (now.getTime() - existing.lastSentAt.getTime()) / 1000;
      if (elapsedSeconds < this.RESEND_COOLDOWN_SECONDS) {
        throw new Error(`Please wait ${Math.ceil(this.RESEND_COOLDOWN_SECONDS - elapsedSeconds)}s before requesting a new OTP.`);
      }
    }

    // Generate cryptographically secure 6-digit numeric OTP (100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + this.DEFAULT_EXPIRATION_MINUTES * 60 * 1000);

    const record: OtpRecord = {
      id: key,
      email: email.toLowerCase(),
      code,
      type,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      expiresAt,
      lastSentAt: now,
      verified: false,
    };

    this.otpStore.set(key, record);
    return code;
  }

  async verifyOtp(
    email: string,
    code: string,
    type: 'signup' | 'login' | 'reset_password'
  ): Promise<{ success: boolean; message: string }> {
    const key = `${email.toLowerCase()}:${type}`;
    const record = this.otpStore.get(key);

    if (!record) {
      throw new Error('No active OTP found. Please request a new verification code.');
    }

    if (new Date() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new Error('OTP has expired. Please request a new code.');
    }

    if (record.attempts >= record.maxAttempts) {
      this.otpStore.delete(key);
      throw new Error('Too many invalid attempts. Please request a new OTP.');
    }

    record.attempts += 1;

    if (record.code !== code.trim()) {
      const remaining = record.maxAttempts - record.attempts;
      throw new Error(`Invalid OTP code. ${remaining} attempt(s) remaining.`);
    }

    record.verified = true;
    return { success: true, message: 'OTP verified successfully.' };
  }

  isVerified(email: string, type: 'signup' | 'login' | 'reset_password'): boolean {
    const key = `${email.toLowerCase()}:${type}`;
    const record = this.otpStore.get(key);
    return Boolean(record && record.verified && new Date() <= record.expiresAt);
  }

  consumeOtp(email: string, type: 'signup' | 'login' | 'reset_password'): void {
    const key = `${email.toLowerCase()}:${type}`;
    this.otpStore.delete(key);
  }
}

export const otpService = new OtpService();
