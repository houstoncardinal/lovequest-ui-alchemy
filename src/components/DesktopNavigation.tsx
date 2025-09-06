import { Home, Heart, MessageCircle, User, Sparkles, Moon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";
import Logo from "./Logo";

const DesktopNavigation = () => {
  const { counts, loading } = useNotificationCounts();

  const navItems = [
    { icon: Home, label: "Home", path: "/", count: 0 },
    { icon: Heart, label: "Like You", path: "/like-you", count: counts.likeYou },
    { icon: MessageCircle, label: "Matches", path: "/matches", count: counts.matches },
    { icon: Sparkles, label: "Community", path: "/community", count: counts.community },
    { icon: Moon, label: "Deen", path: "/islamic-features", count: 0 },
    { icon: User, label: "Account", path: "/account", count: 0 },
  ];

  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 z-50">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Logo size="sm" />
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "text-primary bg-primary/10 font-medium" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium animate-pulse">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;