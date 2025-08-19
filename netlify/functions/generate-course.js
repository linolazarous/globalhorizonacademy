// netlify/functions/generate-course.js
const { OpenAI } = require('openai');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { validateAuth, validateCourseRequest } = require('../utils/validators');
const { logError, logEvent } = require('../utils/logger');
const { CustomError } = require('../utils/errors');

// Initialize Firebase
const app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(app);

// Initialize OpenAI with retry configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000
});

exports.handler = async (event, context) => {
  try {
    // Validate JWT from Netlify Identity
    const user = await validateAuth(event);
    
    // Validate request
    const { courseTopic, gradeLevel, track } = validateCourseRequest(
      JSON.parse(event.body)
    );

    // Rate limiting check (pseudo-code)
    await checkRateLimit(user.id, 'course_generation');

    // Generate course content with OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [{
        role: "system",
        content: `You are a course generator for Global Horizon Academy. 
          Create comprehensive course material for ${gradeLevel} students 
          in the ${track} track about ${courseTopic}. Include:
          - Learning objectives
          - Week-by-week syllabus
          - Key concepts
          - Assessment ideas
          - Recommended resources`
      }, {
        role: "user",
        content: `Generate a world-class course about ${courseTopic} 
          for international secondary students at grade ${gradeLevel} level,
          specializing in ${track}.`
      }],
      temperature: 0.7,
      max_tokens: 3000
    });

    const courseContent = response.choices[0].message.content;
    
    // Save to Firestore with proper structure
    const courseRef = doc(db, 'courses', `course-${Date.now()}`);
    await setDoc(courseRef, {
      title: courseTopic,
      gradeLevel,
      track,
      content: courseContent,
      status: 'draft',
      createdBy: user.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      metadata: {
        model: process.env.OPENAI_MODEL || "gpt-4",
        tokensUsed: response.usage?.total_tokens || 0
      }
    });

    // Log successful generation
    await logEvent('course_generated', {
      userId: user.id,
      courseId: courseRef.id,
      topic: courseTopic,
      tokensUsed: response.usage?.total_tokens || 0
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true,
        courseId: courseRef.id,
        tokensUsed: response.usage?.total_tokens || 0
      })
    };
  } catch (error) {
    await logError('course_generation_error', error, event.body);
    
    return {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error.publicMessage || 'Course generation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Helper functions would be in separate files
async function checkRateLimit(userId, action) {
  // Implement actual rate limiting logic
  // Could use Firebase Firestore or a Redis cache
}
