import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, Star, RotateCcw, SlidersHorizontal, MapPin, Users, Crown, Flame, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeMatches } from "@/hooks/useRealTimeMatches";
import { useLikesLimit } from "@/hooks/useLikesLimit";
import { Badge } from "@/components/ui/badge";
import LikeLimitModal from "@/components/LikeLimitModal";
import LikesCounter from "@/components/LikesCounter";
import Logo from "@/components/Logo";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
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

const DEMO_PROFILES: MatchProfile[] = [
  {
    user_id: "demo-1",
    first_name: "Sarah",
    last_name: "Johnson",
    display_name: "Sarah Johnson",
    age: 26,
    gender: "female",
    location: "New York, NY",
    bio: "Coffee addict, book lover, and sunset chaser. Looking for someone to explore the city with and have deep late-night conversations. 📚☕",
    avatar_url: profile1,
    education_level: "Bachelor's Degree",
    career_field: "Marketing",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Travel", "Photography", "Coffee", "Reading", "Yoga"],
    match_score: 95
  },
  {
    user_id: "demo-2",
    first_name: "Emily",
    last_name: "Chen",
    display_name: "Emily Chen",
    age: 24,
    gender: "female",
    location: "Los Angeles, CA",
    bio: "Future doctor by day, foodie by night. Looking for someone ambitious who also knows how to have fun. Let's try that new sushi spot! 🍣",
    avatar_url: profile2,
    education_level: "Medical School",
    career_field: "Healthcare",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Cooking", "Hiking", "Science", "Fitness", "Travel"],
    match_score: 92
  },
  {
    user_id: "demo-3",
    first_name: "Jessica",
    last_name: "Martinez",
    display_name: "Jessica Martinez",
    age: 28,
    gender: "female",
    location: "Miami, FL",
    bio: "Entrepreneur building a skincare brand 🌿 Love beach sunsets, salsa dancing, and trying every brunch spot in town. Your adventure buddy awaits!",
    avatar_url: profile3,
    education_level: "Bachelor's Degree",
    career_field: "Entrepreneurship",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: false,
    interests: ["Business", "Skincare", "Dancing", "Photography", "Travel"],
    match_score: 88
  },
  {
    user_id: "demo-4",
    first_name: "Taylor",
    last_name: "Williams",
    display_name: "Taylor Williams",
    age: 25,
    gender: "female",
    location: "Austin, TX",
    bio: "Software engineer who loves coding by day and live music by night. Looking for someone smart, kind, and ready for spontaneous road trips 🎸",
    avatar_url: profile2,
    education_level: "Master's Degree",
    career_field: "Technology",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Music", "Coding", "Concerts", "Technology", "Hiking"],
    match_score: 90
  },
  {
    user_id: "demo-5",
    first_name: "Olivia",
    last_name: "Brooks",
    display_name: "Olivia Brooks",
    age: 23,
    gender: "female",
    location: "Seattle, WA",
    bio: "Environmental science grad passionate about sustainability 🌍 Also love rock climbing, farmers markets, and making the world a little better every day.",
    avatar_url: profile1,
    education_level: "Bachelor's Degree",
    career_field: "Environmental Science",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: false,
    interests: ["Environment", "Climbing", "Nature", "Cooking", "Gardening"],
    match_score: 85
  },
  {
    user_id: "demo-6",
    first_name: "Madison",
    last_name: "Rivera",
    display_name: "Madison Rivera",
    age: 27,
    gender: "female",
    location: "Chicago, IL",
    bio: "High school teacher with a heart of gold 💛 Weekends are for exploring museums, trying new restaurants, and cuddling my golden retriever.",
    avatar_url: profile3,
    education_level: "Master's Degree",
    career_field: "Education",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Teaching", "Art", "Dogs", "Food", "Museums"],
    match_score: 93
  }
];

