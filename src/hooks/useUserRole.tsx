import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserPlanType = 'free' | 'premium' | 'elite';

interface UseUserRoleReturn {
  userRole: { role: string } | null;
  loading: boolean;
  hasFeatureAccess: (featureName: string) => boolean;
  updateUserPlan: (planType: UserPlanType) => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setUserRole(data || { role: 'user' });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole({ role: 'user' });
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (featureName: string): boolean => {
    const role = userRole?.role || 'user';
    if (role === 'admin') return true;
    // Default: free users have basic access
    const premiumFeatures = ['unlimited_likes', 'see_who_liked_you', 'advanced_filters', 'read_receipts', 'profile_boost', 'super_likes', 'video_messaging'];
    const eliteFeatures = ['video_calls', 'advanced_analytics', 'concierge_matching'];
    if (premiumFeatures.includes(featureName)) return false;
    if (eliteFeatures.includes(featureName)) return false;
    return true;
  };

  const updateUserPlan = async (_planType: UserPlanType) => {
    // Will be connected to Stripe later
  };

  const refreshUserRole = async () => { await fetchUserRole(); };

  useEffect(() => { fetchUserRole(); }, [user]);

  return { userRole, loading, hasFeatureAccess, updateUserPlan, refreshUserRole };
};
