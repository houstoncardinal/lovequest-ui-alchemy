import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, Star, RotateCcw, SlidersHorizontal, MapPin, Users, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  age: number;
  gender: string;
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
  interests: string[];
  match_score: number;
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
      const { data, error } = await supabase.rpc('get_enhanced_match_recommendations_with_gender', {
        target_user_id: user.id,
        limit_count: 10
      });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        setNoMoreProfiles(true);
        setProfiles([]);
      } else {
        setProfiles(data);
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
        const { error } = await supabase
          .from('user_likes')
          .insert({
            liker_id: user.id,
            liked_id: currentProfile.user_id
          });

        if (error) {
          console.error('Error recording like:', error);
        } else {
          // Update local likes count
          recordLike();
          
          // Trigger heart animation
          setIsLiking(true);
          setTimeout(() => setIsLiking(false), 1000);
          
          toast({
            title: "Like sent!",
            description: `You liked ${currentProfile.display_name}`,
          });
        }
      } catch (error) {
        console.error('Error:', error);
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

  const getCommonInterests = (interests: string[]) => {
    return interests ? interests.length : 0;
  };

  const getDisplayName = (profile: MatchProfile) => {
    return profile.display_name || `${profile.first_name} ${profile.last_name}`;
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
            onClick={() => navigate(`/profile/${currentProfile.user_id}`)}
          >
            <div className="relative" style={{ height: '460px' }}>
              <img 
                src={currentProfile.avatar_url || (currentProfile.gender === 'female' ? profile2 : profile1)} 
                alt={getDisplayName(currentProfile)}
                className="w-full h-full object-cover"
              />
              
              {/* Verification Badge */}
              {currentProfile.is_verified && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 text-xs font-medium shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
              
              {/* Match Score Badge */}
              {currentProfile.match_score >= 80 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 text-xs font-medium shadow-lg">
                    {currentProfile.match_score}% Match
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
                        {currentProfile.match_score >= 70 && (
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
              onClick={() => navigate(`/profile/${currentProfile.user_id}`)}
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