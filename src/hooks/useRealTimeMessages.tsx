import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  match_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface UseRealTimeMessagesProps {
  conversationId?: string;
  matchId?: string;
}

export const useRealTimeMessages = ({ matchId }: UseRealTimeMessagesProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!user || !matchId) return;
    try {
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      if (err) throw err;
      setMessages(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType = 'text') => {
    if (!user || !matchId || !content.trim()) return false;
    try {
      const { error: err } = await supabase.from('messages').insert({
        sender_id: user.id,
        match_id: matchId,
        content: content.trim(),
        message_type: messageType,
      });
      if (err) throw err;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
      return false;
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !matchId) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
      setMessages(prev => prev.map(msg => msg.sender_id !== user.id ? { ...msg, is_read: true } : msg));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const getUnreadCount = () => messages.filter(msg => msg.sender_id !== user?.id && !msg.is_read).length;

  useEffect(() => {
    fetchMessages();
    if (!matchId) return;

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.sender_id !== user?.id) {
          toast({ title: "New message", description: newMsg.content.substring(0, 50) });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, matchId]);

  return { messages, loading, error, sendMessage, markMessagesAsRead, getUnreadCount, refetch: fetchMessages };
};
