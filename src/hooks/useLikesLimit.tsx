import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
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
  const { userRole, hasFeatureAccess, loading: roleLoading } = useUserRole();
  const [likesUsage, setLikesUsage] = useState<LikesUsage>({
    dailyLikes: 0,
    maxDailyLikes: 5,
    isUnlimited: false,
    canLike: true,
    resetTime: null
  });
  const [loading, setLoading] = useState(true);

  const fetchLikesUsage = async () => {
    if (!user || roleLoading) return;

    try {
      const isUnlimited = hasFeatureAccess('unlimited_likes');
      
      if (isUnlimited) {
        setLikesUsage({
          dailyLikes: 0,
          maxDailyLikes: -1,
          isUnlimited: true,
          canLike: true,
          resetTime: null
        });
        setLoading(false);
        return;
      }

      // Get today's likes count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: likesData, error: likesError } = await supabase
        .from('user_likes')
        .select('id')
        .eq('liker_id', user.id)
        .gte('created_at', today.toISOString());

      if (likesError && likesError.code !== 'PGRST116') {
        throw likesError;
      }

      const dailyLikes = likesData?.length || 0;
      const maxDailyLikes = 5; // Free plan limit
      const canLike = dailyLikes < maxDailyLikes;
      
      // Calculate reset time (next day at midnight)
      const resetTime = new Date(today);
      resetTime.setDate(resetTime.getDate() + 1);

      setLikesUsage({
        dailyLikes,
        maxDailyLikes,
        isUnlimited: false,
        canLike,
        resetTime
      });
    } catch (error) {
      console.error('Error fetching likes usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordLike = async () => {
    if (!likesUsage.isUnlimited) {
      setLikesUsage(prev => ({
        ...prev,
        dailyLikes: prev.dailyLikes + 1,
        canLike: prev.dailyLikes + 1 < prev.maxDailyLikes
      }));
    }
  };

  useEffect(() => {
    fetchLikesUsage();
  }, [user, userRole, roleLoading]);

  return {
    likesUsage,
    loading,
    recordLike,
    refreshUsage: fetchLikesUsage
  };
};