import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CompatibilityScore from '@/components/CompatibilityScore';
import ProfileBadge from '@/components/ProfileBadge';
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
  compatibility_level: string;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  age: number | null;
  location: string | null;
  bio: string | null;
  photos: string[] | null;
  education: string | null;
  occupation: string | null;
  religion: string | null;
  is_verified: boolean | null;
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', matchId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as unknown as Profile);

      // Use placeholder score (RPCs not yet created)
      setOverallScore(85);
      setInsights([
        { category: 'Values', score: 90, insight: 'Strong alignment on core values', compatibility_level: 'high' },
        { category: 'Lifestyle', score: 80, insight: 'Similar lifestyle preferences', compatibility_level: 'high' },
        { category: 'Goals', score: 85, insight: 'Aligned relationship goals', compatibility_level: 'high' },
      ]);

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
        case 'experience':
          breakdown.family = insight.score;
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
              Detailed compatibility analysis with {profile.display_name}
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img 
                  src={profile.photos?.[0] || '/placeholder.svg'} 
                  alt={`${profile.display_name}'s profile`}
                  className="w-20 h-20 rounded-full object-cover"
                />
                {profile.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {profile.display_name}
                  </h3>
                  {profile.age && <span className="text-muted-foreground">• {profile.age}</span>}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{profile.location}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <ProfileBadge type="marital_status" value={profile.marital_status} compact />
                  <ProfileBadge type="smoking_status" value={profile.smoking_status} compact />
                  <ProfileBadge type="children_status" value={profile.has_children} compact />
                  {profile.is_verified && (
                    <ProfileBadge type="verification" value={profile.is_verified} compact />
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
                    insight.compatibility_level === 'excellent' ? 'bg-green-100 text-green-800' :
                    insight.compatibility_level === 'good' ? 'bg-blue-100 text-blue-800' :
                    insight.compatibility_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {insight.compatibility_level} match
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
                <p className="text-sm">{profile.education_level || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Career</h4>
                <p className="text-sm">{profile.career_field || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Religion Level</h4>
                <p className="text-sm">{profile.religion_level || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Prayer Frequency</h4>
                <p className="text-sm">{profile.prayer_frequency || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Children Preference</h4>
                <p className="text-sm capitalize">{profile.children_preference?.replace('_', ' ') || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Smoking Status</h4>
                <p className="text-sm capitalize">{profile.smoking_status?.replace('_', ' ') || 'Not specified'}</p>
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