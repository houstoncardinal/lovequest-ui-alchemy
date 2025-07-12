import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, Star, RotateCcw, SlidersHorizontal, MapPin, Users, Crown } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  
  const profiles = [
    {
      id: "1",
      name: "Ayesha Siddiqui",
      age: 25,
      distance: "3 km away",
      commonInterests: 5,
      bio: "Entrepreneur, passionate about faith, family, and art. Looking for a meaningful halal connection.",
      image: profile2,
      isPotentialMatch: true,
      isPremium: true
    },
    {
      id: "2",
      name: "Omar Farooq", 
      age: 28,
      distance: "2 km away",
      commonInterests: 4,
      bio: "Finance professional, enjoys travel and community service. Seeking a partner for a blessed marriage journey.",
      image: profile1,
      isPotentialMatch: false,
      isPremium: false
    }
  ];

  const currentProfile = profiles[currentProfileIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Trigger heart animation
      setIsLiking(true);
      setTimeout(() => setIsLiking(false), 1000);
    }
    
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 1000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <Logo size="md" />
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
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 group cursor-pointer">
            <div className="relative" style={{ height: '460px' }}>
              <img 
                src={currentProfile.image} 
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
              
              {/* Premium Badge */}
              {currentProfile.isPremium && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 text-xs font-medium shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
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
                        <h2 className="text-lg font-bold text-gray-900">{currentProfile.name}, {currentProfile.age}</h2>
                        {currentProfile.isPotentialMatch && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium">
                            Match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-600 gap-3 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          {currentProfile.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-500" />
                          {currentProfile.commonInterests} interests
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{currentProfile.bio}</p>
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
              onClick={() => navigate(`/profile/${currentProfile.id}`)}
              className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              <Star className="w-7 h-7 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default Home;