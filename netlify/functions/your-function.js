// netlify/functions/your-function.js
import { validateAuth, validateCourseRequest, ValidationError, AuthenticationError } from '../../src/utils/validators';

exports.handler = async (event, context) => {
  try {
    // Validate authentication
    const user = await validateAuth(event);
    
    // Validate request data
    const validatedData = validateCourseRequest(JSON.parse(event.body));
    
    // Process the request...
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: validatedData })
    };
    
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: error.message })
      };
    } else if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message, details: error.details })
      };
    } else {
      console.error('Server error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
};
