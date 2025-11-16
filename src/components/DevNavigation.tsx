import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code } from "lucide-react";

const DevNavigation = () => {
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  // Don't render in production
  if (!isDev) return null;

  const routes = [
    { path: "/", label: "🏠 Home" },
    { path: "/welcome", label: "👋 Welcome" },
    { path: "/signup", label: "✍️ Sign Up" },
    { path: "/login", label: "🔐 Login" },
    { path: "/onboarding", label: "🚀 Onboarding" },
    { path: "/like-you", label: "❤️ Like You" },
    { path: "/for-you", label: "✨ For You" },
    { path: "/matches", label: "💑 Matches" },
    { path: "/messages", label: "💬 Messages" },
    { path: "/community", label: "👥 Community" },
    { path: "/account", label: "👤 Account" },
    { path: "/edit-profile", label: "✏️ Edit Profile" },
    { path: "/manage-photos", label: "📸 Manage Photos" },
    { path: "/photo-manager", label: "🖼️ Photo Manager" },
    { path: "/preferences", label: "⚙️ Preferences" },
    { path: "/notifications", label: "🔔 Notifications" },
    { path: "/privacy-safety", label: "🔒 Privacy & Safety" },
    { path: "/help-support", label: "❓ Help & Support" },
    { path: "/pricing", label: "💰 Pricing" },
    { path: "/settings", label: "⚙️ Settings" },
    { path: "/advanced-filters", label: "🔍 Advanced Filters" },
    { path: "/advanced-search", label: "🔎 Advanced Search" },
    { path: "/verification", label: "✅ Verification" },
    { path: "/premium-features", label: "👑 Premium Features" },
    { path: "/lifestyle-features", label: "🌟 Lifestyle Features" },
    { path: "/relationship-features", label: "💕 Relationship Features" },
    { path: "/enhanced-matching", label: "🎯 Enhanced Matching" },
    { path: "/admin", label: "🔧 Admin Dashboard" },
    { path: "/terms-of-service", label: "📜 Terms of Service" },
  ];

  const handleNavigation = (value: string) => {
    if (value) {
      navigate(value);
    }
  };

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none">
      <div className="pointer-events-auto">
        <Select onValueChange={handleNavigation}>
          <SelectTrigger className="w-[280px] bg-purple-600 text-white border-purple-700 shadow-lg hover:bg-purple-700 transition-colors">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <SelectValue placeholder="🔧 Dev Navigation" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[400px] overflow-y-auto">
            {routes.map((route) => (
              <SelectItem
                key={route.path}
                value={route.path}
                className="cursor-pointer hover:bg-purple-50"
              >
                {route.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DevNavigation;