// Icebreaker prompts
const ICEBREAKERS = [
  "What's the best trip you've ever taken? ✈️",
  "What's your go-to comfort food? 🍕",
  "Dog person or cat person? 🐕",
  "What's the last show you binged? 📺",
  "Early bird or night owl? 🦉",
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
  const [favoritedProfiles, setFavoritedProfiles] = useState<Set<string>>(new Set());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [currentIcebreaker, setCurrentIcebreaker] = useState(0);

  useRealTimeMatches();
  const { likesUsage, recordLike } = useLikesLimit();

  // Rotate icebreakers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcebreaker(prev => (prev + 1) % ICEBREAKERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_enhanced_match_recommendations_with_gender', {
        target_user_id: user.id,
        limit_count: 10
      });
      if (user.id === 'dev-user-id' || error || !data || data.length === 0) {
        setProfiles(DEMO_PROFILES);
        setCurrentProfileIndex(0);
        setNoMoreProfiles(false);
      } else {
        setProfiles(data);
        setCurrentProfileIndex(0);
        setNoMoreProfiles(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setProfiles(DEMO_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !currentProfile) return;

    setSwipeDirection(direction);

    if (direction === 'right') {
      if (!likesUsage.canLike && !likesUsage.isUnlimited) {
        setShowLimitModal(true);
        setSwipeDirection(null);
        return;
      }
      try {
        const { error } = await supabase.from('user_likes').insert({
          liker_id: user.id,
          liked_id: currentProfile.user_id
        });
        if (!error) {
          recordLike();
          setIsLiking(true);
          setTimeout(() => setIsLiking(false), 600);
          toast({ title: "💖 Like sent!", description: `You liked ${currentProfile.display_name}` });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // Wait for animation then move to next
    setTimeout(() => {
      setSwipeDirection(null);
      if (currentProfileIndex < profiles.length - 1) {
        setCurrentProfileIndex(prev => prev + 1);
      } else {
        fetchProfiles();
      }
    }, 350);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    }
  };

  const handleRewind = () => {
    if (currentProfileIndex > 0) setCurrentProfileIndex(prev => prev - 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProfile) return;
    toast({
      title: "⭐ Super Like!",
      description: `${currentProfile.display_name} will see you liked them first!`,
    });
  };

  const getDisplayName = (profile: MatchProfile) => {
    return profile.display_name || `${profile.first_name} ${profile.last_name}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Heart className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Finding amazing people near you...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile || noMoreProfiles) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground mb-6">Check back soon for new profiles in your area.</p>
          <button onClick={fetchProfiles} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-elegant hover:opacity-90 transition-all">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto md:max-w-2xl">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <LikesCounter likesUsage={likesUsage} />
            <button onClick={() => navigate("/preferences")} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Icebreaker Bar */}
      <div className="px-4 py-2 max-w-lg mx-auto md:max-w-2xl">
        <div className="bg-gradient-glow rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground font-medium truncate">{ICEBREAKERS[currentIcebreaker]}</p>
        </div>
      </div>

      {/* Main Swipe Card */}
      <div className="px-4 pt-2 pb-4 max-w-lg mx-auto md:max-w-2xl">
        <div className="relative w-full" style={{ aspectRatio: '3/4.2', maxHeight: 'calc(100vh - 280px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProfile.user_id}
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-card cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              animate={
                swipeDirection === 'right'
                  ? { x: 400, rotate: 15, opacity: 0 }
                  : swipeDirection === 'left'
                  ? { x: -400, rotate: -15, opacity: 0 }
                  : { x: 0, rotate: 0, opacity: 1 }
              }
              initial={{ scale: 0.95, opacity: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/profile/${currentProfile.user_id}`)}
            >
              {/* Profile Image */}
              <img
                src={currentProfile.avatar_url || profile1}
                alt={getDisplayName(currentProfile)}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Like/Nope indicators */}
              <AnimatePresence>
                {isLiking && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm z-20"
                  >
                    <Heart className="w-24 h-24 text-primary fill-current animate-heart-burst" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                {currentProfile.match_score >= 80 && (
                  <Badge className="bg-primary text-primary-foreground px-3 py-1.5 text-sm font-bold shadow-lg backdrop-blur-sm">
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    {currentProfile.match_score}% Match
                  </Badge>
                )}
                {currentProfile.is_verified && (
                  <Badge className="bg-blue-500 text-white px-3 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-sm ml-auto">
                    ✓ Verified
                  </Badge>
                )}
              </div>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-20">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">
                      {getDisplayName(currentProfile)}, {currentProfile.age}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {currentProfile.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {currentProfile.interests?.length || 0} interests
                    </span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{currentProfile.bio}</p>

                  {/* Interest pills */}
                  {currentProfile.interests && currentProfile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentProfile.interests.slice(0, 4).map((interest, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                          {interest}
                        </span>
                      ))}
                      {currentProfile.interests.length > 4 && (
                        <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                          +{currentProfile.interests.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-5 mt-5">
          <button
            onClick={handleRewind}
            className="w-12 h-12 rounded-full bg-card border border-border shadow-card flex items-center justify-center hover:shadow-card-hover transition-all active:scale-90"
          >
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-card border border-border shadow-card flex items-center justify-center hover:shadow-card-hover transition-all active:scale-90"
          >
            <X className="w-7 h-7 text-destructive" />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            className={`w-16 h-16 rounded-full bg-gradient-hero shadow-elegant flex items-center justify-center transition-all active:scale-90 ${isLiking ? 'scale-110' : 'hover:scale-105'}`}
          >
            <Heart className="w-8 h-8 text-white fill-current" />
          </button>

          <button
            onClick={handleFavorite}
            className="w-14 h-14 rounded-full bg-card border border-border shadow-card flex items-center justify-center hover:shadow-card-hover transition-all active:scale-90"
          >
            <Star className="w-7 h-7 text-yellow-500" />
          </button>

          <button
            onClick={() => toast({ title: "⚡ Boost!", description: "Your profile will be shown to more people for 30 minutes!" })}
            className="w-12 h-12 rounded-full bg-card border border-border shadow-card flex items-center justify-center hover:shadow-card-hover transition-all active:scale-90"
          >
            <Zap className="w-5 h-5 text-violet-500" />
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          Swipe right to like · Swipe left to pass · Tap for details
        </p>
      </div>

      <LikeLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} resetTime={likesUsage.resetTime} />
    </div>
  );
};

export default Home;
