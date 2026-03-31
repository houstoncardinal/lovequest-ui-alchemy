import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Heart, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProfileCard from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DEMO_PROFILES } from "@/data/demoData";
import profile1 from "@/assets/profile-1.jpg";

interface LikerProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  image: string;
  like_type: string;
  liked_at: string;
}

const LikeYou = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("All");
  const [profiles, setProfiles] = useState<LikerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLikers();
  }, [user]);

  const fetchLikers = async () => {
    if (!user) return;
    try {
      // Get all likes where current user is the liked_id
      const { data: likes, error } = await supabase
        .from('likes')
        .select('*')
        .eq('liked_id', user.id)
        .in('like_type', ['like', 'superlike'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!likes || likes.length === 0) {
        // Fallback to demo data for empty state
        const demoLikers = DEMO_PROFILES.slice(0, 6).map(p => ({
          id: p.user_id,
          name: p.display_name,
          age: p.age,
          distance: p.location,
          image: p.avatar_url,
          like_type: 'like',
          liked_at: new Date().toISOString(),
        }));
        setProfiles(demoLikers);
        setLoading(false);
        return;
      }

      // Fetch profiles of likers
      const likerIds = likes.map(l => l.liker_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', likerIds);

      const likerProfiles: LikerProfile[] = likes.map(like => {
        const profile = profilesData?.find(p => p.user_id === like.liker_id);
        return {
          id: like.liker_id,
          name: profile?.display_name || 'Someone',
          age: profile?.age || 25,
          distance: profile?.location || 'Nearby',
          image: profile?.photos?.[0] || profile1,
          like_type: like.like_type,
          liked_at: like.created_at,
        };
      });

      setProfiles(likerProfiles);
    } catch (error) {
      console.error('Error fetching likers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (profileId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('likes')
        .insert({ liker_id: user.id, liked_id: profileId, like_type: 'like' as const });
      if (!error) {
        toast({ title: "💖 Liked back!", description: "If it's mutual, you'll match!" });
      }
    } catch {}
  };

  const tabs = [
    { name: "All", count: profiles.length },
    { name: "Super Likes", count: profiles.filter(p => p.like_type === 'superlike').length },
  ];

  const filteredProfiles = activeTab === "Super Likes"
    ? profiles.filter(p => p.like_type === 'superlike')
    : profiles;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground mr-3">Like You</h1>
            <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium">
              {profiles.length}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/advanced-filters')}>
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Advanced Filters
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/preferences')}>
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-4 space-x-3">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.name
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.name} {tab.count}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No likes yet</h3>
            <p className="text-muted-foreground">When someone likes your profile, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                {...profile}
                onLike={(id) => handleLikeBack(id)}
                onClick={(id) => navigate(`/profile/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikeYou;
