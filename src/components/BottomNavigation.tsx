import { Home, Users, Heart, MessageCircle, User, Sparkles, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";

const BottomNavigation = () => {
  const { counts, loading } = useNotificationCounts();

  const navItems = [
    { icon: Home, label: "Home", path: "/", count: 0 },
    { icon: Heart, label: "Like You", path: "/like-you", count: counts.likeYou },
    { icon: MessageCircle, label: "Matches", path: "/matches", count: counts.matches },
    { icon: Sparkles, label: "Community", path: "/community", count: counts.community },
    { icon: Star, label: "Lifestyle", path: "/lifestyle-features", count: 0 },
    { icon: User, label: "Account", path: "/account", count: 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-2 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-1 relative transition-colors duration-200 ${
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium text-center">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;