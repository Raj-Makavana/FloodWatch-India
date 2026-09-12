import { OAuth2Client } from 'google-auth-library';
import { userService } from './userService';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation';
import { otpService } from './otpService';
import { emailService } from './emailService';
import { SignupInput, LoginInput, UserResponse, JwtPayload } from '../types';

export class AuthService {
  private googleClient: OAuth2Client | null = null;

  private getGoogleClient(): OAuth2Client {
    if (!this.googleClient) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri =
        (process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI.includes('your-vercel-backend-url'))
          ? process.env.GOOGLE_REDIRECT_URI
          : 'http://localhost:5000/api/auth/google/callback';

      this.googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);
    }
    return this.googleClient;
  }

  // Set mock client for unit testing
  setMockGoogleClient(client: any): void {
    this.googleClient = client;
  }

  getGoogleAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured on the server.');
    }

    const client = this.getGoogleClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });
  }

  async signup(input: SignupInput): Promise<{ user: UserResponse; token: string }> {
    // 1. Validation
    const nameCheck = validateName(input.name);
    if (!nameCheck.isValid) {
      throw new Error(nameCheck.message);
    }

    const emailCheck = validateEmail(input.email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.message);
    }

    const passwordCheck = validatePassword(input.password);
    if (!passwordCheck.isValid) {
      throw new Error(passwordCheck.message);
    }

    const confirmCheck = validateConfirmPassword(input.password, input.confirmPassword);
    if (!confirmCheck.isValid) {
      throw new Error(confirmCheck.message);
    }

    // 2. Check existing user
    const existingUser = await userService.findByEmail(input.email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(input.password!);

    // 4. Create user record
    const newUser = await userService.createUser({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password_hash: hashedPassword,
      provider: 'local',
      email_verified: false,
    });

    // 5. Generate token
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const userResponse: UserResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      provider: newUser.provider,
      email_verified: newUser.email_verified,
      created_at: newUser.created_at,
    };

    return { user: userResponse, token };
  }

  async login(input: LoginInput): Promise<{ user: UserResponse; token: string }> {
    // 1. Validation
    const emailCheck = validateEmail(input.email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.message);
    }

    if (!input.password || input.password.length === 0) {
      throw new Error('Please enter your password.');
    }

    // 2. Look up user by email
    const user = await userService.findByEmail(input.email);
    if (!user || !user.password_hash) {
      // Generic error to prevent account enumeration
      throw new Error('Invalid email or password.');
    }

    // 3. Verify password
    const isMatch = await comparePassword(input.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // 4. Issue JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      email_verified: user.email_verified,
      created_at: user.created_at,
    };

    return { user: userResponse, token };
  }

  async handleGoogleCallback(code: string): Promise<{ user: UserResponse; token: string }> {
    if (!code) {
      throw new Error('Missing OAuth authorization code.');
    }

    const client = this.getGoogleClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new Error('Failed to retrieve ID token from Google.');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google profile information.');
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || 'Google User';

    // Check if user exists by Google ID
    let user = await userService.findByGoogleId(googleId);

    if (!user) {
      // Check if user exists by Email
      user = await userService.findByEmail(email);
      if (user) {
        // Link Google ID to existing email
        user = await userService.linkGoogleAccount(user.id, googleId);
      } else {
        // Create new Google user
        user = await userService.createUser({
          name,
          email,
          google_id: googleId,
          provider: 'google',
          email_verified: true,
        });
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      email_verified: user.email_verified,
      created_at: user.created_at,
    };

    return { user: userResponse, token };
  }

  async requestPasswordResetOtp(email?: string): Promise<{ success: boolean; message: string }> {
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.message);
    }

    const normalizedEmail = email!.trim().toLowerCase();
    const user = await userService.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error('No account found with this email address. Please register or check your email.');
    }

    const otp = await otpService.generateOtp(normalizedEmail, 'reset_password');
    await emailService.sendOtpEmail(normalizedEmail, otp, user.name);

    return {
      success: true,
      message: 'A 6-digit OTP has been sent to your email address.',
    };
  }

  async verifyPasswordResetOtp(email?: string, otp?: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.message);
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP.');
    }

    const normalizedEmail = email!.trim().toLowerCase();
    await otpService.verifyOtp(normalizedEmail, otp.trim(), 'reset_password');

    // Issue temporary reset token valid for 15 minutes
    const resetToken = signToken({
      userId: 'pwd_reset',
      email: normalizedEmail,
      name: 'Password Reset',
    });

    return {
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    };
  }

  async resetPassword(
    email?: string,
    newPassword?: string,
    confirmPassword?: string
  ): Promise<{ success: boolean; message: string }> {
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.message);
    }

    const normalizedEmail = email!.trim().toLowerCase();

    // Verify that OTP was verified for this email
    if (!otpService.isVerified(normalizedEmail, 'reset_password')) {
      throw new Error('Session expired or OTP not verified. Please verify your OTP again.');
    }

    // Validate new password
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      throw new Error(passwordCheck.message);
    }

    // Validate confirmation
    const confirmCheck = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmCheck.isValid) {
      throw new Error(confirmCheck.message);
    }

    const user = await userService.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error('User not found.');
    }

    // REQUIREMENT: Old password cannot be reused as new password
    if (user.password_hash) {
      const isSamePassword = await comparePassword(newPassword!, user.password_hash);
      if (isSamePassword) {
        throw new Error('New password cannot be the same as your old password. Please choose a different password.');
      }
    }

    // Hash new password and update in Neon DB
    const hashedPassword = await hashPassword(newPassword!);
    await userService.updatePasswordByEmail(normalizedEmail, hashedPassword);

    // Invalidate OTP record
    otpService.consumeOtp(normalizedEmail, 'reset_password');

    return {
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.',
    };
  }
}

export const authService = new AuthService();
