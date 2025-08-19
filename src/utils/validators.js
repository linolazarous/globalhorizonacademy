const jwt = require('jsonwebtoken');

const validateAuth = async (event) => {
  const authHeader = event.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.NETLIFY_JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }
};

const validateCourseRequest = (data) => {
  if (!data.courseTopic || typeof data.courseTopic !== 'string' || data.courseTopic.length < 5) {
    throw new ValidationError('Course topic must be at least 5 characters');
  }
  
  if (!['7', '8', '9', '10', '11', '12'].includes(data.gradeLevel)) {
    throw new ValidationError('Invalid grade level');
  }
  
  if (!['STEM', 'Humanities', 'Creative Arts', 'Sustainable Development'].includes(data.track)) {
    throw new ValidationError('Invalid track');
  }
  
  return data;
};

module.exports = {
  validateAuth,
  validateCourseRequest,
  validatePaymentRequest,
  validateSubscriptionRequest

};


// src/utils/validation.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateCourseData = (data) => {
  const errors = {};
  
  if (!data.title || data.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  
  if (!data.description || data.description.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }
  
  if (!data.price || data.price < 0) {
    errors.price = 'Price must be a positive number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const rateLimit = async (identifier, maxRequests, timeWindow) => {
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
};
