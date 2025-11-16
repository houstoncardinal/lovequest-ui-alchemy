import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import ProfileCard from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { db, collection, query, where, getDocs, orderBy, limit as firestoreLimit, getDoc, doc } from "@/integrations/firebase";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";

interface ProfileData {
  id: string;
  name: string;
  age?: number;
  distance: string;
  image: string | null;
  createdAt?: string;
}

const LikeYou = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Recent");
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    if (user) {
      fetchLikes();
    }
  }, [user]);

  useEffect(() => {
    // Filter profiles based on active tab
    if (activeTab === "All") {
      setProfiles(allProfiles);
    } else if (activeTab === "Recent") {
      // Show profiles from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const filtered = allProfiles.filter(p => {
        if (!p.createdAt) return false;
        return new Date(p.createdAt) >= sevenDaysAgo;
      });
      setProfiles(filtered);
    } else if (activeTab === "Nearby") {
      // For now, show all. In production, this would filter by geolocation
      setProfiles(allProfiles);
    }
  }, [activeTab, allProfiles]);

  const fetchLikes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Query the likes collection where likedId is the current user
      const likesQuery = query(
        collection(db, 'likes'),
        where('likedId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const likesSnapshot = await getDocs(likesQuery);
      const profilesData: ProfileData[] = [];

      // Fetch user profile for each like
      for (const likeDoc of likesSnapshot.docs) {
        const likeData = likeDoc.data();
        const likerId = likeData.likerId;

        // Fetch the liker's profile from users collection
        const userDocRef = doc(db, 'users', likerId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          profilesData.push({
            id: userData.uid,
            name: userData.displayName || `${userData.firstName} ${userData.lastName}`,
            age: userData.age,
            distance: userData.location || "Unknown",
            image: (userData.photos && userData.photos[0]) || null,
            createdAt: likeData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          });
        }
      }

      setAllProfiles(profilesData);
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: "All", count: allProfiles.length },
    { name: "Recent", count: allProfiles.filter(p => {
      if (!p.createdAt) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(p.createdAt) >= sevenDaysAgo;
    }).length },
    { name: "Nearby", count: allProfiles.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 mr-3">Like You</h1>
            <Badge className="bg-primary text-white rounded-full px-3 py-1 text-sm font-medium">
              Premium
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                <SlidersHorizontal className="w-6 h-6 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/advanced-filters')}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/preferences')}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-4 space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.name
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.name} {tab.count}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profiles...</p>
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Likes Yet</h2>
              <p className="text-gray-600">When someone likes you, they'll appear here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                age={profile.age}
                distance={profile.distance}
                image={profile.image || (profile.age && profile.age < 25 ? profile1 : profile2)}
                onLike={(id) => console.log('Liked back:', id)}
                onClick={(id) => navigate(`/profile/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default LikeYou;