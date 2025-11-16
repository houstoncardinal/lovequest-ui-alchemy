import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Firebase Auth Trigger: When a new user is created
 * Creates initial profile document in Firestore
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  // TODO: Create user profile in Firestore
  // Initialize with email, displayName from auth
  // Set default preferences and settings

  console.log('New user created:', user.uid);
});

/**
 * Firebase Auth Trigger: When a user is deleted
 * Clean up all user data from Firestore
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  // TODO: Clean up user data
  // - Delete profile
  // - Delete photos
  // - Remove from matches
  // - Delete messages

  console.log('User deleted:', user.uid);
});
