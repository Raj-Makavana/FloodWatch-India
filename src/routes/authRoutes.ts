import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { setAuthCookie, clearAuthCookie } from '../utils/jwt';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// POST /api/auth/signup
router.post(
  '/signup',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      const { user, token } = await authService.signup({
        name,
        email,
        password,
        confirmPassword,
      });

      setAuthCookie(res, token);
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: { user },
      });
    } catch (err: any) {
      const message = err.message || 'Something went wrong. Please try again.';
      const status =
        message.includes('already exists') ? 409 :
        message.includes('Please') || message.includes('Password') || message.includes('Name') ? 400 : 500;
      res.status(status).json({
        success: false,
        message,
      });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login({ email, password });

      setAuthCookie(res, token);
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: { user },
      });
    } catch (err: any) {
      const message = err.message || 'Something went wrong. Please try again.';
      const status = message.includes('Invalid') ? 401 :
                     message.includes('Please') ? 400 : 500;
      res.status(status).json({
        success: false,
        message,
      });
    }
  }
);

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response): void => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// GET /api/auth/me (Get current authenticated user)
router.get(
  '/me',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await userService.findById(req.user!.userId);
      if (!user) {
        clearAuthCookie(res);
        res.status(401).json({
          success: false,
          message: 'User no longer exists.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            email_verified: user.email_verified,
            created_at: user.created_at,
          },
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again.',
      });
    }
  }
);

// GET /api/auth/google (Initiate Google OAuth flow)
router.get('/google', (req: Request, res: Response): void => {
  try {
    const url = authService.getGoogleAuthUrl();
    res.redirect(url);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Google OAuth is not configured.',
    });
  }
});

// GET /api/auth/google/callback (Google OAuth callback URL)
router.get(
  '/google/callback',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, error } = req.query;
      const redirectBase =
        FRONTEND_URL && !FRONTEND_URL.includes('your-vercel')
          ? FRONTEND_URL
          : '';

      if (error) {
        res.redirect(`${redirectBase}/login.html?error=google_denied`);
        return;
      }

      if (!code || typeof code !== 'string') {
        res.redirect(`${redirectBase}/login.html?error=google_failed`);
        return;
      }

      const { token } = await authService.handleGoogleCallback(code);
      setAuthCookie(res, token);
      res.redirect(`${redirectBase}/dashboard.html?auth=google_success`);
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      const redirectBase =
        FRONTEND_URL && !FRONTEND_URL.includes('your-vercel')
          ? FRONTEND_URL
          : '';
      res.redirect(`${redirectBase}/login.html?error=google_failed`);
    }
  }
);

// POST /api/auth/forgot-password (Request 6-digit OTP to email)
router.post(
  '/forgot-password',
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordResetOtp(email);
      res.status(200).json(result);
    } catch (err: any) {
      const message = err.message || 'Something went wrong. Please try again.';
      const status = message.includes('No account') ? 404 :
                     message.includes('Please') || message.includes('wait') ? 400 : 500;
      res.status(status).json({
        success: false,
        message,
      });
    }
  }
);

// POST /api/auth/verify-otp (Verify 6-digit code)
router.post(
  '/verify-otp',
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyPasswordResetOtp(email, otp);
      res.status(200).json(result);
    } catch (err: any) {
      const message = err.message || 'Invalid OTP code.';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }
);

// POST /api/auth/resend-otp (Resend OTP code)
router.post(
  '/resend-otp',
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordResetOtp(email);
      res.status(200).json(result);
    } catch (err: any) {
      const message = err.message || 'Failed to resend OTP.';
      const status = message.includes('wait') ? 429 : 400;
      res.status(status).json({
        success: false,
        message,
      });
    }
  }
);

// POST /api/auth/reset-password (Set new password - rejects old password)
router.post(
  '/reset-password',
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword, confirmPassword } = req.body;
      const result = await authService.resetPassword(email, newPassword, confirmPassword);
      res.status(200).json(result);
    } catch (err: any) {
      const message = err.message || 'Failed to reset password.';
      const status = message.includes('same as your old') ? 400 :
                     message.includes('Password') || message.includes('match') || message.includes('expired') ? 400 : 500;
      res.status(status).json({
        success: false,
        message,
      });
    }
  }
);

export default router;
