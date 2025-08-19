// functions/triggerCertificate.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.triggerCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'Authentication required'
    );
  }

  const { courseId } = data;
  const userId = context.auth.uid;
  
  try {
    // Verify course completion
    const completionRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('completedCourses')
      .doc(courseId);
    
    const completionSnap = await completionRef.get();
    
    if (!completionSnap.exists) {
      throw new functions.https.HttpsError(
        'failed-precondition', 
        'Course not completed'
      );
    }
    
    // Get user and course details
    const [userSnap, courseSnap] = await Promise.all([
      admin.firestore().collection('users').doc(userId).get(),
      admin.firestore().collection('courses').doc(courseId).get()
    ]);
    
    if (!userSnap.exists || !courseSnap.exists) {
      throw new functions.https.HttpsError(
        'not-found', 
        'User or course not found'
      );
    }
    
    // Generate certificate ID
    const certificateId = `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create certificate record
    const certificateData = {
      studentId: userId,
      studentName: userSnap.data().displayName || userSnap.data().email,
      courseId,
      courseName: courseSnap.data().title,
      completionDate: completionSnap.data().completedAt.toDate().toLocaleDateString(),
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore()
      .collection('certificates')
      .doc(certificateId)
      .set(certificateData);
    
    return { certificateId };
  } catch (error) {
    console.error('Certificate trigger failed:', error);
    throw new functions.https.HttpsError(
      'internal', 
      error.message || 'Certificate generation failed'
    );
  }
});
