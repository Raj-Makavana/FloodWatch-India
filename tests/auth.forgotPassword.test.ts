import request from 'supertest';
import app from '../src/app';
import { db } from '../src/config/db';
import { otpService } from '../src/services/otpService';

describe('Auth - OTP Forgot Password & Reset Tests', () => {
  const initialPassword = 'InitialOldPassword123!';

  beforeEach(async () => {
    if (db.resetMockData) {
      db.resetMockData();
    }

    // Register a test user
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Field Analyst',
        email: 'analyst@floodwatch.org',
        password: initialPassword,
        confirmPassword: initialPassword,
      });
  });

  it('1. should successfully send OTP for registered email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'analyst@floodwatch.org',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('6-digit OTP has been sent');
  });

  it('2. should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'unknown@example.com',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No account found');
  });

  it('3. should verify valid OTP code', async () => {
    // 1. Request OTP
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'analyst@floodwatch.org' });

    // Extract generated code from store
    const generatedCode = (otpService as any).otpStore.get('analyst@floodwatch.org:reset_password')?.code;
    expect(generatedCode).toBeDefined();

    // 2. Verify with correct code
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'analyst@floodwatch.org',
        otp: generatedCode,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.message).toBe('OTP verified successfully.');
    expect(verifyRes.body.resetToken).toBeDefined();
  });

  it('4. should reject invalid OTP code', async () => {
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'analyst@floodwatch.org' });

    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'analyst@floodwatch.org',
        otp: '000000',
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.success).toBe(false);
    expect(verifyRes.body.message).toContain('Invalid OTP');
  });

  it('5. should reject resetting password with the OLD password', async () => {
    // 1. Send & verify OTP
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'analyst@floodwatch.org' });

    const code = (otpService as any).otpStore.get('analyst@floodwatch.org:reset_password')?.code;

    await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'analyst@floodwatch.org', otp: code });

    // 2. Attempt to use OLD password as NEW password
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'analyst@floodwatch.org',
        newPassword: initialPassword,
        confirmPassword: initialPassword,
      });

    expect(resetRes.status).toBe(400);
    expect(resetRes.body.success).toBe(false);
    expect(resetRes.body.message).toContain('New password cannot be the same as your old password');
  });

  it('6. should successfully update password with a different new password', async () => {
    // 1. Send & verify OTP
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'analyst@floodwatch.org' });

    const code = (otpService as any).otpStore.get('analyst@floodwatch.org:reset_password')?.code;

    await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'analyst@floodwatch.org', otp: code });

    // 2. Set distinct new password
    const newPassword = 'BrandNewSecurePassword2026!';
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'analyst@floodwatch.org',
        newPassword,
        confirmPassword: newPassword,
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
    expect(resetRes.body.message).toContain('Password reset successfully');

    // 3. Verify user can log in with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'analyst@floodwatch.org',
        password: newPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });
});
