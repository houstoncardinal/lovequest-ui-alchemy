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
import profile3 from "@/assets/profile-3.jpg";

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

// Demo profiles for MVP showcase
const DEMO_PROFILES: MatchProfile[] = [
  {
    user_id: "demo-1",
    first_name: "Sarah",
    last_name: "Johnson",
    display_name: "Sarah Johnson",
    age: 26,
    gender: "female",
    location: "New York, NY",
    bio: "Passionate about Islamic studies and looking for someone who shares deep spiritual values. Love reading and discussing theology while sipping coffee.",
    avatar_url: profile1,
    religion_level: "Very Strict",
    prayer_frequency: "5 times daily",
    hijab_status: "Always wear hijab",
    education_level: "Bachelor's Degree",
    career_field: "Education",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Islamic Studies", "Books", "Coffee", "Spirituality", "Education"],
    match_score: 85
  },
  {
    user_id: "demo-2",
    first_name: "Aisha",
    last_name: "Rahman",
    display_name: "Aisha Rahman",
    age: 24,
    gender: "female",
    location: "Chicago, IL",
    bio: "Future doctor, currently studying medicine. Passionate about helping others and finding someone who shares ambitions for positive impact in the community.",
    avatar_url: profile2,
    religion_level: "Strict",
    prayer_frequency: "5 times daily",
    hijab_status: "Always wear hijab",
    education_level: "Medical School",
    career_field: "Healthcare",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Medicine", "Community Service", "Quran", "Fitness", "Science"],
    match_score: 92
  },
  {
    user_id: "demo-3",
    first_name: "Fatima",
    last_name: "Al-Sayed",
    display_name: "Fatima Al-Sayed",
    age: 28,
    gender: "female",
    location: "Los Angeles, CA",
    bio: "Artist and entrepreneur creating halal beauty products. Seeking a partner who appreciates creativity, faith, and building something meaningful together.",
    avatar_url: profile3,
    religion_level: "Moderate",
    prayer_frequency: "5 times daily",
    hijab_status: "Always wear hijab",
    education_level: "Bachelor's Degree",
    career_field: "Business/Entrepreneurship",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: false,
    interests: ["Entrepreneurship", "Halal Beauty", "Art", "Photography", "Business"],
    match_score: 78
  },
  {
    user_id: "demo-4",
    first_name: "Maryam",
    last_name: "Khan",
    display_name: "Maryam Khan",
    age: 25,
    gender: "female",
    location: "Houston, TX",
    bio: "Software engineer who loves coding and Islamic calligraphy. Looking for someone intelligent, faith-minded, and ready for deep conversations.",
    avatar_url: profile2,
    religion_level: "Very Strict",
    prayer_frequency: "5 times daily",
    hijab_status: "Always wear hijab",
    education_level: "Master's Degree",
    career_field: "Technology",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Programming", "Islamic Calligraphy", "AI/ML", "Technology", "Coding"],
    match_score: 88
  },
  {
    user_id: "demo-5",
    first_name: "Zahra",
    last_name: "Ahmed",
    display_name: "Zahra Ahmed",
    age: 23,
    gender: "female",
    location: "Seattle, WA",
    bio: "Environmental science major with a passion for sustainability and Islamic environmental stewardship. Together we can make the world better!",
    avatar_url: profile1,
    religion_level: "Strict",
    prayer_frequency: "5 times daily",
    hijab_status: "Always wear hijab",
    education_level: "Bachelor's Degree",
    career_field: "Environmental Science",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: false,
    interests: ["Environment", "Sustainability", "Nature", "Science", "Gardening"],
    match_score: 76
  },
  {
    user_id: "demo-6",
    first_name: "Layla",
    last_name: "Mohammed",
    display_name: "Layla Mohammed",
    age: 27,
    gender: "female",
    location: "Atlanta, GA",
    bio: "Teacher inspiring young minds while pursuing Islamic knowledge. Seeks kind-hearted partner willing to grow together in faith and life.",
    avatar_url: profile3,
    religion_level: "Strict",
    prayer_frequency: "5 times daily",
    hijab_status: "Always wear hijab",
    education_level: "Master's Degree",
    career_field: "Education",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Teaching", "Islamic Studies", "Education", "Children", "Community"],
    match_score: 90
  }
];

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
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [favoritedProfiles, setFavoritedProfiles] = useState<Set<string>>(new Set());
  
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

    // Use demo profiles for development users or when no real data is available
    if (user.id === 'dev-user-id' || error || !data || data.length === 0) {
      setProfiles(DEMO_PROFILES);
      setCurrentProfileIndex(0);
      setNoMoreProfiles(false);
      if (error) {
        console.log('Using demo profiles due to error or demo user');
      } else if (!data || data.length === 0) {
        console.log('Using demo profiles as fallback for empty data');
      }
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    const profileId = currentProfile.user_id;
    const newFavoritedProfiles = new Set(favoritedProfiles);

    if (favoritedProfiles.has(profileId)) {
      newFavoritedProfiles.delete(profileId);
      toast({
        title: "Removed from favorites",
        description: `${getDisplayName(currentProfile)} removed from your favorites`,
      });
    } else {
      newFavoritedProfiles.add(profileId);
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to favorite profiles and view who favorited you!",
      });
    }

    setFavoritedProfiles(newFavoritedProfiles);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
          <div className="flex items-center">
            {/* Custom Logo with Green Outline Heart */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-xl"
                >
                  <circle cx="16" cy="16" r="16" fill="url(#logoGradient)" />
                  <circle cx="16" cy="16" r="15" fill="none" stroke="#10b981" strokeWidth="1" />
                  <path
                    d="M16 23.5c-5-4.5-8-7.5-8-11 0-2.5 2-4.5 4.5-4.5 1.5 0 2.8 0.8 3.5 2 0.7-1.2 2-2 3.5-2 2.5 0 4.5 2 4.5 4.5 0 3.5-3 6.5-8 11z"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#10b981" stopOpacity="0.1" />
                      <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-none text-gray-900">
                  LoveQuest
                </span>
                <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
                  Premium
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              onClick={handleFilters}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            </button>

            {/* Navigation Menu Button */}
            <button
              onClick={() => setShowNavigationModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Navigate Screens"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
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
          <div className="flex items-center">
            {/* Custom Logo with Green Outline Heart */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-xl"
                >
                  <circle cx="16" cy="16" r="16" fill="url(#logoGradient)" />
                  <circle cx="16" cy="16" r="15" fill="none" stroke="#10b981" strokeWidth="1" />
                  <path
                    d="M16 23.5c-5-4.5-8-7.5-8-11 0-2.5 2-4.5 4.5-4.5 1.5 0 2.8 0.8 3.5 2 0.7-1.2 2-2 3.5-2 2.5 0 4.5 2 4.5 4.5 0 3.5-3 6.5-8 11z"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#10b981" stopOpacity="0.1" />
                      <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-none text-gray-900">
                  LoveQuest
                </span>
                <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
                  Premium
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              onClick={handleFilters}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            </button>

            {/* Navigation Menu Button */}
            <button
              onClick={() => setShowNavigationModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Navigate Screens"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
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
          <div className="flex items-center">
            {/* Custom Logo with Green Outline Heart */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-xl"
                >
                  <circle cx="16" cy="16" r="16" fill="url(#logoGradient)" />
                  <circle cx="16" cy="16" r="15" fill="none" stroke="#10b981" strokeWidth="1" />
                  <path
                    d="M16 23.5c-5-4.5-8-7.5-8-11 0-2.5 2-4.5 4.5-4.5 1.5 0 2.8 0.8 3.5 2 0.7-1.2 2-2 3.5-2 2.5 0 4.5 2 4.5 4.5 0 3.5-3 6.5-8 11z"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#10b981" stopOpacity="0.1" />
                      <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-none text-gray-900">
                  LoveQuest
                </span>
                <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
                  Premium
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              onClick={handleFilters}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            </button>

            {/* Navigation Menu Button */}
            <button
              onClick={() => setShowNavigationModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Navigate Screens"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-40 md:pt-16">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="flex items-center">
          {/* Custom Logo with Green Outline Heart */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="rounded-xl"
              >
                <circle cx="16" cy="16" r="16" fill="url(#logoGradient)" />
                <circle cx="16" cy="16" r="15" fill="none" stroke="#10b981" strokeWidth="1" />
                <path
                  d="M16 23.5c-5-4.5-8-7.5-8-11 0-2.5 2-4.5 4.5-4.5 1.5 0 2.8 0.8 3.5 2 0.7-1.2 2-2 3.5-2 2.5 0 4.5 2 4.5 4.5 0 3.5-3 6.5-8 11z"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight leading-none text-gray-900">
                LoveQuest
              </span>
              <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
                Premium
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button
            onClick={handleFilters}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          </button>

          {/* Navigation Menu Button */}
          <button
            onClick={() => setShowNavigationModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Navigate Screens"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Card - Full Screen Experience */}
      <div className="flex-1 p-4 pb-32">
        <div className="relative w-full max-w-lg mx-auto">
          {/* Profile Card */}
          <div
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100/60 group cursor-pointer hover:shadow-2xl transition-all duration-500 relative"
            onClick={() => navigate(`/profile/${currentProfile.user_id}`)}
          >
            <div className="relative" style={{ height: '75vh', maxHeight: '600px' }}>
              <img
                src={currentProfile.avatar_url || (currentProfile.gender === 'female' ? profile2 : profile1)}
                alt={getDisplayName(currentProfile)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Background Overlays for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"></div>

              {/* Verification Badge */}
              {currentProfile.is_verified && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 text-sm font-semibold shadow-xl border border-white/20 backdrop-blur-sm">
                    <Crown className="w-4 h-4 mr-1.5" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Match Score Badge */}
              {currentProfile.match_score >= 80 && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className={`bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 text-sm font-semibold shadow-xl border border-white/20 backdrop-blur-sm`}>
                    ⭐ {currentProfile.match_score}% Match
                  </Badge>
                </div>
              )}

              {/* Enhanced Info Card Overlay */}
              <div className="absolute left-0 right-0 bottom-0 px-4 lg:px-6 pb-4 lg:pb-6">
                <div className="bg-white/95 lg:bg-white/90 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl p-5 lg:p-6 border border-emerald-100/60 lg:border-white/40 relative overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                  {/* Animated gradient line */}
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 group-hover:w-full transition-all duration-700 ease-out"></div>

                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                          {getDisplayName(currentProfile)}, <span className="text-lg lg:text-xl text-emerald-600">{currentProfile.age}</span>
                        </h2>
                        {currentProfile.match_score >= 70 && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold px-2 py-0.5 text-xs shadow-lg">
                            Great Match
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-600 gap-4 lg:gap-6 mb-3 lg:mb-4">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{currentProfile.location}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{getCommonInterests(currentProfile.interests)} interests</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed line-clamp-3 lg:line-clamp-2 mb-1">{currentProfile.bio}</p>

                  {/* Enhanced Click hint */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs lg:text-sm text-emerald-600 font-semibold bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-emerald-100/50">
                      Click to see more →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-center gap-4 lg:gap-6 mt-6 lg:mt-8 mb-2 lg:mb-4">
            <button
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 lg:w-18 lg:h-18 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:shadow-2xl transition-all duration-300 active:scale-95 group"
              title="Pass"
            >
              <X className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
            </button>

            <button
              onClick={handleLike}
              className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-500 active:scale-95 group hover:from-emerald-600 hover:to-emerald-700 ${isLiking ? 'scale-110 animate-pulse' : 'hover:scale-105'}`}
              title="Like"
            >
              <Heart className="w-10 h-10 lg:w-12 lg:h-12 text-white fill-current drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              onClick={handleFavorite}
              className={`w-16 h-16 lg:w-18 lg:h-18 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-200 hover:shadow-2xl transition-all duration-300 active:scale-95 group ${
                favoritedProfiles.has(currentProfile.user_id) ? 'bg-amber-50 border-amber-200 shadow-amber-100/50' : ''
              }`}
              title="Favorite Profile"
            >
              <Star className={`w-8 h-8 ${favoritedProfiles.has(currentProfile.user_id) ? 'text-amber-500 fill-current' : 'text-gray-400'} group-hover:text-amber-500 group-hover:fill-current transition-all duration-300`} />
            </button>
          </div>

          {/* Responsive Hint Text */}
          <div className="text-center mt-4 lg:mt-6">
            <p className="text-sm text-gray-500 lg:text-base">
              <span className="hidden sm:inline">Click on profile to view details • </span>
              Tap buttons to like or pass • Swipe for faster browsing
            </p>
          </div>
        </div>
      </div>

      <InteractiveMenu />

      {/* Full-Width Modern Navigation Menu */}
      {showNavigationModal && (
        <div className="fixed inset-0 z-[200] animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNavigationModal(false)}
          />

          {/* Full Content */}
          <div className="relative min-h-full flex flex-col bg-white">
            {/* Header - LoveQuest Branding */}
            <div className="w-full bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between p-6 max-w-6xl mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rounded-xl shadow-sm"
                    >
                      <circle cx="16" cy="16" r="16" fill="url(#navLogoGradient)" />
                      <circle cx="16" cy="16" r="15" fill="none" stroke="#10b981" strokeWidth="1" />
                      <path
                        d="M16 23.5c-5-4.5-8-7.5-8-11 0-2.5 2-4.5 4.5-4.5 1.5 0 2.8 0.8 3.5 2 0.7-1.2 2-2 3.5-2 2.5 0 4.5 2 4.5 4.5 0 3.5-3 6.5-8 11z"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      <defs>
                        <linearGradient id="navLogoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#10b981" stopOpacity="0.1" />
                          <stop offset="1" stopColor="#34d399" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-gray-900 leading-none">
                      LoveQuest
                    </div>
                    <div className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
                      Premium Dating
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowNavigationModal(false)}
                  className="w-12 h-12 rounded-full bg-white shadow-lg border border-emerald-200 flex items-center justify-center hover:bg-emerald-50 hover:scale-105 transition-all duration-200"
                  aria-label="Close navigation"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-gray-50">
              <div className="max-w-6xl mx-auto p-6">
                {/* Premium Welcome Section */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-2xl mb-6">
                    <Heart className="w-10 h-10 text-white fill-current" />
                  </div>
                  <h2 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                    Discover Love
                  </h2>
                  <p className="text-gray-600 text-xl font-medium max-w-md mx-auto leading-relaxed">
                    Navigate through your premium dating journey
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center mb-8">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Discover (Home) - Current Screen */}
                <button
                  onClick={() => { setShowNavigationModal(false); navigate('/'); }}
                  className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-emerald-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Heart className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Discover</h3>
                    <p className="text-emerald-50 text-sm drop-shadow-sm">Find your perfect match</p>
                  </div>
                  <div className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full shadow-lg" title="Current Page" />
                </button>

                {/* Matches */}
                <button
                  onClick={() => { setShowNavigationModal(false); navigate('/matches'); }}
                  className="group relative bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-emerald-300/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-emerald-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Users className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Matches</h3>
                    <p className="text-emerald-50 text-sm drop-shadow-sm">Your connections</p>
                  </div>
                </button>

                {/* Messages */}
                <button
                  onClick={() => { setShowNavigationModal(false); navigate('/messages'); }}
                  className="group relative bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-teal-300/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-teal-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <span className="text-2xl drop-shadow-lg">💬</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Messages</h3>
                    <p className="text-teal-50 text-sm drop-shadow-sm">Chat with matches</p>
                  </div>
                </button>

                {/* Community */}
                <button
                  onClick={() => { setShowNavigationModal(false); navigate('/community'); }}
                  className="group relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-emerald-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <span className="text-2xl drop-shadow-lg">🌟</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Community</h3>
                    <p className="text-emerald-50 text-sm drop-shadow-sm">Connect & share</p>
                  </div>
                </button>

                {/* Profile */}
                <button
                  onClick={() => { setShowNavigationModal(false); navigate('/account'); }}
                  className="group relative bg-gradient-to-br from-slate-500 to-slate-600 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-slate-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-slate-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <span className="text-2xl drop-shadow-lg">👤</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Profile</h3>
                    <p className="text-slate-50 text-sm drop-shadow-sm">Manage your account</p>
                  </div>
                </button>

                {/* Premium */}
                <button
                  onClick={() => { setShowNavigationModal(false); navigate('/pricing'); }}
                  className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-emerald-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/20 via-white/10 to-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <span className="text-2xl drop-shadow-lg">✨</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Premium</h3>
                    <p className="text-teal-50 text-sm drop-shadow-sm">Unlock features</p>
                  </div>
                </button>
                </div>

                {/* Enhanced Call-to-Action */}
                <div className="mt-12 text-center space-y-4">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-600">Swipe • Like • Match • Date</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <button
                    onClick={() => setShowNavigationModal(false)}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                    Start Your Journey
                    <span className="text-xl">💫</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-4 max-w-sm mx-auto">
                    Join thousands of couples who found love on LoveQuest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LikeLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        resetTime={likesUsage.resetTime}
      />
    </div>
  );
};

export default Home;
