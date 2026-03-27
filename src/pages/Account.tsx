import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Edit3, Camera, Shield, Bell, Heart, Users, HelpCircle, LogOut, Key, Crown, Star, CreditCard, Calendar, ArrowRight } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ApiKeyManager from "@/components/ApiKeyManager";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import profile1 from "@/assets/profile-1.jpg";

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate('/welcome');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };
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
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Camera,
      title: "Manage Photos",
      subtitle: "Add or reorder your photos",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Settings,
      title: "Preferences",
      subtitle: "Dating preferences and filters",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Push and email notifications",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      subtitle: "Control your privacy settings",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help or contact us",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Desktop Header */}
        <div className="bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-lg">
          <div className="max-w-screen-2xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                My Account
              </h1>
              <div className="flex items-center gap-4">
                <button className="p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors" title="Settings">
                  <Settings className="w-5 h-5 text-primary" />
                </button>
                <button className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors" title="Help & Support">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="max-w-screen-xl mx-auto px-8 py-8">
          <div className="grid gap-8" style={{ gridTemplateColumns: '300px 1fr' }}>

            {/* Left Sidebar - Profile & Plan */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-card rounded-3xl shadow-xl border border-border p-8 relative overflow-hidden">
                {/* Premium gradient overlay */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/15 to-primary/25 rounded-full -translate-y-20 translate-x-20"></div>

                <div className="text-center relative z-10">
                  <div className="relative inline-block mb-6">
                    <img
                      src={profile1}
                      alt="Profile"
                      className="w-28 h-28 rounded-2xl object-cover ring-4 ring-primary/15 shadow-2xl mx-auto"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary to-primary rounded-xl flex items-center justify-center shadow-lg">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile?.display_name || profile?.first_name || user?.email?.split('@')[0] || 'User'}
                    </h2>
                    <Crown className="w-6 h-6 text-amber-500 fill-current" />
                  </div>
                  <p className="text-primary text-lg font-semibold mb-4">Premium Member</p>
                  <div className="flex items-center justify-center gap-3">
                    <Badge className="bg-gradient-to-r from-primary to-primary text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg">
                      <Shield className="w-4 h-4 mr-1.5" />
                      Verified Profile
                    </Badge>
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg">
                      <Star className="w-4 h-4 mr-1.5" />
                      Premium
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className="bg-card rounded-3xl shadow-xl border border-border p-6 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-2xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Current Plan</h3>
                        <p className="text-sm text-muted-foreground">Manage your subscription</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/15 text-primary px-3 py-1 text-xs font-medium">
                      Active
                    </Badge>
                  </div>

                  <div className="bg-primary/10 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">Premium Plan</h4>
                        <p className="text-sm text-muted-foreground">$19.99 per month</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Next billing</p>
                        <p className="text-sm font-medium text-foreground">March 15, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleMenuClick("Manage Plan")}
                      className="w-full bg-gradient-to-r from-primary to-primary text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Manage Plan</span>
                    </button>
                    <button className="w-full px-4 py-3 border border-border rounded-2xl hover:bg-muted transition-colors flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Billing History</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Settings Grid */}
            <div className="space-y-8">
              {/* Account Settings */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Account Settings</h2>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {menuItems.slice(0, 3).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        onClick={() => handleMenuClick(item.title)}
                        className="bg-card rounded-2xl shadow-lg border border-border p-6 text-left hover:shadow-xl hover:border-border transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className={`w-6 h-6 ${item.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg mb-1">{item.title}</h3>
                            <p className="text-muted-foreground text-sm">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy & Support */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Privacy & Support</h2>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {menuItems.slice(3).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        onClick={() => handleMenuClick(item.title)}
                        className="bg-card rounded-2xl shadow-lg border border-border p-6 text-left hover:shadow-xl hover:border-border transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className={`w-6 h-6 ${item.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg mb-1">{item.title}</h3>
                            <p className="text-muted-foreground text-sm">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle Features */}
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl shadow-xl border border-transparent p-8 text-left hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <button
                  onClick={() => navigate('/lifestyle-features')}
                  className="w-full text-left relative z-10"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Calendar className="w-9 h-9 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-xl mb-1">Lifestyle & Daily Tips</h3>
                      <p className="text-white/90 text-base">Personalized wellness and lifestyle guidance</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge className="bg-white/20 text-white text-xs font-medium backdrop-blur-sm px-3 py-1">
                          📅 Daily Tips
                        </Badge>
                        <Badge className="bg-white/20 text-white text-xs font-medium backdrop-blur-sm px-3 py-1">
                          🤗 Well-being
                        </Badge>
                        <Badge className="bg-white/20 text-white text-xs font-medium backdrop-blur-sm px-3 py-1">
                          🌱 Growth
                        </Badge>
                      </div>
                    </div>
                    <div className="text-white">
                      <ArrowRight className="w-7 h-7 transition-transform duration-200 hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Premium Benefits */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Premium Benefits</h2>
                <div className="bg-gradient-to-br from-primary via-primary to-primary rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>

                  <div className="relative z-10 flex items-start gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Crown className="w-8 h-8 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Your Premium Features</h3>
                      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">Unlimited likes</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">See who liked you</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Key className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">Advanced filters</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">Premium support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <div className="flex justify-start">
                <button
                  onClick={handleSignOut}
                  className="bg-card rounded-xl shadow-sm border border-red-100 px-8 py-4 text-left hover:shadow-lg hover:border-red-200 transition-all duration-300 group flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <LogOut className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600 text-lg">Sign Out</h3>
                    <p className="text-muted-foreground text-sm">Log out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-20">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-foreground">Account</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                  <Settings className="w-5 h-5 text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/privacy-safety')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy & Safety
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help-support')}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-4">
          <div className="bg-card rounded-3xl shadow-lg border border-border p-6 mb-6 relative overflow-hidden">
            {/* Premium gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/15 to-primary/25 rounded-full -translate-y-16 translate-x-16"></div>

            <div className="flex items-center space-x-4 relative z-10">
              <div className="relative">
                <img
                  src={profile1}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/15 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-primary to-primary rounded-full flex items-center justify-center shadow-lg">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {profile?.display_name || profile?.first_name || user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <Crown className="w-5 h-5 text-amber-500 fill-current" />
                </div>
                <p className="text-primary text-sm font-medium mb-2">Premium Member</p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-primary to-primary text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm">
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
          <div className="bg-card rounded-3xl shadow-lg border border-border p-6 mb-6 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full -translate-y-12 translate-x-12"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-2xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">Manage your subscription</p>
                  </div>
                </div>
                <Badge className="bg-primary/15 text-primary px-3 py-1 text-xs font-medium">
                  {currentPlan.status}
                </Badge>
              </div>

              <div className="bg-primary/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-foreground">{currentPlan.name} Plan</h4>
                    <p className="text-sm text-muted-foreground">{currentPlan.price} {currentPlan.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next billing</p>
                    <p className="text-sm font-medium text-foreground">{currentPlan.nextBilling}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleMenuClick("Manage Plan")}
                  className="flex-1 bg-gradient-to-r from-primary to-primary text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Manage Plan</span>
                </button>
                <button className="px-4 py-3 border border-border rounded-2xl hover:bg-muted transition-colors">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
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
                  className="w-full bg-card rounded-2xl shadow-sm border border-border p-5 text-left hover:shadow-lg hover:border-border transition-all duration-300 active:scale-98 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-base">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.subtitle}</p>
                    </div>
                    <svg className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Lifestyle Features Section */}
          <div className="mt-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl shadow-lg border border-transparent p-6 text-left hover:shadow-xl transition-all duration-300 overflow-hidden relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

            <button
              onClick={() => navigate('/lifestyle-features')}
              className="w-full text-left relative z-10"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Lifestyle & Daily Tips</h3>
                  <p className="text-white/90 text-sm mt-1">Personalized wellness and lifestyle guidance</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                      📅 Daily Tips
                    </Badge>
                    <Badge className="bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                      🤗 Well-being
                    </Badge>
                    <Badge className="bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                      🌱 Growth
                    </Badge>
                  </div>
                </div>
                <div className="text-white">
                  <ArrowRight className="w-6 h-6 transition-transform duration-200 hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>

          {/* Premium Features */}
          <div className="mt-6 bg-gradient-to-br from-primary via-primary to-primary rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
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
          <button
            onClick={handleSignOut}
            className="w-full mt-6 bg-card rounded-2xl shadow-sm border border-red-100 p-5 text-left hover:shadow-lg hover:border-red-200 transition-all duration-300 active:scale-98 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-600 text-base">Sign Out</h3>
                <p className="text-muted-foreground text-sm">Log out of your account</p>
              </div>
              <svg className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <InteractiveMenu />
      </div>
    </>
  );
};

export default Account;
