/**
 * Firestore utilities for messaging operations
 */

import {
  db,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from '@/integrations/firebase';

import { incrementUnreadCount } from './matches';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;

  content: string;
  messageType: 'text' | 'image' | 'voice' | 'video';
  attachmentUrl: string | null;

  isRead: boolean;
  readAt: Timestamp | null;
  isDeleted: boolean;
  deletedBy: string | null;

  sentAt: Timestamp;
}

/**
 * Send a message
 */
export async function sendMessage(
  matchId: string,
  senderId: string,
  receiverId: string,
  content: string,
  messageType: Message['messageType'] = 'text',
  attachmentUrl: string | null = null
): Promise<string> {
  try {
    const messageData: Omit<Message, 'id'> = {
      matchId,
      senderId,
      receiverId,
      content,
      messageType,
      attachmentUrl,
      isRead: false,
      readAt: null,
      isDeleted: false,
      deletedBy: null,
      sentAt: serverTimestamp() as Timestamp,
    };

    const messageRef = await addDoc(
      collection(db, 'matches', matchId, 'messages'),
      messageData
    );

    // Update match with last message
    await updateDoc(doc(db, 'matches', matchId), {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: messageType === 'text' ? content.substring(0, 100) : `[${messageType}]`,
    });

    // Increment unread count for receiver
    await incrementUnreadCount(matchId, receiverId);

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Get messages for a match
 */
export async function getMessages(
  matchId: string,
  limitCount: number = 50
): Promise<Message[]> {
  try {
    const messagesQuery = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('sentAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(messagesQuery);
    const messages: Message[] = [];

    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });

    // Reverse to show oldest first
    return messages.reverse();
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Get messages with pagination
 */
export async function getMessagesPaginated(
  matchId: string,
  limitCount: number = 50,
  lastVisible?: any
): Promise<{ messages: Message[]; lastVisible: any }> {
  try {
    let messagesQuery = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('sentAt', 'desc'),
      limit(limitCount)
    );

    if (lastVisible) {
      messagesQuery = query(messagesQuery, startAfter(lastVisible));
    }

    const snapshot = await getDocs(messagesQuery);
    const messages: Message[] = [];

    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      messages: messages.reverse(),
      lastVisible: newLastVisible,
    };
  } catch (error) {
    console.error('Error getting messages paginated:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time messages
 */
export function subscribeToMessages(
  matchId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const messagesQuery = query(
    collection(db, 'matches', matchId, 'messages'),
    orderBy('sentAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages: Message[] = [];

    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });

    // Reverse to show oldest first
    callback(messages.reverse());
  });
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(matchId: string, messageId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'matches', matchId, 'messages', messageId), {
      isRead: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Mark all messages as read for a user
 */
export async function markAllMessagesAsRead(matchId: string, userId: string): Promise<void> {
  try {
    const messagesQuery = query(
      collection(db, 'matches', matchId, 'messages'),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(messagesQuery);

    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        isRead: true,
        readAt: serverTimestamp(),
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(
  matchId: string,
  messageId: string,
  userId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'matches', matchId, 'messages', messageId), {
      isDeleted: true,
      deletedBy: userId,
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Get unread message count for a user across all matches
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    // This would typically be done via Cloud Function or aggregated in the match document
    // For now, we'll return 0 as a placeholder
    // In production, you'd maintain a counter in the user document
    return 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}

/**
 * Get last message for a match
 */
export async function getLastMessage(matchId: string): Promise<Message | null> {
  try {
    const messagesQuery = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('sentAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(messagesQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Message;
  } catch (error) {
    console.error('Error getting last message:', error);
    return null;
  }
}
