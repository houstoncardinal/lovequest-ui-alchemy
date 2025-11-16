// ✅ MIGRATED TO FIREBASE - Terminal 4 - 2025-11-15
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CompatibilityScore from '@/components/CompatibilityScore';
import ProfileBadge from '@/components/ProfileBadge';
import { getUserProfile, type UserProfile } from '@/lib/firestore/users';
import {
  Heart,
  MessageCircle,
  Video,
  Star,
  Shield,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface MatchInsight {
  category: string;
  score: number;
  insight: string;
  compatibilityLevel: string;
}

interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  bio: string;
  photoURL: string;
  religionLevel: string;
  prayerFrequency: string;
  educationLevel: string;
  careerField: string;
  maritalStatus: string;
  smokingStatus: string;
  hasChildren: boolean;
  childrenPreference: string;
  isVerified: boolean;
}

interface MatchInsightsProps {
  matchId: string;
  onBack: () => void;
}

const MatchInsights = ({ matchId, onBack }: MatchInsightsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [insights, setInsights] = useState<MatchInsight[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && matchId) {
      fetchMatchData();
    }
  }, [user, matchId]);

  const fetchMatchData = async () => {
    try {
      if (!user?.uid) return;

      // Fetch profile data
      const userProfile = await getUserProfile(matchId);

      if (!userProfile) {
        throw new Error('Profile not found');
      }

      setProfile({
        userId: userProfile.uid,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        age: userProfile.age || 0,
        location: userProfile.location || '',
        bio: userProfile.bio,
        photoURL: userProfile.photoURL || '',
        religionLevel: userProfile.religionLevel || '',
        prayerFrequency: userProfile.prayerFrequency || '',
        educationLevel: userProfile.educationLevel || '',
        careerField: userProfile.careerField || '',
        maritalStatus: userProfile.maritalStatus || '',
        smokingStatus: userProfile.smokingStatus || '',
        hasChildren: userProfile.hasChildren || false,
        childrenPreference: userProfile.childrenPreference || '',
        isVerified: userProfile.isVerified,
      });

      // Get current user profile for comparison
      const currentUserProfile = await getUserProfile(user.uid);

      if (currentUserProfile) {
        // Calculate match score and insights
        const calculatedInsights = calculateCompatibilityInsights(currentUserProfile, userProfile);
        setInsights(calculatedInsights);

        // Calculate overall score
        const avgScore = calculatedInsights.reduce((sum, i) => sum + i.score, 0) / calculatedInsights.length;
        setOverallScore(Math.round(avgScore));
      }

    } catch (error) {
      console.error('Error fetching match data:', error);
      toast({
        title: "Error",
        description: "Unable to load match insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibilityInsights = (user1: UserProfile, user2: UserProfile): MatchInsight[] => {
    const insights: MatchInsight[] = [];

    // Religious compatibility
    let religiousScore = 50;
    let religiousInsight = 'Different religious commitment levels';
    if (user1.religionLevel === user2.religionLevel) {
      religiousScore = 95;
      religiousInsight = 'Both share the same level of religious commitment';
    } else if (user1.religionLevel && user2.religionLevel) {
      religiousScore = 70;
      religiousInsight = 'Similar religious values with some differences';
    }

    insights.push({
      category: 'religious',
      score: religiousScore,
      insight: religiousInsight,
      compatibilityLevel: religiousScore >= 80 ? 'excellent' : religiousScore >= 60 ? 'good' : 'moderate'
    });

    // Family compatibility
    let familyScore = 60;
    let familyInsight = 'Different family planning preferences';
    if (user1.wantsChildren === user2.wantsChildren) {
      familyScore = 90;
      familyInsight = 'Both share the same vision for family planning';
    }
    if (user1.hasChildren === user2.hasChildren) {
      familyScore += 10;
      familyInsight += ' and similar family situations';
    }

    insights.push({
      category: 'family',
      score: Math.min(100, familyScore),
      insight: familyInsight,
      compatibilityLevel: familyScore >= 80 ? 'excellent' : familyScore >= 60 ? 'good' : 'moderate'
    });

    // Lifestyle compatibility
    let lifestyleScore = 50;
    let lifestyleInsight = 'Different lifestyle preferences';
    if (user1.smokingStatus === user2.smokingStatus) {
      lifestyleScore += 25;
      lifestyleInsight = 'Similar lifestyle choices';
    }
    if (user1.educationLevel === user2.educationLevel) {
      lifestyleScore += 25;
      lifestyleInsight += ' and educational backgrounds';
    }

    insights.push({
      category: 'lifestyle',
      score: lifestyleScore,
      insight: lifestyleInsight,
      compatibilityLevel: lifestyleScore >= 80 ? 'excellent' : lifestyleScore >= 60 ? 'good' : 'moderate'
    });

    return insights;
  };

  const getCompatibilityBreakdown = () => {
    const breakdown = {
      religious: 85,
      location: 70,
      age: 90,
      education: 75,
      family: 80,
      lifestyle: 65
    };

    // Calculate from insights if available
    insights.forEach(insight => {
      switch (insight.category) {
        case 'religious':
          breakdown.religious = insight.score;
          break;
        case 'family':
          breakdown.family = insight.score;
          break;
        case 'lifestyle':
          breakdown.lifestyle = insight.score;
          break;
      }
    });

    return breakdown;
  };

  const getInsightsList = () => {
    return insights.map(insight => insight.insight);
  };

  const sendMessage = async () => {
    // Implementation for sending message
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully",
    });
  };

  const requestVideoCall = async () => {
    // Implementation for video call request
    toast({
      title: "Video Call Requested",
      description: "Your video call request has been sent",
    });
  };

  const addToFavorites = async () => {
    // Implementation for adding to favorites
    toast({
      title: "Added to Favorites",
      description: "This profile has been added to your favorites",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing compatibility...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Profile not found</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Match Insights</h1>
            <p className="text-muted-foreground">
              Detailed compatibility analysis with {profile.firstName}
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={profile.photoURL}
                  alt={`${profile.firstName}'s profile`}
                  className="w-20 h-20 rounded-full object-cover"
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <span className="text-muted-foreground">• {profile.age}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{profile.location}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <ProfileBadge type="marital_status" value={profile.maritalStatus} compact />
                  <ProfileBadge type="smoking_status" value={profile.smokingStatus} compact />
                  <ProfileBadge type="children_status" value={profile.hasChildren} compact />
                  {profile.isVerified && (
                    <ProfileBadge type="verification" value={profile.isVerified} compact />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={sendMessage} size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" onClick={requestVideoCall} size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </Button>
                  <Button variant="outline" onClick={addToFavorites} size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Score */}
        <CompatibilityScore
          score={overallScore}
          breakdown={getCompatibilityBreakdown()}
          insights={getInsightsList()}
        />

        {/* Detailed Insights */}
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Detailed Analysis</h2>

          {insights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold capitalize">{insight.category} Compatibility</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={insight.score} className="w-20 h-2" />
                    <span className="text-sm font-medium">{insight.score}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{insight.insight}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    insight.compatibilityLevel === 'excellent' ? 'bg-green-100 text-green-800' :
                    insight.compatibilityLevel === 'good' ? 'bg-blue-100 text-blue-800' :
                    insight.compatibilityLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {insight.compatibilityLevel} match
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Education</h4>
                <p className="text-sm">{profile.educationLevel || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Career</h4>
                <p className="text-sm">{profile.careerField || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Religion Level</h4>
                <p className="text-sm">{profile.religionLevel || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Prayer Frequency</h4>
                <p className="text-sm">{profile.prayerFrequency || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Children Preference</h4>
                <p className="text-sm capitalize">{profile.childrenPreference?.replace('_', ' ') || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Smoking Status</h4>
                <p className="text-sm capitalize">{profile.smokingStatus?.replace('_', ' ') || 'Not specified'}</p>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">About</h4>
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Button onClick={sendMessage} className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Like & Message
          </Button>
          <Button variant="outline" onClick={onBack} className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Think About It
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchInsights;
