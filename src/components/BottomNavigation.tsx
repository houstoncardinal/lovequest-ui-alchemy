import { Home, Users, Heart, MessageCircle, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNavigation = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/", count: 0 },
    { icon: Users, label: "For You", path: "/for-you", count: 0 },
    { icon: Heart, label: "Like You", path: "/like-you", count: 54 },
    { icon: MessageCircle, label: "Chat", path: "/chat", count: 12 },
    { icon: User, label: "Account", path: "/account", count: 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 relative ${
                isActive ? "text-primary" : "text-gray-500"
              }`
            }
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;