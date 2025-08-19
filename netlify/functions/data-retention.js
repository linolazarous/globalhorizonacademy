const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  // This function should be triggered by a scheduled event
  try {
    await cleanupOldData();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Data retention cleanup failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Cleanup failed' })
    };
  }
};

async function cleanupOldData() {
  const now = new Date();
  const retentionPeriods = {
    analytics: 365 * 24 * 60 * 60 * 1000, // 1 year
    userActivity: 730 * 24 * 60 * 60 * 1000, // 2 years
    backup: 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  // Cleanup old analytics events
  const analyticsCutoff = new Date(now - retentionPeriods.analytics);
  const analyticsSnapshot = await db.collection('events')
    .where('timestamp', '<', analyticsCutoff)
    .get();

  const batch = db.batch();
  analyticsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Anonymize old user activity
  const activityCutoff = new Date(now - retentionPeriods.userActivity);
  const usersSnapshot = await db.collection('users')
    .where('lastActivity', '<', activityCutoff)
    .where('isAnonymized', '==', false)
    .get();

  for (const userDoc of usersSnapshot.docs) {
    await anonymizeUserData(userDoc.id);
  }

  console.log(`Data retention cleanup completed: ${analyticsSnapshot.size} events deleted, ${usersSnapshot.size} users anonymized`);
}
