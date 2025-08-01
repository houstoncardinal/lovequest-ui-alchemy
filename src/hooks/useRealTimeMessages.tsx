import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseRealTimeMessagesProps {
  conversationId?: string;
  matchId?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealTimeMessages = ({ conversationId, matchId }: UseRealTimeMessagesProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (!conversationId && !matchId)) {
      setLoading(false);
      return;
    }

    let subscription: any = null;

    const setupRealTimeSubscription = async () => {
      try {
        // Fetch initial messages
        await fetchMessages();

        // Set up real-time subscription for new messages
        subscription = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: matchId ? undefined : `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              console.log('New message received:', payload);
              
              const newMessage = payload.new as Message;
              
              // Only add message if it's relevant to current conversation
              if (isRelevantMessage(newMessage)) {
                setMessages(prev => {
                  // Avoid duplicates
                  if (prev.find(msg => msg.id === newMessage.id)) {
                    return prev;
                  }
                  return [...prev, newMessage].sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  );
                });

                // Show notification for incoming messages (not from current user)
                if (newMessage.sender_id !== user.id) {
                  toast({
                    title: "New message",
                    description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
                  });
                }
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'messages',
              filter: matchId ? undefined : `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              console.log('Message updated:', payload);
              
              const updatedMessage = payload.new as Message;
              
              if (isRelevantMessage(updatedMessage)) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === updatedMessage.id ? updatedMessage : msg
                  )
                );
              }
            }
          )
          .subscribe();

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
      if (subscription) {
        supabase.removeChannel(subscription);
        console.log('Real-time subscription cleaned up');
      }
    };
  }, [user, conversationId, matchId]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(
            display_name,
            avatar_url,
            first_name
          )
        `)
        .order('created_at', { ascending: true });

      if (conversationId) {
        // If we have a conversation ID, filter by it
        // Note: This would require a conversation_id field in messages table
        // For now, we'll skip this filtering
      } else if (matchId) {
        // Get messages for this match by finding sender/receiver combinations
        const { data: match } = await supabase
          .from('matches')
          .select('user1_id, user2_id')
          .eq('id', matchId)
          .single();

        if (match && user) {
          // Filter messages between the two users in this match
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setMessages(data || []);
      setError(null);

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text', attachmentUrl?: string) => {
    if (!user || !content.trim()) {
      return false;
    }

    try {
      // Get the other user ID from the match
      let receiverId: string;
      
      if (matchId) {
        const { data: match } = await supabase
          .from('matches')
          .select('user1_id, user2_id')
          .eq('id', matchId)
          .single();

        if (!match) {
          throw new Error('Match not found');
        }

        receiverId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      } else {
        throw new Error('Match ID is required to send messages');
      }

      const messageData = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        message_type: messageType,
        attachment_url: attachmentUrl,
        is_read: false,
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) {
        throw error;
      }

      // Send push notification to receiver
      try {
        await supabase.functions.invoke('push-notifications', {
          body: {
            notifications: [{
              user_id: receiverId,
              title: "New message",
              body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
              type: 'message',
              data: {
                sender_id: user.id,
                match_id: matchId,
              }
            }]
          }
        });
      } catch (notifError) {
        console.warn('Failed to send push notification:', notifError);
        // Don't fail the message send if notification fails
      }

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
    if (!user || !conversationId) {
      return;
    }

    try {
      // For now, mark messages as read directly in the database
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.receiver_id === user.id ? { ...msg, is_read: true } : msg
        )
      );

    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const isRelevantMessage = (message: Message): boolean => {
    if (!user) return false;
    
    // Message is relevant if current user is sender or receiver
    return message.sender_id === user.id || message.receiver_id === user.id;
  };

  const getUnreadCount = (): number => {
    return messages.filter(msg => 
      msg.receiver_id === user?.id && !msg.is_read
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