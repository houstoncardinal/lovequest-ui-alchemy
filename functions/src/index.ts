import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export Firestore and Auth for use in functions
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Import and export all function modules
// Matching functions
export { calculateMatchScore, getMatchRecommendations, getLocationBasedMatches } from './matching';

// Messaging/Push Notifications
export { sendPushNotification, registerPushToken } from './pushNotifications';

// Content Moderation
export { moderateContent } from './contentModeration';

// User Management
export { onUserCreated, onUserDeleted } from './userManagement';
