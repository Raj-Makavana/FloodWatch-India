export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  provider: 'local' | 'google';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  provider: string;
  email_verified: boolean;
  created_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

// Future OTP compatibility definitions
export interface OtpRequest {
  email: string;
  type: 'signup' | 'login' | 'reset_password';
}

export interface OtpVerification {
  email: string;
  code: string;
  type: 'signup' | 'login' | 'reset_password';
}
