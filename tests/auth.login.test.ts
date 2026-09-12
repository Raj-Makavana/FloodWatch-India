import request from 'supertest';
import app from '../src/app';
import { db } from '../src/config/db';

describe('Auth - Login & Session Tests', () => {
  const testUser = {
    name: 'Command Officer',
    email: 'officer@ndma.gov.in',
    password: 'SecurePassword2026!',
    confirmPassword: 'SecurePassword2026!',
  };

  beforeEach(async () => {
    if (db.resetMockData) {
      db.resetMockData();
    }

    // Register user for login tests
    await request(app)
      .post('/api/auth/signup')
      .send(testUser);
  });

  it('1. should successfully login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login successful.');
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.password_hash).toBeUndefined();

    // Verify session cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/fw_session=/);
    expect(cookies[0]).toMatch(/HttpOnly/i);
  });

  it('2. should reject wrong password with generic error message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'IncorrectPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  it('3. should reject non-existent email with same generic error message (prevent enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown.officer@domain.com',
        password: 'SomePassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  it('4. should reject empty email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: '',
        password: 'SomePassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter your email.');
  });

  it('5. should reject empty password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter your password.');
  });

  it('6. should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'SomePassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please enter a valid email address.');
  });

  it('7. should persist session via cookie and return current user on /api/auth/me', async () => {
    // 1. Log in to get cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookie = loginRes.headers['set-cookie'];

    // 2. Call /api/auth/me with cookie
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email);
    expect(meRes.body.data.user.name).toBe(testUser.name);
  });

  it('8. should reject access to /api/auth/me without authentication cookie', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required. Please log in.');
  });

  it('9. should reject access to /api/auth/me with invalid or forged token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['fw_session=forged-invalid-jwt-token']);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Session expired or invalid. Please log in again.');
  });

  it('10. should successfully log out and invalidate cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logged out successfully.');

    // Cookie is cleared or expired
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/fw_session=;/);
  });
});
