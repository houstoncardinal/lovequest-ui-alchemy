import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserPlanType = 'free' | 'premium' | 'elite';

interface UserRole {
  id: string;
  user_id: string;
  plan_type: UserPlanType;
  is_active: boolean;
  features_enabled: Record<string, boolean>;
  subscription_start?: string;
  subscription_end?: string;
  created_at: string;
  updated_at: string;
}

interface UseUserRoleReturn {
  userRole: UserRole | null;
  loading: boolean;
  hasFeatureAccess: (featureName: string) => boolean;
  updateUserPlan: (planType: UserPlanType) => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data as UserRole);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (featureName: string): boolean => {
    if (!userRole) return false;

    // Check custom feature overrides first
    if (userRole.features_enabled && userRole.features_enabled[featureName] !== undefined) {
      return userRole.features_enabled[featureName];
    }

    // Define feature access by plan
    const planType = userRole.plan_type;
    
    switch (featureName) {
      case 'video_messaging':
        return planType === 'premium' || planType === 'elite';
      case 'voice_notes':
      case 'emojis':
        return true; // Available to all plans
      case 'unlimited_likes':
      case 'see_who_liked_you':
      case 'advanced_filters':
      case 'read_receipts':
      case 'profile_boost':
      case 'super_likes':
      case 'paid_messages':
        return planType === 'premium' || planType === 'elite';
      case 'video_calls':
      case 'unlimited_paid_messages':
      case 'profile_verification_priority':
      case 'advanced_analytics':
      case 'concierge_matching':
      case 'custom_filters':
      case 'profile_insights':
        return planType === 'elite';
      default:
        return false;
    }
  };

  const updateUserPlan = async (planType: UserPlanType) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const subscriptionStart = new Date().toISOString();
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          plan_type: planType,
          is_active: true,
          subscription_start: planType !== 'free' ? subscriptionStart : null,
          subscription_end: planType !== 'free' ? subscriptionEnd.toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Plan Updated",
        description: `You've successfully ${planType === 'free' ? 'downgraded to' : 'upgraded to'} ${planType}!`,
      });

      await fetchUserRole();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshUserRole = async () => {
    await fetchUserRole();
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  return {
    userRole,
    loading,
    hasFeatureAccess,
    updateUserPlan,
    refreshUserRole,
  };
};