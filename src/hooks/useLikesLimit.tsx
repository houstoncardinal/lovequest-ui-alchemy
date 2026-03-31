import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface LikesUsage {
  dailyLikes: number;
  maxDailyLikes: number;
  isUnlimited: boolean;
  canLike: boolean;
  resetTime: Date | null;
}

export const useLikesLimit = () => {
  const { user } = useAuth();
  const [likesUsage, setLikesUsage] = useState<LikesUsage>({
    dailyLikes: 0, maxDailyLikes: 5, isUnlimited: false, canLike: true, resetTime: null
  });
  const [loading, setLoading] = useState(true);

  const fetchLikesUsage = async () => {
    if (!user) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('liker_id', user.id)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const dailyLikes = count || 0;
      const maxDailyLikes = 5;
      const resetTime = new Date(today);
      resetTime.setDate(resetTime.getDate() + 1);

      setLikesUsage({
        dailyLikes, maxDailyLikes, isUnlimited: false,
        canLike: dailyLikes < maxDailyLikes, resetTime
      });
    } catch (error) {
      console.error('Error fetching likes usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordLike = async () => {
    setLikesUsage(prev => ({
      ...prev, dailyLikes: prev.dailyLikes + 1,
      canLike: prev.dailyLikes + 1 < prev.maxDailyLikes
    }));
  };

  useEffect(() => { fetchLikesUsage(); }, [user]);

  return { likesUsage, loading, recordLike, refreshUsage: fetchLikesUsage };
};
