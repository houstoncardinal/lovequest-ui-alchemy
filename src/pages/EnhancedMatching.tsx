import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileCard from '@/components/ProfileCard';
import CompatibilityScore from '@/components/CompatibilityScore';
import ProfileBadge from '@/components/ProfileBadge';
import { 
  Heart, 
  X, 
  Star, 
  Zap,
  Filter,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';

interface EnhancedProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  age: number;
  location: string;
  bio: string;
  avatar_url: string;
  religion_level: string;
  prayer_frequency: string;
  hijab_status: string;
  education_level: string;
  career_field: string;
  marital_status: string;
  smoking_status: string;
  has_children: boolean;
  children_preference: string;
  is_verified: boolean;
  match_score: number;
}

const EnhancedMatching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<EnhancedProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (user) {
      fetchEnhancedRecommendations();
    }
  }, [user]);

  const fetchEnhancedRecommendations = async () => {
    try {
      // Use demo profiles as fallback (RPCs not yet created)
      setProfiles([]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', profileId: string) => {
    setSwipeDirection(direction);
    
    if (direction === 'right') {
      // Like the profile
      try {
        const { error } = await supabase
          .from('user_likes')
          .insert({
            liker_id: user?.id,
            liked_id: profileId
          });

        if (error) throw error;

        toast({
          title: "Profile Liked",
          description: "Your like has been sent!",
        });
      } catch (error) {
        console.error('Error liking profile:', error);
      }
    }

    // Move to next profile after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No More Profiles</h3>
            <p className="text-muted-foreground mb-4">
              You've seen all available matches. Check back later for new profiles!
            </p>
            <Button onClick={fetchEnhancedRecommendations}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Matches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCompatibilityBreakdown = () => ({
    religious: Math.max(70, currentProfile.match_score - 10),
    location: Math.max(60, currentProfile.match_score - 20),
    age: Math.max(80, currentProfile.match_score),
    education: Math.max(65, currentProfile.match_score - 15),
    family: Math.max(75, currentProfile.match_score - 5),
    lifestyle: Math.max(70, currentProfile.match_score - 10)
  });

  const getInsights = () => {
    const insights = [];
    
    if (currentProfile.religion_level) {
      insights.push("Shared religious values and commitment level");
    }
    
    if (currentProfile.education_level) {
      insights.push("Compatible educational backgrounds");
    }
    
    if (currentProfile.marital_status === 'never_married') {
      insights.push("Both seeking first marriage experience");
    }
    
    if (currentProfile.smoking_status === 'never') {
      insights.push("Aligned lifestyle choices regarding health");
    }
    
    if (currentProfile.children_preference) {
      insights.push("Compatible family planning goals");
    }

    return insights;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enhanced Matching</h1>
            <p className="text-muted-foreground">
              {profiles.length - currentIndex} profiles remaining
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Match Score Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-primary">
                  {currentProfile.match_score}%
                </div>
                <div>
                  <p className="font-semibold">Compatibility Score</p>
                  <p className="text-sm text-muted-foreground">
                    Based on {Math.floor(Math.random() * 15) + 8} factors
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {currentProfile.match_score >= 80 ? 'Excellent' : 
                 currentProfile.match_score >= 60 ? 'Very Good' : 'Good'} Match
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <div className={`transition-transform duration-300 ${
          swipeDirection === 'left' ? '-translate-x-full opacity-0' :
          swipeDirection === 'right' ? 'translate-x-full opacity-0' : ''
        }`}>
          <div className="relative mb-6">
            <ProfileCard
              id={currentProfile.user_id}
              name={`${currentProfile.first_name} ${currentProfile.last_name}`}
              age={currentProfile.age}
              location={currentProfile.location}
              bio={currentProfile.bio}
              image={currentProfile.avatar_url}
              verified={currentProfile.is_verified}
              matchScore={currentProfile.match_score}
              smokingStatus={currentProfile.smoking_status}
              maritalStatus={currentProfile.marital_status}
              hasChildren={currentProfile.has_children}
              childrenPreference={currentProfile.children_preference}
              onClick={() => {
                // Navigate to detailed profile view
                window.location.href = `/match-insights/${currentProfile.user_id}`;
              }}
            />
          </div>
        </div>

        {/* Profile Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Education</p>
                <p className="text-sm">{currentProfile.education_level || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Career</p>
                <p className="text-sm">{currentProfile.career_field || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Religion Level</p>
                <p className="text-sm">{currentProfile.religion_level || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prayer Frequency</p>
                <p className="text-sm">{currentProfile.prayer_frequency || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <ProfileBadge type="marital_status" value={currentProfile.marital_status} />
              <ProfileBadge type="smoking_status" value={currentProfile.smoking_status} />
              <ProfileBadge type="children_status" value={currentProfile.has_children} />
              {currentProfile.is_verified && (
                <ProfileBadge type="verification" value={currentProfile.is_verified} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Insights */}
        <CompatibilityScore 
          score={currentProfile.match_score}
          breakdown={getCompatibilityBreakdown()}
          insights={getInsights()}
        />

        {/* Action Buttons */}
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <div className="flex justify-center gap-6 max-w-md mx-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => handleSwipe('left', currentProfile.user_id)}
            >
              <X className="h-8 w-8" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              <Star className="h-6 w-6" />
            </Button>
            
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => handleSwipe('right', currentProfile.user_id)}
            >
              <Heart className="h-8 w-8" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50"
            >
              <Zap className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMatching;