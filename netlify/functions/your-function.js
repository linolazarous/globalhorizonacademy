// netlify/functions/your-function.js
exports.handler = async (event, context) => {
  try {
    // Check for authentication
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing or invalid authorization token' })
      };
    }
    
    // Parse request body
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    // Validate request data
    if (!data || typeof data !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request data' })
      };
    }
    
    if (!data.title || data.title.trim().length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Validation failed',
          details: { title: 'Course title must be at least 3 characters' }
        })
      };
    }
    
    // Process the request (add your logic here)
    const processedData = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: true, 
        data: processedData 
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
