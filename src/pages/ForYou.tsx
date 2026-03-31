import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Zap, Users, Brain, Music } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

const ForYou = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("Personality");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').neq('user_id', user.id).limit(10);
      if (error) throw error;
      const mockProfiles = [
        { id: "p1", display_name: "Emma Watson", age: 24, location: "1.5 km away", avatar_url: profile1, bio: "Perfect personality alignment" },
        { id: "p2", display_name: "Sophia Chen", age: 22, location: "2.3 km away", avatar_url: profile2, bio: "Similar communication style" },
        { id: "p3", display_name: "Maya Rodriguez", age: 26, location: "3.1 km away", avatar_url: profile3, bio: "8 shared interests" }
      ];
      setProfiles(data?.length ? data : mockProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally { setLoading(false); }
  };

  const categories = [
    { name: "Personality", icon: Brain, color: "bg-violet-500" },
    { name: "Interest", icon: Music, color: "bg-blue-500" },
    { name: "Horoscope", icon: Star, color: "bg-yellow-500" },
    { name: "Location", icon: Users, color: "bg-green-500" },
    { name: "Chemistry", icon: Zap, color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <h1 className="text-xl font-bold text-foreground">For You</h1>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 pb-4">
          <div className="flex space-x-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category.name
                    ? "bg-primary text-primary-foreground shadow-elegant" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name} Match
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match Score Header */}
      <div className="p-4">
        <div className="bg-gradient-glow rounded-2xl p-4 mb-4">
          <h2 className="text-lg font-bold text-foreground mb-1">{activeCategory} Matches</h2>
          <p className="text-muted-foreground text-sm">Based on our advanced compatibility algorithm</p>
        </div>

        {/* Profiles */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Finding your matches...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No matches yet</h3>
              <p className="text-muted-foreground">Complete your profile to find better matches!</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id}
                className="bg-card rounded-2xl overflow-hidden shadow-card border border-border cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover"
                onClick={() => navigate(`/profile/${profile.id}`)}>
                <div className="flex items-center p-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mr-4 flex-shrink-0">
                    <img src={profile.avatar_url || profile1} alt={`${profile.display_name || 'User'}'s profile`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{profile.display_name || 'Anonymous'}, {profile.age || '25'}</h3>
                      <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-primary mr-1" />
                        <span className="text-xs font-semibold text-primary">{Math.floor(Math.random() * 20) + 80}%</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{profile.location || '2.1 km away'}</p>
                    <p className="text-primary text-sm font-medium">{profile.bio || 'Great personality match'}</p>
                  </div>
                  <button className="ml-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-elegant">
                    <Heart className="w-5 h-5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default ForYou;
