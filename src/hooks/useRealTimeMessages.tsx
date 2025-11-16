// ✅ MIGRATED TO FIREBASE - Terminal 1 - 2025-01-15
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { sendMessage as sendFirestoreMessage, getMessages, subscribeToMessages, markMessageAsRead } from '@/lib/firestore/messages';
import { db, doc, getDoc } from '@/integrations/firebase';

interface UseRealTimeMessagesProps {
  conversationId?: string;
  matchId?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useRealTimeMessages = ({ conversationId, matchId }: UseRealTimeMessagesProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !matchId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupRealTimeSubscription = async () => {
      try {
        // Fetch initial messages
        await fetchMessages();

        // Set up real-time subscription using the helper
        unsubscribe = subscribeToMessages(matchId, (newMessages) => {
          const transformedMessages: Message[] = newMessages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            messageType: msg.messageType,
            attachmentUrl: msg.attachmentUrl,
            isRead: msg.isRead,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
          }));

          setMessages(transformedMessages);

          // Show notification for new incoming messages
          const latestMessage = transformedMessages[transformedMessages.length - 1];
          if (latestMessage && latestMessage.senderId !== user.uid) {
            toast({
              title: "New message",
              description: latestMessage.content.substring(0, 50) + (latestMessage.content.length > 50 ? '...' : ''),
            });
          }
        });

        console.log('Real-time subscription established for messages');
        setLoading(false);

      } catch (err) {
        console.error('Error setting up real-time messages:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    setupRealTimeSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('Real-time subscription cleaned up');
      }
    };
  }, [user, conversationId, matchId]);

  const fetchMessages = async () => {
    if (!matchId) return;

    try {
      const messagesData = await getMessages(matchId);

      const transformedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        messageType: msg.messageType,
        attachmentUrl: msg.attachmentUrl,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }));

      setMessages(transformedMessages);
      setError(null);

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text', attachmentUrl?: string) => {
    if (!user || !content.trim() || !matchId) {
      return false;
    }

    try {
      // Get the other user ID from the match
      const matchRef = doc(db, 'matches', matchId);
      const matchSnap = await getDoc(matchRef);

      if (!matchSnap.exists()) {
        throw new Error('Match not found');
      }

      const matchData = matchSnap.data();
      const receiverId = matchData.user1Id === user.uid ? matchData.user2Id : matchData.user1Id;

      // Send message using the helper
      await sendFirestoreMessage(
        matchId,
        user.uid,
        receiverId,
        content.trim(),
        messageType,
        attachmentUrl
      );

      // TODO: Send push notification via Cloud Function
      console.log('Message sent, push notification will be implemented via Cloud Functions');

      return true;

    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !matchId) {
      return;
    }

    try {
      // Mark all messages in this match as read
      const unreadMessages = messages.filter(msg =>
        msg.receiverId === user.uid && !msg.isRead
      );

      for (const message of unreadMessages) {
        await markMessageAsRead(message.id);
      }

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.receiverId === user.uid ? { ...msg, isRead: true } : msg
        )
      );

    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const getUnreadCount = (): number => {
    return messages.filter(msg =>
      msg.receiverId === user?.uid && !msg.isRead
    ).length;
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    markMessagesAsRead,
    getUnreadCount,
    refetch: fetchMessages,
  };
};
