import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import ProfileCard from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

const LikeYou = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Recent");
  
  const tabs = [
    { name: "All", count: 200 },
    { name: "Recent", count: 50 },
    { name: "Nearby", count: 150 }
  ];

  const profiles = [
    {
      id: "1",
      name: "Shafa Asadel",
      age: 20,
      distance: "2 km away",
      image: profile1,
    },
    {
      id: "2", 
      name: "Aura Alexandra",
      age: 20,
      distance: "2 km away",
      image: profile3,
    },
    {
      id: "3",
      name: "Angkita Sekar",
      age: 23,
      distance: "3 km away", 
      image: profile2,
    },
    {
      id: "4",
      name: "Sarah Johnson",
      age: 25,
      distance: "1 km away",
      image: profile1,
    },
    {
      id: "5",
      name: "Emma Wilson",
      age: 22,
      distance: "4 km away",
      image: profile3,
    },
    {
      id: "6",
      name: "Jessica Brown",
      age: 24,
      distance: "2 km away",
      image: profile2,
    }
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
          <button className="p-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
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
        <div className="grid grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              {...profile}
              onLike={(id) => console.log('Liked:', id)}
              onClick={(id) => navigate(`/profile/${id}`)}
            />
          ))}
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default LikeYou;