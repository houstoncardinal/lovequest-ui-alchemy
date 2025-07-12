import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, MapPin, Heart, Shield, Filter } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import { Badge } from "@/components/ui/badge";

const Preferences = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    ageRange: [22, 30],
    maxDistance: 25,
    lookingFor: "relationship",
    showMe: "women",
    dealBreakers: {
      smoking: false,
      drinking: false,
      kids: false
    }
  });

  const handleRangeChange = (field: string, index: number, value: number) => {
    setPreferences(prev => ({
      ...prev,
      [field]: index === 0 
        ? [value, prev.ageRange[1]]
        : [prev.ageRange[0], value]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate("/account")}
            className="p-2 rounded-full hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Preferences</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Preferences */}
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 rounded-full -translate-y-10 translate-x-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-6">
              <Filter className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-lg">Discovery Settings</h3>
            </div>
            
            {/* Age Range */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Age Range
                </label>
                <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                  {preferences.ageRange[0]} - {preferences.ageRange[1]} years
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500 w-8">18</span>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={preferences.ageRange[0]}
                    onChange={(e) => handleRangeChange("ageRange", 0, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${(preferences.ageRange[0] - 18) / 32 * 100}%, #d1fae5 ${(preferences.ageRange[0] - 18) / 32 * 100}%, #d1fae5 100%)`
                    }}
                  />
                  <span className="text-xs text-gray-500 w-8">50</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500 w-8">18</span>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={preferences.ageRange[1]}
                    onChange={(e) => handleRangeChange("ageRange", 1, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${(preferences.ageRange[1] - 18) / 32 * 100}%, #d1fae5 ${(preferences.ageRange[1] - 18) / 32 * 100}%, #d1fae5 100%)`
                    }}
                  />
                  <span className="text-xs text-gray-500 w-8">50</span>
                </div>
              </div>
            </div>

            {/* Max Distance */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Maximum Distance
                </label>
                <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                  {preferences.maxDistance} km
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={preferences.maxDistance}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${preferences.maxDistance}%, #d1fae5 ${preferences.maxDistance}%, #d1fae5 100%)`
                  }}
                />
              </div>
            </div>

            {/* Show Me */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Show Me</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: "women", label: "Women", icon: "👩" },
                  { value: "men", label: "Men", icon: "👨" },
                  { value: "everyone", label: "Everyone", icon: "👥" }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="showMe"
                      value={option.value}
                      checked={preferences.showMe === option.value}
                      onChange={(e) => setPreferences(prev => ({ ...prev, showMe: e.target.value }))}
                      className="mr-3 w-4 h-4 text-emerald-600"
                    />
                    <span className="text-lg mr-3">{option.icon}</span>
                    <span className="capitalize font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Looking For</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: "relationship", label: "Long-term relationship", icon: Heart },
                  { value: "dating", label: "Dating", icon: Heart },
                  { value: "friends", label: "New friends", icon: Users },
                  { value: "networking", label: "Networking", icon: Users }
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <label key={option.value} className="flex items-center p-3 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="lookingFor"
                        value={option.value}
                        checked={preferences.lookingFor === option.value}
                        onChange={(e) => setPreferences(prev => ({ ...prev, lookingFor: e.target.value }))}
                        className="mr-3 w-4 h-4 text-emerald-600"
                      />
                      <Icon className="w-5 h-5 text-emerald-600 mr-3" />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Deal Breakers */}
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-red-400/10 to-red-600/10 rounded-full -translate-y-8 -translate-x-8"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900 text-lg">Deal Breakers</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Don't show me people who have these traits
            </p>
            
            <div className="space-y-4">
              {[
                { key: "smoking", label: "Smoking", icon: "🚬" },
                { key: "drinking", label: "Heavy drinking", icon: "🍺" },
                { key: "kids", label: "Has children", icon: "👶" }
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.dealBreakers[item.key as keyof typeof preferences.dealBreakers]}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      dealBreakers: {
                        ...prev.dealBreakers,
                        [item.key]: e.target.checked
                      }
                    }))}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default Preferences;