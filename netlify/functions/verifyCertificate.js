// functions/verifyCertificate.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.verifyCertificate = functions.https.onCall(async (data, context) => {
  const { certificateId } = data;
  
  try {
    const certSnap = await admin.firestore()
      .collection('certificates')
      .doc(certificateId)
      .get();
    
    if (!certSnap.exists) {
      return { valid: false, reason: 'Certificate not found' };
    }
    
    const certData = certSnap.data();
    
    if (certData.status !== 'generated') {
      return { 
        valid: false, 
        reason: certData.status === 'failed' ? 
          'Certificate generation failed' : 
          'Certificate not yet generated' 
      };
    }
    
    // Additional verification checks
    const [userSnap, courseSnap] = await Promise.all([
      admin.firestore().collection('users').doc(certData.studentId).get(),
      admin.firestore().collection('courses').doc(certData.courseId).get()
    ]);
    
    if (!userSnap.exists || !courseSnap.exists) {
      return { valid: false, reason: 'Invalid user or course reference' };
    }
    
    return {
      valid: true,
      certificate: {
        id: certificateId,
        studentName: certData.studentName,
        courseName: certData.courseName,
        completionDate: certData.completionDate,
        pdfUrl: certData.pdfUrl,
        issuedAt: certData.generatedAt.toDate().toISOString()
      }
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return { valid: false, reason: 'Verification error' };
  }
});
