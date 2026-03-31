import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationCounts = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ likeYou: 0, matches: 0, community: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    if (!user) {
      setCounts({ likeYou: 0, matches: 0, community: 0 });
      setLoading(false);
      return;
    }

    try {
      // Unread messages count
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .eq('is_read', false);

      // Community posts with engagement
      const { count: communityCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .gt('likes_count', 0);

      setCounts({
        likeYou: 0,
        matches: msgCount || 0,
        community: communityCount || 0,
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
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return { counts, loading, refetch: fetchCounts };
};
