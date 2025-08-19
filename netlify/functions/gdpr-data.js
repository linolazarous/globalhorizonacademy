const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDocs, collection, deleteDoc, writeBatch } = require('firebase/firestore');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

// Initialize Firebase Admin for server-side operations
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

exports.handler = async (event, context) => {
  // Verify this is a scheduled function or authenticated request
  const authHeader = event.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.GDPR_API_KEY}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const { action, userId } = JSON.parse(event.body);

  try {
    switch (action) {
      case 'export-data':
        await exportUserData(userId);
        break;
      
      case 'delete-account':
        await deleteUserData(userId);
        break;
      
      case 'anonymize-data':
        await anonymizeUserData(userId);
        break;
      
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('GDPR action failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function exportUserData(userId) {
  const userRef = db.collection('users').doc(userId);
  const userData = await userRef.get();
  
  const collections = [
    'enrolledCourses',
    'achievements',
    'certificates',
    'payments',
    'progress'
  ];

  const exportData = {
    user: userData.data(),
    collections: {}
  };

  for (const collectionName of collections) {
    const snapshot = await userRef.collection(collectionName).get();
    exportData.collections[collectionName] = snapshot.docs.map(doc => doc.data());
  }

  // Store export in storage bucket
  const bucket = storage.bucket();
  const file = bucket.file(`exports/${userId}/${Date.now()}_export.json`);
  
  await file.save(JSON.stringify(exportData, null, 2), {
    metadata: {
      contentType: 'application/json',
      metadata: {
        userId,
        exportedAt: new Date().toISOString(),
        purpose: 'GDPR data export'
      }
    }
  });

  // TODO: Send email with download link
}

async function deleteUserData(userId) {
  const userRef = db.collection('users').doc(userId);
  const batch = db.batch();

  // Delete all subcollections
  const collections = [
    'enrolledCourses',
    'achievements',
    'certificates',
    'payments',
    'progress',
    'consent',
    'privacy'
  ];

  for (const collectionName of collections) {
    const snapshot = await userRef.collection(collectionName).get();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
  }

  // Anonymize main user document
  batch.update(userRef, {
    email: 'deleted@user.com',
    displayName: 'Deleted User',
    photoURL: null,
    personalData: null,
    deletedAt: new Date().toISOString(),
    isAnonymized: true
  });

  await batch.commit();

  // Delete user files from storage
  await deleteUserFiles(userId);
}

async function anonymizeUserData(userId) {
  const userRef = db.collection('users').doc(userId);
  
  await userRef.update({
    'personalData.email': 'anonymous@user.com',
    'personalData.name': 'Anonymous User',
    'personalData.phone': null,
    'personalData.address': null,
    'personalData.dateOfBirth': null,
    anonymizedAt: new Date().toISOString()
  });
}

async function deleteUserFiles(userId) {
  const bucket = storage.bucket();
  
  // Delete profile pictures
  const [profileFiles] = await bucket.getFiles({
    prefix: `profile-pictures/${userId}/`
  });
  
  await Promise.all(profileFiles.map(file => file.delete()));
  
  // Delete user uploads
  const [uploadFiles] = await bucket.getFiles({
    prefix: `user-uploads/${userId}/`
  });
  
  await Promise.all(uploadFiles.map(file => file.delete()));
}
