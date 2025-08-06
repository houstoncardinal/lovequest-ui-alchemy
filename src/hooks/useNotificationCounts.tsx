import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationCounts = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    likeYou: 0,
    matches: 0,
    community: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    if (!user) {
      setCounts({ likeYou: 0, matches: 0, community: 0 });
      setLoading(false);
      return;
    }

    try {
      // Get likes received
      const { data: likesData, error: likesError } = await supabase
        .from('user_likes')
        .select('id')
        .eq('liked_id', user.id);

      if (likesError) throw likesError;

      // Get unread messages count from matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          match_conversations (
            unread_count_user1,
            unread_count_user2
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) throw matchesError;

      let unreadMessagesCount = 0;
      matchesData.forEach((match: any) => {
        if (match.match_conversations) {
          // Determine which unread count to use based on user position
          const unreadCount = match.user1_id === user.id 
            ? match.match_conversations.unread_count_user1 
            : match.match_conversations.unread_count_user2;
          unreadMessagesCount += unreadCount || 0;
        }
      });

      // Get community notifications (posts with new comments/likes)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, likes_count, comments_count')
        .eq('user_id', user.id)
        .gt('likes_count', 0);

      if (postsError) throw postsError;

      setCounts({
        likeYou: likesData?.length || 0,
        matches: unreadMessagesCount,
        community: postsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      setCounts({ likeYou: 0, matches: 0, community: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Set up real-time subscriptions for live updates
    const likesChannel = supabase
      .channel('user-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_likes',
          filter: `liked_id=eq.${user?.id}`
        },
        () => fetchCounts()
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => fetchCounts()
      )
      .subscribe();

    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [user]);

  return { counts, loading, refetch: fetchCounts };
};