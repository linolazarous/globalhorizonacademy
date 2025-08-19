// src/utils/validators.js
import jwt from 'jsonwebtoken';

// Custom error classes
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

// JWT secret (should be loaded from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || process.env.NETLIFY_JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('JWT_SECRET not found in environment variables. Authentication may fail.');
}

/**
 * Validate JWT token from request headers
 * @param {Object} event - Netlify function event object
 * @returns {Promise<Object>} Decoded token payload
 */
const validateAuth = async (event) => {
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('Missing authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization format. Expected: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AuthenticationError('Token not provided');
    }

    if (!JWT_SECRET) {
      throw new AuthenticationError('Server configuration error');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      } else {
        throw new AuthenticationError('Token verification failed');
      }
    }
  } catch (error) {
    // Re-throw authentication errors
    if (error instanceof AuthenticationError) {
      throw error;
    }
    console.error('Auth validation error:', error);
    throw new AuthenticationError('Authentication failed');
  }
};

/**
 * Validate course creation request data
 * @param {Object} data - Course data to validate
 * @returns {Object} Validated data
 */
const validateCourseRequest = (data) => {
  const errors = {};
  
  // Course topic validation
  if (!data.courseTopic || typeof data.courseTopic !== 'string') {
    errors.courseTopic = 'Course topic is required and must be a string';
  } else if (data.courseTopic.trim().length < 5) {
    errors.courseTopic = 'Course topic must be at least 5 characters long';
  } else if (data.courseTopic.trim().length > 200) {
    errors.courseTopic = 'Course topic must not exceed 200 characters';
  }

  // Grade level validation
  const validGradeLevels = ['7', '8', '9', '10', '11', '12'];
  if (!data.gradeLevel || !validGradeLevels.includes(data.gradeLevel.toString())) {
    errors.gradeLevel = `Grade level must be one of: ${validGradeLevels.join(', ')}`;
  }

  // Track validation
  const validTracks = ['STEM', 'Humanities', 'Creative Arts', 'Sustainable Development'];
  if (!data.track || !validTracks.includes(data.track)) {
    errors.track = `Track must be one of: ${validTracks.join(', ')}`;
  }

  // Optional: Duration validation
  if (data.duration) {
    const duration = parseInt(data.duration);
    if (isNaN(duration) || duration < 1 || duration > 52) {
      errors.duration = 'Duration must be between 1 and 52 weeks';
    }
  }

  // Optional: Language validation
  if (data.language && typeof data.language !== 'string') {
    errors.language = 'Language must be a string';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Course validation failed', errors);
  }

  // Return sanitized data
  return {
    courseTopic: data.courseTopic.trim(),
    gradeLevel: data.gradeLevel.toString(),
    track: data.track,
    duration: data.duration ? parseInt(data.duration) : undefined,
    language: data.language ? data.language.trim() : undefined
  };
};

/**
 * Validate payment request data
 * @param {Object} data - Payment data to validate
 * @returns {Object} Validated data
 */
const validatePaymentRequest = (data) => {
  const errors = {};
  
  if (!data.courseId || typeof data.courseId !== 'string') {
    errors.courseId = 'Course ID is required';
  }

  if (!data.userId || typeof data.userId !== 'string') {
    errors.userId = 'User ID is required';
  }

  if (data.amount && (isNaN(data.amount) || data.amount < 0)) {
    errors.amount = 'Amount must be a positive number';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Payment validation failed', errors);
  }

  return {
    courseId: data.courseId,
    userId: data.userId,
    amount: data.amount ? parseFloat(data.amount) : undefined
  };
};

/**
 * Validate subscription request data
 * @param {Object} data - Subscription data to validate
 * @returns {Object} Validated data
 */
const validateSubscriptionRequest = (data) => {
  const errors = {};
  
  const validPlans = ['basic', 'premium', 'enterprise'];
  if (!data.planId || !validPlans.includes(data.planId)) {
    errors.planId = `Plan ID must be one of: ${validPlans.join(', ')}`;
  }

  const validPeriods = ['monthly', 'annual'];
  if (data.period && !validPeriods.includes(data.period)) {
    errors.period = `Period must be one of: ${validPeriods.join(', ')}`;
  }

  if (data.coupon && typeof data.coupon !== 'string') {
    errors.coupon = 'Coupon must be a string';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Subscription validation failed', errors);
  }

  return {
    planId: data.planId,
    period: data.period || 'monthly',
    coupon: data.coupon
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (typeof password !== 'string') {
    return { isValid: false, errors: ['Password must be a string'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate course data for frontend
 * @param {Object} data - Course data to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validateCourseData = (data) => {
  const errors = {};
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (data.title.trim().length > 200) {
    errors.title = 'Title must not exceed 200 characters';
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (isNaN(data.price) || data.price < 0) {
    errors.price = 'Price must be a positive number';
  } else if (data.price > 10000) {
    errors.price = 'Price must not exceed $10,000';
  }

  // Validate category if provided
  if (data.category && typeof data.category !== 'string') {
    errors.category = 'Category must be a string';
  }

  // Validate tags if provided
  if (data.tags && (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string'))) {
    errors.tags = 'Tags must be an array of strings';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Simple rate limiting using localStorage (for client-side)
 * @param {string} identifier - Unique identifier for rate limiting
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {Promise<boolean>} True if rate limited
 */
const rateLimit = async (identifier, maxRequests, timeWindow) => {
  if (typeof window === 'undefined') {
    return false; // Skip rate limiting on server
  }

  try {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const requests = JSON.parse(localStorage.getItem(key) || '[]')
      .filter(timestamp => timestamp > windowStart);
    
    if (requests.length >= maxRequests) {
      return true;
    }
    
    requests.push(now);
    localStorage.setItem(key, JSON.stringify(requests));
    return false;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return false; // Don't block on error
  }
};

// Server-side rate limiting (for Netlify functions)
const serverRateLimit = async (identifier, maxRequests, timeWindow, storage = new Map()) => {
  const now = Date.now();
  const windowStart = now - timeWindow;
  
  const requests = storage.get(identifier) || [];
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  storage.set(identifier, recentRequests);
  return false;
};

export {
  validateAuth,
  validateCourseRequest,
  validatePaymentRequest,
  validateSubscriptionRequest,
  validateEmail,
  validatePassword,
  validateCourseData,
  rateLimit,
  serverRateLimit,
  ValidationError,
  AuthenticationError,
  AuthorizationError
};
