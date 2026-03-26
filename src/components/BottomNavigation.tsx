import { Home, Heart, MessageCircle, User, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";

const BottomNavigation = () => {
  const { counts } = useNotificationCounts();

  const navItems = [
    { icon: Home, label: "Discover", path: "/", count: 0 },
    { icon: Heart, label: "Likes", path: "/like-you", count: counts.likeYou || 0 },
    { icon: MessageCircle, label: "Matches", path: "/matches", count: counts.matches },
    { icon: Sparkles, label: "Community", path: "/community", count: counts.community },
    { icon: User, label: "Profile", path: "/account", count: 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 px-1 py-1.5 z-50 safe-bottom md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 relative transition-all duration-200 rounded-xl ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {item.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {item.count > 9 ? "9+" : item.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1.5 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
