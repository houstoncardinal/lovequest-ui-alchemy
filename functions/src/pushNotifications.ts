import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Cloud Function: Send push notification
 * Migrated from Supabase push-notifications edge function
 */
export const sendPushNotification = functions.https.onCall(async (data, context) => {
  // TODO: Implement push notification sending via FCM
  // Supports: new matches, new messages, likes, etc.

  throw new functions.https.HttpsError('unimplemented', 'Function not yet implemented');
});

/**
 * Cloud Function: Register push notification token
 */
export const registerPushToken = functions.https.onCall(async (data, context) => {
  // TODO: Store FCM token for user

  throw new functions.https.HttpsError('unimplemented', 'Function not yet implemented');
});
