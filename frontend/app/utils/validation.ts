export interface ValidationError {
  field: string;
  message: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

// Sanitize input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Validate full name
export const validateFullName = (name: string): ValidationError | null => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized.trim()) {
    return { field: 'fullName', message: 'Full name is required' };
  }
  
  if (sanitized.length < 2) {
    return { field: 'fullName', message: 'Full name must be at least 2 characters long' };
  }
  
  if (sanitized.length > 100) {
    return { field: 'fullName', message: 'Full name must be less than 100 characters' };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z-' ]+$/;
  if (!nameRegex.test(sanitized)) {
    return { field: 'fullName', message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return null;
};

// Validate email address
export const validateEmail = (email: string): ValidationError | null => {
  const sanitized = sanitizeInput(email);
  
  if (!sanitized.trim()) {
    return { field: 'email', message: 'Email is required' };
  }
  
  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  
  if (sanitized.length > 255) {
    return { field: 'email', message: 'Email must be less than 255 characters' };
  }
  
  return null;
};

// Validate password
export const validatePassword = (password: string): ValidationError | null => {
  const sanitized = sanitizeInput(password);
  
  if (!sanitized.trim()) {
    return { field: 'password', message: 'Password is required' };
  }
  
  if (sanitized.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }
  
  if (sanitized.length > 128) {
    return { field: 'password', message: 'Password must be less than 128 characters' };
  }
  
  return null;
};

// Validate confirm password
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationError | null => {
  const sanitizedPassword = sanitizeInput(password);
  const sanitizedConfirmPassword = sanitizeInput(confirmPassword);
  
  if (!sanitizedConfirmPassword.trim()) {
    return { field: 'confirmPassword', message: 'Please confirm your password' };
  }
  
  if (sanitizedPassword !== sanitizedConfirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }
  
  return null;
};

// Validate phone number
export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || !phone.trim()) {
    return { field: 'phone', message: 'Phone number is required' };
  }
  
  // Basic phone validation - just check if it contains mainly digits and common formatting chars
  const phoneRegex = /^[+\d][\d\s\-().]{7,18}$/;
  if (!phoneRegex.test(phone.trim())) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }
  
  if (phone.length > 20) {
    return { field: 'phone', message: 'Phone number must be less than 20 characters' };
  }
  
  return null;
};

// Check password strength
export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];
  
  // Length check
  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');
  
  if (password.length >= 12) score++;
  else suggestions.push('Use at least 12 characters for better security');
  
  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else suggestions.push('Include both uppercase and lowercase letters');
  
  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Include at least one number');
  
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else suggestions.push('Include at least one special character (!@#$%^&*)');
  
  // Common password check
  const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', '111111'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    suggestions.unshift('Avoid using common passwords');
  }
  
  // Return strength info
  if (score <= 2) {
    return {
      score,
      label: 'Weak',
      color: 'bg-red-500',
      suggestions
    };
  } else if (score === 3 || score === 4) {
    return {
      score,
      label: 'Medium',
      color: 'bg-yellow-500',
      suggestions
    };
  } else {
    return {
      score,
      label: 'Strong',
      color: 'bg-green-500',
      suggestions
    };
  }
};

// Validate entire registration form
export const validateRegisterForm = (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  phone: string
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const nameError = validateFullName(fullName);
  if (nameError) errors.push(nameError);
  
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);
  
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  if (confirmPasswordError) errors.push(confirmPasswordError);
  
  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);
  
  return errors;
};
