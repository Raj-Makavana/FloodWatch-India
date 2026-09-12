import request from 'supertest';
import app from '../src/app';
import { db } from '../src/config/db';
import { authService } from '../src/services/authService';

describe('Auth - Google OAuth Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/api/auth/google/callback';

    if (db.resetMockData) {
      db.resetMockData();
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('1. should redirect to Google authorization URL on /api/auth/google', async () => {
    const res = await request(app).get('/api/auth/google');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('accounts.google.com');
    expect(res.headers.location).toContain('mock-google-client-id');
  });

  it('2. should return error if Google OAuth credentials are not configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const res = await request(app).get('/api/auth/google');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Google OAuth credentials not configured');
  });

  it('3. should create new user and redirect with session cookie on valid OAuth callback', async () => {
    // Setup mock Google OAuth client
    const mockGoogleClient = {
      getToken: jest.fn().mockResolvedValue({
        tokens: {
          id_token: 'mock-id-token-xyz',
        },
      }),
      setCredentials: jest.fn(),
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: 'google-user-id-12345',
          email: 'google.analyst@floodwatch.org',
          name: 'Priya Sharma',
          email_verified: true,
        }),
      }),
    };

    authService.setMockGoogleClient(mockGoogleClient);

    const res = await request(app)
      .get('/api/auth/google/callback?code=valid-auth-code-123');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/dashboard.html?auth=google_success');

    // Verify session cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/fw_session=/);
  });

  it('4. should log in existing user on OAuth callback without duplicate error', async () => {
    // 1. Create user in DB first
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Existing Member',
        email: 'member@floodwatch.org',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    // 2. OAuth returns this same email
    const mockGoogleClient = {
      getToken: jest.fn().mockResolvedValue({
        tokens: { id_token: 'mock-id-token' },
      }),
      setCredentials: jest.fn(),
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: 'google-id-existing-999',
          email: 'member@floodwatch.org',
          name: 'Existing Member',
        }),
      }),
    };

    authService.setMockGoogleClient(mockGoogleClient);

    const res = await request(app)
      .get('/api/auth/google/callback?code=code-existing-user');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/dashboard.html?auth=google_success');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('5. should redirect with error param if authorization was denied (query error)', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?error=access_denied');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login.html?error=google_denied');
  });

  it('6. should redirect with error param if code is missing', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login.html?error=google_failed');
  });
});
