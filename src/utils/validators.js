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