import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, Star, RotateCcw, SlidersHorizontal, MapPin, Users, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db, collection, query, where, getDocs, limit as firestoreLimit, orderBy } from "@/integrations/firebase";
import { createLike, hasUserLiked } from "@/lib/firestore/matches";
import { searchUsers, type UserProfile } from "@/lib/firestore/users";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeMatches } from "@/hooks/useRealTimeMatches";
import { useLikesLimit } from "@/hooks/useLikesLimit";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import LikeLimitModal from "@/components/LikeLimitModal";
import LikesCounter from "@/components/LikesCounter";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";

interface MatchProfile {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  age?: number;
  gender?: string;
  location?: string;
  bio: string;
  photoURL: string | null;
  religionLevel?: string;
  prayerFrequency?: string;
  hijabStatus?: string;
  educationLevel?: string;
  careerField?: string;
  maritalStatus?: string;
  smokingStatus?: string;
  hasChildren?: boolean;
  childrenPreference?: string;
  isVerified: boolean;
  interests?: string[];
  matchScore?: number;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Enable real-time match notifications and likes limit tracking
  useRealTimeMatches();
  const { likesUsage, recordLike } = useLikesLimit();

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get current user's profile to check preferences
      const currentUserDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', user.uid), firestoreLimit(1))
      );

      if (currentUserDoc.empty) {
        console.error('Current user profile not found');
        setLoading(false);
        return;
      }

      const currentUser = currentUserDoc.docs[0].data();

      // Simple query - fetch users of preferred gender who can access app
      // In production, this would be a Cloud Function with complex matching algorithm
      const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';

      const usersQuery = query(
        collection(db, 'users'),
        where('canAccessApp', '==', true),
        where('gender', '==', oppositeGender),
        orderBy('lastActive', 'desc'),
        firestoreLimit(10)
      );

      const querySnapshot = await getDocs(usersQuery);
      const potentialMatches: MatchProfile[] = [];

      // Filter out users we've already liked
      for (const doc of querySnapshot.docs) {
        const userData = doc.data();

        // Skip self
        if (userData.uid === user.uid) continue;

        // Check if already liked
        const alreadyLiked = await hasUserLiked(user.uid, userData.uid);
        if (alreadyLiked) continue;

        potentialMatches.push({
          uid: userData.uid,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          displayName: userData.displayName || '',
          age: userData.age,
          gender: userData.gender,
          location: userData.location || 'Unknown',
          bio: userData.bio || '',
          photoURL: userData.photoURL,
          religionLevel: userData.religionLevel,
          prayerFrequency: userData.prayerFrequency,
          hijabStatus: userData.hijabStatus,
          educationLevel: userData.educationLevel,
          careerField: userData.careerField,
          maritalStatus: userData.maritalStatus,
          smokingStatus: userData.smokingStatus,
          hasChildren: userData.hasChildren,
          childrenPreference: userData.childrenPreference,
          isVerified: userData.isVerified || false,
          interests: [],
          matchScore: 75, // Default score - would come from Cloud Function
        });
      }

      if (potentialMatches.length === 0) {
        setNoMoreProfiles(true);
        setProfiles([]);
      } else {
        setProfiles(potentialMatches);
        setCurrentProfileIndex(0);
        setNoMoreProfiles(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !currentProfile) return;

    if (direction === 'right') {
      // Check if user can like
      if (!likesUsage.canLike && !likesUsage.isUnlimited) {
        setShowLimitModal(true);
        return;
      }

      // Record the like
      try {
        await createLike(user.uid, currentProfile.uid);

        // Update local likes count
        recordLike();

        // Trigger heart animation
        setIsLiking(true);
        setTimeout(() => setIsLiking(false), 1000);

        toast({
          title: "Like sent!",
          description: `You liked ${currentProfile.displayName}`,
        });
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to send like. Please try again.",
          variant: "destructive"
        });
      }
    }

    // Move to next profile or fetch more
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // Reached end, fetch more profiles
      await fetchProfiles();
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSwipe('right');
  };

  const handleRewind = () => {
    // Rewind to previous profile
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1);
    }
  };

  const handleFilters = () => {
    // Open filters modal or navigate to filters page
    navigate("/preferences");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
          <Logo size="md" />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding your perfect matches...</p>
          </div>
        </div>
        <InteractiveMenu />
      </div>
    );
  }

  if (noMoreProfiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
          <Logo size="md" />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <Heart className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No More Profiles</h2>
            <p className="text-gray-600 mb-6">You've seen all available matches in your area. Check back later for new profiles!</p>
            <button 
              onClick={fetchProfiles}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
            >
              Refresh
            </button>
          </div>
        </div>
        <InteractiveMenu />
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
          <Logo size="md" />
        </div>
        <InteractiveMenu />
      </div>
    );
  }

  const getCommonInterests = (interests: string[] | undefined) => {
    return interests ? interests.length : 0;
  };

  const getDisplayName = (profile: MatchProfile) => {
    return profile.displayName || `${profile.firstName} ${profile.lastName}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <LikesCounter />
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRewind}
            className="p-3 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-all duration-200 active:scale-95 shadow-sm"
            title="Rewind"
          >
            <RotateCcw className="w-5 h-5 text-emerald-600" />
          </button>
          <button 
            onClick={handleFilters}
            className="p-3 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-all duration-200 active:scale-95 shadow-sm"
            title="Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="p-4">
        <div className="relative max-w-sm mx-auto">
          {/* Profile Card */}
          <div
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 group cursor-pointer"
            onClick={() => navigate(`/profile/${currentProfile.uid}`)}
          >
            <div className="relative" style={{ height: '460px' }}>
              <img
                src={currentProfile.photoURL || (currentProfile.gender === 'female' ? profile2 : profile1)}
                alt={getDisplayName(currentProfile)}
                className="w-full h-full object-cover"
              />

              {/* Verification Badge */}
              {currentProfile.isVerified && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 text-xs font-medium shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Match Score Badge */}
              {currentProfile.matchScore && currentProfile.matchScore >= 80 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 text-xs font-medium shadow-lg">
                    {currentProfile.matchScore}% Match
                  </Badge>
                </div>
              )}
              
              {/* Compact Info Card Overlay */}
              <div className="absolute left-0 right-0 bottom-0 px-4 pb-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-emerald-100 relative overflow-hidden group-hover:shadow-xl transition-all duration-300">
                  {/* Hover Animation Line */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 group-hover:w-full transition-all duration-500 ease-out group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-900">{getDisplayName(currentProfile)}, {currentProfile.age}</h2>
                        {currentProfile.matchScore && currentProfile.matchScore >= 70 && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium">
                            Great Match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-600 gap-3 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          {currentProfile.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-500" />
                          {getCommonInterests(currentProfile.interests)} interests
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{currentProfile.bio}</p>
                  
                  {/* Click hint */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-emerald-600 font-medium">Click to view profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-6 mt-6 mb-2">
            <button 
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              <X className="w-7 h-7 text-gray-400" />
            </button>
            <button 
              onClick={handleLike}
              className={`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 active:scale-95 ${isLiking ? 'scale-110' : ''}`}
            >
              <Heart className="w-8 h-8 text-white fill-current" />
            </button>
            <button
              onClick={() => navigate(`/profile/${currentProfile.uid}`)}
              className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              <Star className="w-7 h-7 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <InteractiveMenu />
      
      <LikeLimitModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        resetTime={likesUsage.resetTime}
      />
    </div>
  );
};

export default Home;