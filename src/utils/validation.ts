export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateName = (name?: string): ValidationResult => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, message: 'Please enter your name.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, message: 'Name must not exceed 100 characters.' };
  }
  return { isValid: true };
};

export const validateEmail = (email?: string): ValidationResult => {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { isValid: false, message: 'Please enter your email.' };
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }
  return { isValid: true };
};

export const validatePassword = (password?: string): ValidationResult => {
  if (!password || typeof password !== 'string' || password.length === 0) {
    return { isValid: false, message: 'Please enter your password.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters.' };
  }
  return { isValid: true };
};

export const validateConfirmPassword = (password?: string, confirmPassword?: string): ValidationResult => {
  if (!confirmPassword || typeof confirmPassword !== 'string' || confirmPassword.length === 0) {
    return { isValid: false, message: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match.' };
  }
  return { isValid: true };
};
