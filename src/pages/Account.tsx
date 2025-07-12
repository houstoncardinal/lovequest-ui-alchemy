import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Edit3, Camera, Shield, Bell, Heart, Users, HelpCircle, LogOut, Key, Crown, Star, CreditCard, Calendar, ArrowRight } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import ApiKeyManager from "@/components/ApiKeyManager";
import { Badge } from "@/components/ui/badge";
import profile1 from "@/assets/profile-1.jpg";

const Account = () => {
  const navigate = useNavigate();
  const [currentPlan] = useState({
    id: "premium",
    name: "Premium",
    price: "$19.99",
    period: "per month",
    nextBilling: "March 15, 2024",
    status: "active"
  });

  const handleMenuClick = (title: string) => {
    switch (title) {
      case "Edit Profile":
        navigate("/edit-profile");
        break;
      case "Manage Photos":
        navigate("/manage-photos");
        break;
      case "Preferences":
        navigate("/preferences");
        break;
      case "Notifications":
        navigate("/notifications");
        break;
      case "Privacy & Safety":
        navigate("/privacy-safety");
        break;
      case "Help & Support":
        navigate("/help-support");
        break;
      case "Manage Plan":
        navigate("/pricing");
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      icon: Edit3,
      title: "Edit Profile",
      subtitle: "Update your photos and info",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Camera,
      title: "Manage Photos",
      subtitle: "Add or reorder your photos",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Settings,
      title: "Preferences",
      subtitle: "Dating preferences and filters",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Push and email notifications",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      subtitle: "Control your privacy settings",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help or contact us",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Account</h1>
          <button className="p-2 rounded-full hover:bg-emerald-50 transition-colors">
            <Settings className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6 mb-6 relative overflow-hidden">
          {/* Premium gradient overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="relative">
              <img 
                src={profile1} 
                alt="Profile" 
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-100 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">Ayesha Siddiqui</h2>
                <Crown className="w-5 h-5 text-amber-500 fill-current" />
              </div>
              <p className="text-emerald-600 text-sm font-medium mb-2">Premium Member</p>
              <div className="flex items-center space-x-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Profile
                </Badge>
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6 mb-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Current Plan</h3>
                  <p className="text-sm text-gray-600">Manage your subscription</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                {currentPlan.status}
              </Badge>
            </div>
            
            <div className="bg-emerald-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{currentPlan.name} Plan</h4>
                  <p className="text-sm text-gray-600">{currentPlan.price} {currentPlan.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Next billing</p>
                  <p className="text-sm font-medium text-gray-900">{currentPlan.nextBilling}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => handleMenuClick("Manage Plan")}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Manage Plan</span>
              </button>
              <button className="px-4 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                <Calendar className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => handleMenuClick(item.title)}
                className="w-full bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 text-left hover:shadow-lg hover:border-emerald-200 transition-all duration-300 active:scale-98 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.subtitle}</p>
                  </div>
                  <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Premium Features */}
        <div className="mt-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-amber-300" />
                <h3 className="text-lg font-bold">Premium Features</h3>
              </div>
              <Badge className="bg-white/20 text-white rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                Active
              </Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-medium">Unlimited likes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-medium">See who liked you</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <span className="font-medium">Advanced filters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className="w-full mt-6 bg-white rounded-2xl shadow-sm border border-red-100 p-5 text-left hover:shadow-lg hover:border-red-200 transition-all duration-300 active:scale-98 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 text-base">Sign Out</h3>
              <p className="text-gray-600 text-sm">Log out of your account</p>
            </div>
            <svg className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default Account;