import { useState, useEffect } from "react";
import { Home, Heart, MessageCircle, Sparkles, Crown, Settings, Bell, Users, MapPin, Filter, Gift, TrendingUp, Star, User, Shield, CreditCard, Activity, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";
import { useLikesLimit } from "@/hooks/useLikesLimit";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DesktopNavigation = () => {
  const { user, signOut } = useAuth();
  const { counts, loading } = useNotificationCounts();
  const { likesUsage } = useLikesLimit();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/"
    },
    {
      icon: MessageCircle,
      label: "Matches",
      path: "/matches",
      count: counts.matches
    },
    {
      icon: Sparkles,
      label: "Community",
      path: "/community",
      count: counts.community
    },
  ];

  const featureSections = [
    {
      title: "Premium Features",
      items: [
        { icon: Crown, label: "Upgrade to Premium", path: "/pricing", count: 0, description: "Enhanced matching" },
        { icon: Star, label: "Lifestyle Matching", path: "/lifestyle-features", count: 0, description: "Advanced preferences" },
        { icon: Gift, label: "Premium Perks", path: "/premium-features", count: 0, description: "Exclusive benefits" },
      ]
    },
    {
      title: "Discovery",
      items: [
        { icon: Filter, label: "Advanced Search", path: "/advanced-search", count: 0, description: "Find specific matches" },
        { icon: MapPin, label: "Nearby Matches", path: "/enhanced-matching", count: 0, description: "Location-based" },
        { icon: TrendingUp, label: "Match Trends", path: "/match-insights", count: 0, description: "Analytics" },
      ]
    },
    {
      title: "My Account",
      items: [
        { icon: User, label: "My Profile", path: "/edit-profile", count: 0, description: "Edit your profile" },
        { icon: Settings, label: "Settings", path: "/settings", count: 0, description: "App preferences" },
        { icon: Bell, label: "Notifications", path: "/notifications", count: 0, description: "Manage alerts" },
        { icon: Shield, label: "Privacy", path: "/privacy-safety", count: 0, description: "Security & privacy" },
        { icon: CreditCard, label: "Billing", path: "/account", count: 0, description: "Payments" },
      ]
    }
  ];

  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm z-50">
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto px-6 py-3">

        {/* Left Section - Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-elegant" style={{ background: 'var(--gradient-hero)' }}>
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-1.5">
                LoveQuest
                <Heart className="w-4 h-4 text-primary fill-current" />
              </h1>
              <p className="text-xs text-primary font-semibold tracking-wider uppercase">Premium Dating</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-elegant"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.count && item.count > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {item.count > 9 ? "9+" : item.count}
                    </span>
                  ) : null}
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            </NavLink>
          ))}

          {/* Enhanced Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-700 hover:text-gray-900 hover:bg-white/80 transition-all duration-500 hover:shadow-xl group border border-transparent hover:border-emerald-100">
              <div className="relative">
                <Zap className={`w-6 h-6 transition-all duration-500 group-hover:scale-110 group-hover:text-emerald-600`} />
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold group-hover:scale-105 transition-transform duration-500">Explore</span>
                <span className="text-xs font-medium text-gray-500 group-hover:text-emerald-700">All Features</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-96 bg-white/98 backdrop-blur-2xl border-2 border-emerald-100/60 shadow-2xl rounded-3xl p-6 mt-2">
              {featureSections.map((section, sectionIndex) => (
                <div key={section.title} className={sectionIndex > 0 ? "mt-8 pt-6 border-t border-emerald-100/40" : ""}>
                  <h3 className="text-base font-bold text-gray-900 mb-4 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100/40">
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <NavLink
                          to={item.path}
                          className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-emerald-100/60 hover:shadow-lg"
                        >
                          <div className="relative">
                            <item.icon className="w-6 h-6 text-emerald-600 group-hover:scale-110 group-hover:text-emerald-700 transition-all duration-300" />
                            <div className="absolute -inset-1 bg-emerald-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors duration-300">{item.label}</div>
                            <div className="text-sm text-gray-600 group-hover:text-emerald-700 transition-colors duration-300">{item.description}</div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                            <div className="w-2 h-2 border-t-2 border-r-2 border-emerald-600 transform rotate-45"></div>
                          </div>
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer CTA */}
              <div className="mt-8 pt-6 border-t border-emerald-100/40">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Ready to find your perfect match?</p>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm font-bold shadow-lg">
                    LoveQuest Premium ✨
                  </Badge>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Section - Premium User Profile */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-4">
              {/* Enhanced Status Badge */}
              <div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/60 shadow-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-sm font-bold text-emerald-800">Online Now</span>
              </div>

              {/* Premium User Avatar with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 border-2 border-white">
                      <span className="text-lg font-black text-white">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>

                    {/* Premium tooltip */}
                    <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg z-50">
                      Click for Profile Settings
                      <div className="absolute bottom-full right-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-72 bg-white/98 backdrop-blur-2xl border-2 border-emerald-100/60 shadow-2xl rounded-3xl p-4 mt-3" align="end">
                  {/* User Info Header */}
                  <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-emerald-100/40">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <span className="text-lg font-black text-white">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Premium Member</div>
                      <div className="text-xs text-emerald-600">{user.email}</div>
                    </div>
                  </div>

                  {/* Profile Settings */}
                  <div className="space-y-2">
                    <DropdownMenuItem
                      onClick={() => navigate('/edit-profile')}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Edit Profile</div>
                        <div className="text-xs text-gray-600">Update photos, bio, preferences</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/settings')}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Settings</div>
                        <div className="text-xs text-gray-600">App preferences & privacy</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/notifications')}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Bell className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Notifications</div>
                        <div className="text-xs text-gray-600">Manage match alerts</div>
                      </div>
                      {counts.likeYou > 0 && (
                        <Badge className="bg-red-500 text-white px-2 py-0.5 text-xs">
                          {counts.likeYou > 9 ? '9+' : counts.likeYou}
                        </Badge>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/privacy-safety')}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Privacy & Safety</div>
                        <div className="text-xs text-gray-600">Account security settings</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/account')}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Billing & Account</div>
                        <div className="text-xs text-gray-600">Premium subscription</div>
                      </div>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="my-4 bg-emerald-100/50" />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await signOut();
                        navigate('/login');
                      } catch (error) {
                        console.error('Error signing out:', error);
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-red-900">Sign Out</div>
                      <div className="text-xs text-red-600">Log out of your account</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Premium Status Badge */}
          <Badge className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 py-2 text-sm font-bold shadow-xl border-2 border-amber-300/50 hover:shadow-2xl transition-shadow duration-300">
            <Crown className="w-4 h-4 mr-2" />
            Premium
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;
