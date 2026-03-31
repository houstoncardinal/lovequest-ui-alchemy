import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationCounts = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ likeYou: 0, matches: 0, community: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    if (!user?.id) {
      setCounts({ likeYou: 0, matches: 0, community: 0 });
      setLoading(false);
      return;
    }

    try {
      // Count unread notifications by type
      const { data: notifications } = await supabase
        .from('notifications')
        .select('type')
        .eq('user_id', user.id)
        .eq('is_read', false);

      const likeCount = (notifications || []).filter(n => n.type === 'like' || n.type === 'superlike').length;
      const matchMsgCount = (notifications || []).filter(n => n.type === 'match' || n.type === 'message').length;
      const communityCount = (notifications || []).filter(n => n.type === 'community').length;

      setCounts({
        likeYou: likeCount,
        matches: matchMsgCount,
        community: communityCount,
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
  }, [user?.id]);

  return { counts, loading, refetch: fetchCounts };
};
