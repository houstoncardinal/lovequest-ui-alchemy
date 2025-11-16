/**
 * Firestore utilities for user operations
 */

import {
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from '@/integrations/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
  bio: string;
  dateOfBirth?: Timestamp;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: string;

  // Geolocation
  geolocation?: {
    latitude: number;
    longitude: number;
    geohash?: string;
  };

  // Islamic profile
  religionLevel?: string;
  prayerFrequency?: string;
  madhab?: string;
  hijabStatus?: string;
  hajjUmrahExperience?: string;
  islamicKnowledgeLevel?: string;
  readQuran?: string;

  // Lifestyle
  educationLevel?: string;
  careerField?: string;
  incomeRange?: string;
  smokingStatus?: string;
  exerciseFrequency?: string;
  dietPreferences?: string[];

  // Family
  maritalStatus?: string;
  hasChildren?: boolean;
  wantsChildren?: boolean;
  childrenPreference?: string;
  familySizePreference?: string;

  // Verification
  isVerified: boolean;
  verificationLevel: string;
  verificationRequired?: boolean;
  canAccessApp: boolean;

  // Premium status is now managed through userRoles collection
  // Use useUserRole() hook to access premium features

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
  profileCompleteness: number;
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Create user profile
 */
export async function createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      ...data,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
}

/**
 * Update last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last active:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Get multiple user profiles by IDs
 */
export async function getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
  try {
    const profiles = await Promise.all(
      userIds.map(id => getUserProfile(id))
    );

    return profiles.filter(p => p !== null) as UserProfile[];
  } catch (error) {
    console.error('Error getting user profiles:', error);
    throw error;
  }
}

/**
 * Search users by criteria
 */
export async function searchUsers(
  criteria: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    religionLevel?: string;
  },
  limitCount: number = 20
): Promise<UserProfile[]> {
  try {
    let q = query(collection(db, 'users'));

    // Apply filters
    q = query(q, where('canAccessApp', '==', true));

    if (criteria.gender) {
      q = query(q, where('gender', '==', criteria.gender));
    }

    if (criteria.religionLevel) {
      q = query(q, where('religionLevel', '==', criteria.religionLevel));
    }

    // Note: Age filtering would need to be done client-side or via Cloud Function
    // as Firestore doesn't support range queries on multiple fields without composite index

    q = query(q, orderBy('lastActive', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];

    snapshot.forEach(doc => {
      users.push(doc.data() as UserProfile);
    });

    // Client-side age filtering if needed
    if (criteria.minAge || criteria.maxAge) {
      return users.filter(user => {
        if (!user.age) return false;
        if (criteria.minAge && user.age < criteria.minAge) return false;
        if (criteria.maxAge && user.age > criteria.maxAge) return false;
        return true;
      });
    }

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(profile: Partial<UserProfile>): number {
  const fields = [
    'firstName',
    'lastName',
    'bio',
    'dateOfBirth',
    'gender',
    'location',
    'religionLevel',
    'prayerFrequency',
    'madhab',
    'educationLevel',
    'careerField',
    'maritalStatus',
    'photoURL',
  ];

  const filledFields = fields.filter(field => {
    const value = (profile as any)[field];
    return value !== undefined && value !== null && value !== '';
  });

  return Math.round((filledFields.length / fields.length) * 100);
}
