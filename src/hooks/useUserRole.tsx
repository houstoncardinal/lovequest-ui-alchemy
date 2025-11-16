// ✅ MIGRATED TO FIREBASE - Terminal 1 - 2025-01-15
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, getDocs, setDoc, doc } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';

export type UserPlanType = 'free' | 'premium' | 'elite';

interface UserRole {
  id: string;
  userId: string;
  planType: UserPlanType;
  isActive: boolean;
  featuresEnabled: Record<string, boolean>;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  createdAt: string;
  updatedAt: string;
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
      const rolesQuery = query(
        collection(db, 'userRoles'),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(rolesQuery);

      if (!querySnapshot.empty) {
        const roleDoc = querySnapshot.docs[0];
        setUserRole({ id: roleDoc.id, ...roleDoc.data() } as UserRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (featureName: string): boolean => {
    if (!userRole) return false;

    // Check custom feature overrides first
    if (userRole.featuresEnabled && userRole.featuresEnabled[featureName] !== undefined) {
      return userRole.featuresEnabled[featureName];
    }

    // Define feature access by plan
    const planType = userRole.planType;
    
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

      const roleRef = doc(db, 'userRoles', user.uid);
      await setDoc(roleRef, {
        userId: user.uid,
        planType: planType,
        isActive: true,
        subscriptionStart: planType !== 'free' ? subscriptionStart : null,
        subscriptionEnd: planType !== 'free' ? subscriptionEnd.toISOString() : null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

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
    } finally {
      setLoading(false);
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