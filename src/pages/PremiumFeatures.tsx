// ✅ MIGRATED TO FIREBASE - Final Migration - 2025-01-15
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, getDocs, doc, getDoc, setDoc } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';
import PremiumBadge from '@/components/PremiumBadge';
import { 
  Crown, 
  Zap, 
  Eye, 
  Heart, 
  MessageCircle, 
  Shield, 
  Star, 
  TrendingUp,
  Users,
  Video,
  Search,
  CheckCircle,
  Lock
} from 'lucide-react';

interface PremiumSubscription {
  planType: 'basic' | 'premium' | 'platinum';
  isActive: boolean;
  endDate: string;
}

interface FeatureUsage {
  featureType: string;
  usageCount: number;
  resetDate: string;
}

const PremiumFeatures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchFeatureUsage();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      // Fetch from userRoles collection
      const rolesQuery = query(
        collection(db, 'userRoles'),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(rolesQuery);

      if (!querySnapshot.empty) {
        const roleDoc = querySnapshot.docs[0];
        const data = roleDoc.data();
        setSubscription({
          planType: data.planType || 'basic',
          isActive: data.isActive ?? true,
          endDate: data.subscriptionEnd || ''
        });
      } else {
        // Default to basic plan if no subscription found
        setSubscription({
          planType: 'basic',
          isActive: true,
          endDate: ''
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchFeatureUsage = async () => {
    if (!user) return;

    try {
      const usageQuery = query(
        collection(db, 'featureUsage'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(usageQuery);

      const usageData: FeatureUsage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usageData.push({
          featureType: data.featureType || '',
          usageCount: data.usageCount || 0,
          resetDate: data.resetDate || ''
        });
      });

      setFeatureUsage(usageData);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      type: 'basic' as const,
      name: 'Basic',
      price: 'Free',
      period: '',
      features: [
        'Basic profile creation',
        '5 likes per day',
        'Basic matching algorithm',
        'Standard support'
      ],
      limits: {
        likes: 5,
        superLikes: 1,
        boosts: 0,
        rewinds: 0
      }
    },
    {
      type: 'premium' as const,
      name: 'Premium',
      price: '$19.99',
      period: '/month',
      features: [
        'Unlimited likes',
        'See who liked you',
        'Enhanced matching algorithm',
        '5 Super Likes per day',
        '1 Boost per month',
        'Read receipts',
        'Advanced filters',
        'Priority support'
      ],
      limits: {
        likes: -1, // unlimited
        superLikes: 5,
        boosts: 1,
        rewinds: 5
      }
    },
    {
      type: 'platinum' as const,
      name: 'Platinum',
      price: '$39.99',
      period: '/month',
      features: [
        'Everything in Premium',
        'Profile verification priority',
        'Video calls with matches',
        'Family introduction tools',
        'Advanced compatibility insights',
        'Message before matching',
        'Unlimited rewinds',
        'VIP customer support'
      ],
      limits: {
        likes: -1,
        superLikes: 10,
        boosts: 5,
        rewinds: -1
      }
    }
  ];

  const premiumFeatures = [
    {
      icon: Eye,
      title: 'See Who Likes You',
      description: 'Skip the guessing game and see everyone who has already liked your profile',
      planRequired: 'premium'
    },
    {
      icon: TrendingUp,
      title: 'Profile Boost',
      description: 'Be one of the top profiles in your area for 30 minutes',
      planRequired: 'premium'
    },
    {
      icon: Star,
      title: 'Super Like',
      description: 'Show someone you\'re really interested with a Super Like',
      planRequired: 'premium'
    },
    {
      icon: Search,
      title: 'Advanced Filters',
      description: 'Filter by education, religion level, career, and more',
      planRequired: 'premium'
    },
    {
      icon: Video,
      title: 'Video Calls',
      description: 'Have secure video calls with your matches',
      planRequired: 'platinum'
    },
    {
      icon: Users,
      title: 'Family Features',
      description: 'Tools for involving family in the courtship process',
      planRequired: 'platinum'
    },
    {
      icon: Shield,
      title: 'Verification Priority',
      description: 'Get your profile verified faster with priority review',
      planRequired: 'platinum'
    },
    {
      icon: MessageCircle,
      title: 'Message Before Match',
      description: 'Send a message along with your like',
      planRequired: 'platinum'
    }
  ];

  const getUsageForFeature = (featureType: string) => {
    return featureUsage.find(usage => usage.featureType === featureType)?.usageCount || 0;
  };

  const getCurrentPlan = () => {
    return subscription?.planType || 'basic';
  };

  const hasAccess = (requiredPlan: string) => {
    const currentPlan = getCurrentPlan();
    const planHierarchy = { basic: 0, premium: 1, platinum: 2 };
    return planHierarchy[currentPlan as keyof typeof planHierarchy] >= 
           planHierarchy[requiredPlan as keyof typeof planHierarchy];
  };

  const upgradePlan = async (planType: 'premium' | 'platinum') => {
    try {
      // In a real app, integrate with payment processor here
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      if (!user) return;

      const roleRef = doc(db, 'userRoles', user.uid);
      await setDoc(roleRef, {
        userId: user.uid,
        planType: planType,
        isActive: true,
        subscriptionEnd: endDate.toISOString(),
        subscriptionStart: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Subscription Updated",
        description: `You've successfully upgraded to ${planType}!`,
      });

      fetchSubscription();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading premium features...</p>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Premium Features</h1>
            <PremiumBadge plan={currentPlan} size="md" />
          </div>
          <p className="text-muted-foreground">
            Unlock the full potential of your LoveQuest experience
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <PremiumBadge plan={currentPlan} size="lg" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription && currentPlan !== 'basic' ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your {subscription.planType} subscription is active until{' '}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  23 days remaining
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You're currently on the basic plan. Upgrade to unlock premium features!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feature Usage */}
        {currentPlan !== 'basic' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Feature Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Super Likes</span>
                    <span>{getUsageForFeature('super_likes')}/5</span>
                  </div>
                  <Progress value={(getUsageForFeature('super_likes') / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Boosts</span>
                    <span>{getUsageForFeature('boosts')}/1</span>
                  </div>
                  <Progress value={(getUsageForFeature('boosts') / 1) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Premium Features</h2>
          <div className="grid gap-4">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className={`${hasAccess(feature.planRequired) ? 'border-primary/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${hasAccess(feature.planRequired) ? 'bg-primary/10' : 'bg-muted'}`}>
                      <feature.icon className={`h-5 w-5 ${hasAccess(feature.planRequired) ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{feature.title}</h3>
                        {hasAccess(feature.planRequired) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {feature.description}
                      </p>
                      <Badge variant={hasAccess(feature.planRequired) ? 'default' : 'secondary'}>
                        {feature.planRequired === 'premium' ? 'Premium' : 'Platinum'} Feature
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Plan</h2>
          {plans.map((plan) => (
            <Card key={plan.type} className={`${plan.type === currentPlan ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      <PremiumBadge plan={plan.type} />
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  {plan.type === currentPlan ? (
                    <Badge variant="default">Current Plan</Badge>
                  ) : (
                    <Button 
                      onClick={() => upgradePlan(plan.type as 'premium' | 'platinum')}
                      disabled={plan.type === 'basic'}
                    >
                      {plan.type === 'basic' ? 'Free' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;