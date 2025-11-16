import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Zap, Users, Brain, Music } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import ProfileCard from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { db, collection, query, where, getDocs, limit as firestoreLimit, orderBy } from "@/integrations/firebase";
import { searchUsers } from "@/lib/firestore/users";
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
      // Get user profiles from Firestore (excluding current user)
      const usersQuery = query(
        collection(db, 'users'),
        where('canAccessApp', '==', true),
        orderBy('lastActive', 'desc'),
        firestoreLimit(10)
      );

      const querySnapshot = await getDocs(usersQuery);
      const userProfiles = querySnapshot.docs
        .map(doc => doc.data())
        .filter(profile => profile.uid !== user.uid) // Exclude current user
        .map(profile => ({
          id: profile.uid,
          displayName: profile.displayName || `${profile.firstName} ${profile.lastName}`,
          age: profile.age,
          location: profile.location || '2.1 km away',
          avatarUrl: profile.photoURL,
          bio: profile.bio || 'Great personality match'
        }));

      // Add mock data for demo purposes if no profiles found
      const mockProfiles = [
        {
          id: "p1",
          displayName: "Emma Watson",
          age: 24,
          location: "1.5 km away",
          avatarUrl: profile1,
          bio: "Perfect personality alignment"
        },
        {
          id: "p2",
          displayName: "Sophia Chen",
          age: 22,
          location: "2.3 km away",
          avatarUrl: profile2,
          bio: "Similar communication style"
        },
        {
          id: "p3",
          displayName: "Maya Rodriguez",
          age: 26,
          location: "3.1 km away",
          avatarUrl: profile3,
          bio: "8 shared interests"
        }
      ];

      setProfiles(userProfiles.length > 0 ? userProfiles : mockProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: "Personality", icon: Brain, color: "bg-purple-500" },
    { name: "Interest", icon: Music, color: "bg-blue-500" },
    { name: "Horoscope", icon: Star, color: "bg-yellow-500" },
    { name: "Location", icon: Users, color: "bg-green-500" },
    { name: "Chemistry", icon: Zap, color: "bg-red-500" },
  ];

  const matchProfiles = {
    Personality: [
      {
        id: "p1",
        name: "Emma Watson",
        age: 24,
        distance: "1.5 km away",
        image: profile1,
        matchScore: 98,
        matchReason: "Perfect personality alignment"
      },
      {
        id: "p2", 
        name: "Sophia Chen",
        age: 22,
        distance: "2.3 km away",
        image: profile2,
        matchScore: 95,
        matchReason: "Similar communication style"
      }
    ],
    Interest: [
      {
        id: "i1",
        name: "Maya Rodriguez",
        age: 26,
        distance: "3.1 km away", 
        image: profile3,
        matchScore: 92,
        matchReason: "8 shared interests"
      },
      {
        id: "i2",
        name: "Luna Park",
        age: 23,
        distance: "1.8 km away",
        image: profile1,
        matchScore: 89,
        matchReason: "Music & art lover"
      }
    ],
    Horoscope: [
      {
        id: "h1",
        name: "Aria Johnson",
        age: 25,
        distance: "2.7 km away",
        image: profile2,
        matchScore: 88,
        matchReason: "Libra compatibility"
      }
    ],
    Location: [
      {
        id: "l1",
        name: "Zoe Williams",
        age: 21,
        distance: "0.8 km away",
        image: profile3,
        matchScore: 85,
        matchReason: "Same neighborhood"
      }
    ],
    Chemistry: [
      {
        id: "c1",
        name: "Nova Smith",
        age: 27,
        distance: "4.2 km away",
        image: profile1,
        matchScore: 96,
        matchReason: "Instant connection predicted"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">For You</h1>
          </div>
          <button className="p-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-4 pb-4">
          <div className="flex space-x-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`
                  flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeCategory === category.name
                    ? "bg-primary text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
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
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {activeCategory} Matches
          </h2>
          <p className="text-gray-600 text-sm">
            Based on our advanced compatibility algorithm
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Finding your matches...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600">Complete your profile to find better matches!</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                <div className="flex items-center p-4">
                  {/* Profile Image */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={profile.avatarUrl || profile1}
                      alt={`${profile.displayName || 'User'}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {profile.displayName || 'Anonymous'}, {profile.age || '25'}
                      </h3>
                      <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-primary mr-1" />
                        <span className="text-xs font-semibold text-primary">
                          {Math.floor(Math.random() * 20) + 80}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-2">{profile.location || '2.1 km away'}</p>
                    <p className="text-primary text-sm font-medium">
                      {profile.bio || 'Great personality match'}
                    </p>
                  </div>
                  
                  {/* Action Button */}
                  <button className="ml-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
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