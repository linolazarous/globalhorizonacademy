// functions/generateCertificate.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const storage = new Storage();
const bucket = storage.bucket('your-project-id.appspot.com');

exports.generateCertificate = functions.firestore
  .document('certificates/{certificateId}')
  .onCreate(async (snap, context) => {
    const certificateData = snap.data();
    const { studentId, courseId, studentName, courseName, completionDate } = certificateData;

    try {
      // 1. Create PDF
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      
      // Load font
      const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'));
      const font = await pdfDoc.embedFont(fontBytes);
      
      // Add page
      const page = pdfDoc.addPage([800, 600]);
      
      // Draw background
      const backgroundBytes = fs.readFileSync(path.join(__dirname, 'assets', 'certificate-bg.png'));
      const backgroundImage = await pdfDoc.embedPng(backgroundBytes);
      page.drawImage(backgroundImage, {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
      });
      
      // Add content
      page.drawText('Certificate of Completion', {
        x: 100,
        y: 500,
        size: 32,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`This is to certify that ${studentName}`, {
        x: 100,
        y: 450,
        size: 18,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`has successfully completed ${courseName}`, {
        x: 100,
        y: 400,
        size: 18,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Completed on: ${completionDate}`, {
        x: 100,
        y: 350,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });
      
      // 2. Save to Storage
      const pdfBytes = await pdfDoc.save();
      const filePath = `certificates/${context.params.certificateId}.pdf`;
      const file = bucket.file(filePath);
      
      await file.save(pdfBytes, {
        metadata: { contentType: 'application/pdf' },
      });
      
      // 3. Update Firestore with download URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future date
      });
      
      await snap.ref.update({
        pdfUrl: url,
        status: 'generated',
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // 4. Add to user's profile
      await admin.firestore()
        .collection('users')
        .doc(studentId)
        .collection('certificates')
        .doc(context.params.certificateId)
        .set({
          courseId,
          courseName,
          completionDate,
          pdfUrl: url,
          issuedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      
      return true;
    } catch (error) {
      console.error('Certificate generation failed:', error);
      await snap.ref.update({
        status: 'failed',
        error: error.message
      });
      return false;
    }
  });
