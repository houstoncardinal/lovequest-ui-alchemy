import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Heart, MessageCircle, User } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  notificationCount?: number;
}

const menuItems: MenuItem[] = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "for-you", label: "For You", icon: Users, path: "/for-you" },
  { id: "like-you", label: "Like You", icon: Heart, path: "/like-you", notificationCount: 54 },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat", notificationCount: 12 },
  { id: "account", label: "Account", icon: User, path: "/account" },
];

const emerald = "hsl(158, 64%, 52%)";

const ModernMobileMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const found = menuItems.find((item) => location.pathname === item.path);
    return found ? found.id : "home";
  });

  const handleTabClick = (item: MenuItem) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_24px_0_rgba(16,185,129,0.08)] flex justify-around items-center h-[64px]">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item)}
            className="flex flex-col items-center justify-center relative flex-1 py-1 min-w-0 min-h-0 group focus:outline-none transition-all duration-200 hover:bg-emerald-50/40 active:bg-emerald-100/60 rounded-xl"
            aria-label={item.label}
          >
            <span className="relative flex items-center justify-center">
              <Icon
                className={`w-7 h-7 transition-colors duration-200 drop-shadow-sm ${
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                }`}
              />
              {item.notificationCount && item.notificationCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white ring-2 ring-emerald-200 shadow"
                  style={{ minWidth: '1.25rem', height: '1.25rem', fontSize: '10px', lineHeight: 1 }}
                >
                  {item.notificationCount > 99 ? "99+" : item.notificationCount}
                </span>
              )}
            </span>
            <span
              className={`mt-1 text-xs font-medium transition-colors duration-200 ${
                isActive ? "text-emerald-600" : "text-slate-500 group-hover:text-emerald-600"
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-10 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-md"
                style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default ModernMobileMenu;