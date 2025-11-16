/**
 * Firestore utilities for match operations
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
  increment,
  writeBatch,
} from '@/integrations/firebase';

import { getUserProfile, type UserProfile } from './users';

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;

  // Denormalized user data
  user1: {
    displayName: string;
    photoURL: string | null;
    age?: number;
  };
  user2: {
    displayName: string;
    photoURL: string | null;
    age?: number;
  };

  matchedAt: Timestamp;
  compatibilityScore?: number;

  lastMessageAt: Timestamp | null;
  lastMessagePreview: string | null;
  unreadCountUser1: number;
  unreadCountUser2: number;

  status: 'active' | 'expired' | 'unmatched';
  expiresAt: Timestamp | null;
}

export interface Like {
  id: string;
  likerId: string;
  likedId: string;

  likerName: string;
  likerPhoto: string | null;

  createdAt: Timestamp;
  isMatched: boolean;
}

/**
 * Create a like
 */
export async function createLike(likerId: string, likedId: string): Promise<string> {
  try {
    const likerProfile = await getUserProfile(likerId);
    if (!likerProfile) throw new Error('Liker profile not found');

    const likeId = `${likerId}_${likedId}`;
    const likeData: Like = {
      id: likeId,
      likerId,
      likedId,
      likerName: likerProfile.displayName,
      likerPhoto: likerProfile.photoURL,
      createdAt: serverTimestamp() as Timestamp,
      isMatched: false,
    };

    await setDoc(doc(db, 'likes', likeId), likeData);

    // Check for mutual like
    const reverseLikeId = `${likedId}_${likerId}`;
    const reverseLike = await getDoc(doc(db, 'likes', reverseLikeId));

    if (reverseLike.exists()) {
      // Create match!
      await createMatch(likerId, likedId);

      // Update both likes to mark as matched
      const batch = writeBatch(db);
      batch.update(doc(db, 'likes', likeId), { isMatched: true });
      batch.update(doc(db, 'likes', reverseLikeId), { isMatched: true });
      await batch.commit();
    }

    return likeId;
  } catch (error) {
    console.error('Error creating like:', error);
    throw error;
  }
}

/**
 * Create a match between two users
 */
export async function createMatch(user1Id: string, user2Id: string): Promise<string> {
  try {
    const [user1Profile, user2Profile] = await Promise.all([
      getUserProfile(user1Id),
      getUserProfile(user2Id),
    ]);

    if (!user1Profile || !user2Profile) {
      throw new Error('User profiles not found');
    }

    const matchId = `${user1Id}_${user2Id}`;
    const matchData: Match = {
      id: matchId,
      user1Id,
      user2Id,
      user1: {
        displayName: user1Profile.displayName,
        photoURL: user1Profile.photoURL,
        age: user1Profile.age,
      },
      user2: {
        displayName: user2Profile.displayName,
        photoURL: user2Profile.photoURL,
        age: user2Profile.age,
      },
      matchedAt: serverTimestamp() as Timestamp,
      lastMessageAt: null,
      lastMessagePreview: null,
      unreadCountUser1: 0,
      unreadCountUser2: 0,
      status: 'active',
      expiresAt: null,
    };

    await setDoc(doc(db, 'matches', matchId), matchData);

    return matchId;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
}

/**
 * Get matches for a user
 */
export async function getUserMatches(userId: string): Promise<Match[]> {
  try {
    // Query matches where user is user1
    const matches1Query = query(
      collection(db, 'matches'),
      where('user1Id', '==', userId),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    );

    // Query matches where user is user2
    const matches2Query = query(
      collection(db, 'matches'),
      where('user2Id', '==', userId),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(matches1Query),
      getDocs(matches2Query),
    ]);

    const matches: Match[] = [];

    snapshot1.forEach(doc => {
      matches.push(doc.data() as Match);
    });

    snapshot2.forEach(doc => {
      matches.push(doc.data() as Match);
    });

    // Sort by lastMessageAt
    return matches.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
    });
  } catch (error) {
    console.error('Error getting user matches:', error);
    throw error;
  }
}

/**
 * Get a specific match
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const matchDoc = await getDoc(doc(db, 'matches', matchId));

    if (!matchDoc.exists()) {
      return null;
    }

    return matchDoc.data() as Match;
  } catch (error) {
    console.error('Error getting match:', error);
    throw error;
  }
}

/**
 * Check if two users are matched
 */
export async function areUsersMatched(user1Id: string, user2Id: string): Promise<boolean> {
  try {
    const matchId1 = `${user1Id}_${user2Id}`;
    const matchId2 = `${user2Id}_${user1Id}`;

    const [match1, match2] = await Promise.all([
      getDoc(doc(db, 'matches', matchId1)),
      getDoc(doc(db, 'matches', matchId2)),
    ]);

    return match1.exists() || match2.exists();
  } catch (error) {
    console.error('Error checking if users are matched:', error);
    return false;
  }
}

/**
 * Unmatch two users
 */
export async function unmatchUsers(matchId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'matches', matchId), {
      status: 'unmatched',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unmatching users:', error);
    throw error;
  }
}

/**
 * Update unread count
 */
export async function incrementUnreadCount(matchId: string, forUserId: string): Promise<void> {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');

    const fieldToUpdate = match.user1Id === forUserId ? 'unreadCountUser1' : 'unreadCountUser2';

    await updateDoc(doc(db, 'matches', matchId), {
      [fieldToUpdate]: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing unread count:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(matchId: string, userId: string): Promise<void> {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');

    const fieldToUpdate = match.user1Id === userId ? 'unreadCountUser1' : 'unreadCountUser2';

    await updateDoc(doc(db, 'matches', matchId), {
      [fieldToUpdate]: 0,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Get likes received by a user
 */
export async function getLikesReceived(userId: string): Promise<Like[]> {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('likedId', '==', userId),
      where('isMatched', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(likesQuery);
    const likes: Like[] = [];

    snapshot.forEach(doc => {
      likes.push(doc.data() as Like);
    });

    return likes;
  } catch (error) {
    console.error('Error getting likes received:', error);
    throw error;
  }
}

/**
 * Check if user has liked another user
 */
export async function hasUserLiked(likerId: string, likedId: string): Promise<boolean> {
  try {
    const likeId = `${likerId}_${likedId}`;
    const likeDoc = await getDoc(doc(db, 'likes', likeId));
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking if user has liked:', error);
    return false;
  }
}

/**
 * Unlike a user
 */
export async function unlikeUser(likerId: string, likedId: string): Promise<void> {
  try {
    const likeId = `${likerId}_${likedId}`;
    await deleteDoc(doc(db, 'likes', likeId));
  } catch (error) {
    console.error('Error unliking user:', error);
    throw error;
  }
}
