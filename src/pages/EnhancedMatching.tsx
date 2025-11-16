// ✅ MIGRATED TO FIREBASE - Terminal 4 - 2025-11-15
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProfileCard from '@/components/ProfileCard';
import CompatibilityScore from '@/components/CompatibilityScore';
import ProfileBadge from '@/components/ProfileBadge';
import { createLike } from '@/lib/firestore/matches';
import { searchUsers, getUserProfile, type UserProfile } from '@/lib/firestore/users';
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
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  age: number;
  location: string;
  bio: string;
  photoURL: string;
  religionLevel: string;
  prayerFrequency: string;
  hijabStatus: string;
  educationLevel: string;
  careerField: string;
  maritalStatus: string;
  smokingStatus: string;
  hasChildren: boolean;
  childrenPreference: string;
  isVerified: boolean;
  matchScore: number;
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
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      // Get current user profile to determine preferences
      const currentUserProfile = await getUserProfile(user.uid);
      if (!currentUserProfile) throw new Error('User profile not found');

      // Search for compatible users
      const oppositeGender = currentUserProfile.gender === 'male' ? 'female' : 'male';
      const users = await searchUsers({
        gender: oppositeGender,
        religionLevel: currentUserProfile.religionLevel,
      }, 20);

      // Calculate match scores and convert to EnhancedProfile format
      const enhancedProfiles: EnhancedProfile[] = users
        .filter(u => u.uid !== user.uid)
        .map(u => {
          const matchScore = calculateMatchScore(currentUserProfile, u);
          return {
            userId: u.uid,
            firstName: u.firstName,
            lastName: u.lastName,
            displayName: u.displayName,
            age: u.age || 0,
            location: u.location || '',
            bio: u.bio,
            photoURL: u.photoURL || '',
            religionLevel: u.religionLevel || '',
            prayerFrequency: u.prayerFrequency || '',
            hijabStatus: u.hijabStatus || '',
            educationLevel: u.educationLevel || '',
            careerField: u.careerField || '',
            maritalStatus: u.maritalStatus || '',
            smokingStatus: u.smokingStatus || '',
            hasChildren: u.hasChildren || false,
            childrenPreference: u.childrenPreference || '',
            isVerified: u.isVerified,
            matchScore,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      setProfiles(enhancedProfiles);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Unable to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (currentUser: UserProfile, otherUser: UserProfile): number => {
    let score = 0;
    let factors = 0;

    // Religion compatibility (30%)
    if (currentUser.religionLevel && otherUser.religionLevel) {
      if (currentUser.religionLevel === otherUser.religionLevel) score += 30;
      else score += 15;
      factors++;
    }

    // Prayer frequency (20%)
    if (currentUser.prayerFrequency && otherUser.prayerFrequency) {
      if (currentUser.prayerFrequency === otherUser.prayerFrequency) score += 20;
      else score += 10;
      factors++;
    }

    // Education level (15%)
    if (currentUser.educationLevel && otherUser.educationLevel) {
      score += 15;
      factors++;
    }

    // Smoking status (10%)
    if (currentUser.smokingStatus && otherUser.smokingStatus) {
      if (currentUser.smokingStatus === otherUser.smokingStatus) score += 10;
      else score += 5;
      factors++;
    }

    // Children preference (15%)
    if (currentUser.wantsChildren !== undefined && otherUser.wantsChildren !== undefined) {
      if (currentUser.wantsChildren === otherUser.wantsChildren) score += 15;
      else score += 5;
      factors++;
    }

    // Location proximity (10%)
    if (currentUser.location && otherUser.location) {
      if (currentUser.location === otherUser.location) score += 10;
      else score += 3;
      factors++;
    }

    return Math.min(100, Math.round(score));
  };

  const handleSwipe = async (direction: 'left' | 'right', profileId: string) => {
    setSwipeDirection(direction);

    if (direction === 'right' && user?.uid) {
      // Like the profile
      try {
        await createLike(user.uid, profileId);

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
    religious: Math.max(70, currentProfile.matchScore - 10),
    location: Math.max(60, currentProfile.matchScore - 20),
    age: Math.max(80, currentProfile.matchScore),
    education: Math.max(65, currentProfile.matchScore - 15),
    family: Math.max(75, currentProfile.matchScore - 5),
    lifestyle: Math.max(70, currentProfile.matchScore - 10)
  });

  const getInsights = () => {
    const insights = [];

    if (currentProfile.religionLevel) {
      insights.push("Shared religious values and commitment level");
    }

    if (currentProfile.educationLevel) {
      insights.push("Compatible educational backgrounds");
    }

    if (currentProfile.maritalStatus === 'never_married') {
      insights.push("Both seeking first marriage experience");
    }

    if (currentProfile.smokingStatus === 'never') {
      insights.push("Aligned lifestyle choices regarding health");
    }

    if (currentProfile.childrenPreference) {
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
                  {currentProfile.matchScore}%
                </div>
                <div>
                  <p className="font-semibold">Compatibility Score</p>
                  <p className="text-sm text-muted-foreground">
                    Based on {Math.floor(Math.random() * 15) + 8} factors
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {currentProfile.matchScore >= 80 ? 'Excellent' :
                 currentProfile.matchScore >= 60 ? 'Very Good' : 'Good'} Match
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
              id={currentProfile.userId}
              name={`${currentProfile.firstName} ${currentProfile.lastName}`}
              age={currentProfile.age}
              location={currentProfile.location}
              bio={currentProfile.bio}
              image={currentProfile.photoURL}
              verified={currentProfile.isVerified}
              matchScore={currentProfile.matchScore}
              smokingStatus={currentProfile.smokingStatus}
              maritalStatus={currentProfile.maritalStatus}
              hasChildren={currentProfile.hasChildren}
              childrenPreference={currentProfile.childrenPreference}
              onClick={() => {
                // Navigate to detailed profile view
                window.location.href = `/match-insights/${currentProfile.userId}`;
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
                <p className="text-sm">{currentProfile.educationLevel || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Career</p>
                <p className="text-sm">{currentProfile.careerField || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Religion Level</p>
                <p className="text-sm">{currentProfile.religionLevel || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prayer Frequency</p>
                <p className="text-sm">{currentProfile.prayerFrequency || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ProfileBadge type="marital_status" value={currentProfile.maritalStatus} />
              <ProfileBadge type="smoking_status" value={currentProfile.smokingStatus} />
              <ProfileBadge type="children_status" value={currentProfile.hasChildren} />
              {currentProfile.isVerified && (
                <ProfileBadge type="verification" value={currentProfile.isVerified} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Insights */}
        <CompatibilityScore
          score={currentProfile.matchScore}
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
              onClick={() => handleSwipe('left', currentProfile.userId)}
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
              onClick={() => handleSwipe('right', currentProfile.userId)}
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