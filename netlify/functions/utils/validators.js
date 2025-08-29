// netlify/functions/utils/validators.js
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

function validateAuth(event) {
  // Implement your auth validation logic
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization token');
  }
  
  // Validate token here (mock example)
  const token = authHeader.substring(7);
  return { id: 'user-id', email: 'user@example.com' }; // Mock user
}

function validateCourseRequest(data) {
  // Implement your validation logic
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request data');
  }
  
  if (!data.title || data.title.length < 3) {
    throw new ValidationError('Course title must be at least 3 characters');
  }
  
  // Add more validation as needed
  return data;
}

module.exports = {
  validateAuth,
  validateCourseRequest,
  ValidationError,
  AuthenticationError
};
