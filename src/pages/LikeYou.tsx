import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    { id: "1", name: "Shafa Asadel", age: 20, distance: "2 km away", image: profile1 },
    { id: "2", name: "Aura Alexandra", age: 20, distance: "2 km away", image: profile3 },
    { id: "3", name: "Angkita Sekar", age: 23, distance: "3 km away", image: profile2 },
    { id: "4", name: "Sarah Johnson", age: 25, distance: "1 km away", image: profile1 },
    { id: "5", name: "Emma Wilson", age: 22, distance: "4 km away", image: profile3 },
    { id: "6", name: "Jessica Brown", age: 24, distance: "2 km away", image: profile2 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground mr-3">Like You</h1>
            <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium">
              Premium
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

      
    </div>
  );
};

export default LikeYou;
