import request from 'supertest';
import app from '../src/app';
import { db } from '../src/config/db';

describe('Auth - Signup Tests', () => {
  beforeEach(() => {
    if (db.resetMockData) {
      db.resetMockData();
    }
  });

  it('1. should successfully sign up with valid details', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Dr. Rajesh Kumar',
        email: 'r.kumar@ndma.gov.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Account created successfully.');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.name).toBe('Dr. Rajesh Kumar');
    expect(res.body.data.user.email).toBe('r.kumar@ndma.gov.in');
    expect(res.body.data.user.password_hash).toBeUndefined();

    // Verify session cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/fw_session=/);
    expect(cookies[0]).toMatch(/HttpOnly/i);
  });

  it('2. should reject empty name', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: '',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter your name.');
  });

  it('3. should reject empty email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid Name',
        email: '',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter your email.');
  });

  it('4. should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid Name',
        email: 'invalid-email-address',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter a valid email address.');
  });

  it('5. should reject empty password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid Name',
        email: 'user@example.com',
        password: '',
        confirmPassword: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter your password.');
  });

  it('6. should reject weak/short password (< 8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid Name',
        email: 'user@example.com',
        password: '123',
        confirmPassword: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Password must be at least 8 characters.');
  });

  it('7. should reject empty confirm password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid Name',
        email: 'user@example.com',
        password: 'Password123!',
        confirmPassword: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please confirm your password.');
  });

  it('8. should reject password mismatch', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid Name',
        email: 'user@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Passwords do not match.');
  });

  it('9. should reject duplicate signup with existing email', async () => {
    // First signup
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Initial User',
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    // Duplicate signup
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Second User',
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('An account with this email already exists.');
  });

  it('10. should reject duplicate email case-insensitively', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Case User',
        email: 'case@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Case User 2',
        email: 'CASE@EXAMPLE.COM',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('An account with this email already exists.');
  });

  it('11. should validate minimum name length', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'A',
        email: 'a@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Name must be at least 2 characters.');
  });

  it('12. should never expose password hashes in signup response', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Safe User',
        email: 'safe@example.com',
        password: 'SuperSecretPassword123!',
        confirmPassword: 'SuperSecretPassword123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('SuperSecretPassword123!');
  });
});
