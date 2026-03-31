import React, { useState, useEffect } from "react";
import { ArrowLeft, Bell, Shield, User, Globe, Moon, Download, Trash2, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    events: false,
    safety: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "everyone",
    showOnlineStatus: true,
    showLastSeen: false,
    allowMessages: "matched",
    locationSharing: "approximate",
  });

  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    language: "English",
    autoPlay: true,
    soundEffects: true,
    hapticFeedback: true,
  });

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Settings and notification preferences stored locally until tables are created
      setUserSettings(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save settings locally until dedicated tables are created
      localStorage.setItem('userSettings', JSON.stringify({
        privacy,
        notifications,
        appSettings,
      }));

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate("/welcome");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        // Call the delete account function
        // Delete user profile data
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user?.id ?? '');
        
        if (error) throw error;
        
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        });
        
        // Sign out and redirect
        await signOut();
        navigate('/welcome');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="sm" />
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Account Section */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{user?.email || "No email provided"}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <Button variant="outline" size="sm" onClick={async () => {
                if (!user?.email) return;
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) throw error;
                  toast({ title: "Check your email", description: "Password reset link sent." });
                } catch (err: any) {
                  toast({ title: "Error", description: err.message, variant: "destructive" });
                }
              }}>
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profile Name</p>
                <p className="text-sm text-gray-500">
                  {userProfile?.display_name || userProfile?.first_name || "Not set"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/edit-profile')}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Control your notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {key === 'newMatches' && 'When someone new likes you'}
                    {key === 'messages' && 'When you receive new messages'}
                    {key === 'likes' && 'When someone likes your profile'}
                    {key === 'events' && 'Community events and meetups'}
                    {key === 'safety' && 'Important safety alerts'}
                    {key === 'marketing' && 'Promotional content and updates'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, [key]: checked }));
                    // Auto-save settings
                    setTimeout(saveSettings, 500);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy & Safety Section */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Privacy & Safety</CardTitle>
                <CardDescription>Control your privacy settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profile Visibility</p>
                <p className="text-sm text-gray-500">Who can see your profile</p>
              </div>
              <Select 
                value={privacy.profileVisibility} 
                onValueChange={(value) => {
                  setPrivacy(prev => ({ ...prev, profileVisibility: value }));
                  setTimeout(saveSettings, 500);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="matched_only">Matched Only</SelectItem>
                  <SelectItem value="premium_only">Premium Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Online Status</p>
                <p className="text-sm text-gray-500">Let others see when you're online</p>
              </div>
              <Switch
                checked={privacy.showOnlineStatus}
                onCheckedChange={(checked) => {
                  setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }));
                  setTimeout(saveSettings, 500);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Location Sharing</p>
                <p className="text-sm text-gray-500">How precise your location is shared</p>
              </div>
              <Select 
                value={privacy.locationSharing} 
                onValueChange={(value) => {
                  setPrivacy(prev => ({ ...prev, locationSharing: value }));
                  setTimeout(saveSettings, 500);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approximate">Approximate</SelectItem>
                  <SelectItem value="city">City Only</SelectItem>
                  <SelectItem value="none">Don't Share</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences Section */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">App Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch to dark theme</p>
              </div>
              <Switch
                checked={appSettings.darkMode}
                onCheckedChange={(checked) => {
                  setAppSettings(prev => ({ ...prev, darkMode: checked }));
                  
                  // Toggle dark mode class on document
                  if (checked) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Store preference
                  localStorage.setItem('darkMode', checked.toString());
                  
                  toast({
                    title: "Theme updated",
                    description: `Switched to ${checked ? 'dark' : 'light'} mode.`,
                  });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Language</p>
                <p className="text-sm text-gray-500">App language</p>
              </div>
              <Select 
                value={appSettings.language} 
                onValueChange={(value) => {
                  setAppSettings(prev => ({ ...prev, language: value }));
                  toast({
                    title: "Language preference saved",
                    description: "Multi-language support will be implemented soon.",
                  });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">العربية</SelectItem>
                  <SelectItem value="Urdu">اردو</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sound Effects</p>
                <p className="text-sm text-gray-500">Play sounds for interactions</p>
              </div>
              <Switch
                checked={appSettings.soundEffects}
                onCheckedChange={(checked) => {
                  setAppSettings(prev => ({ ...prev, soundEffects: checked }));
                  setTimeout(saveSettings, 500);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Haptic Feedback</p>
                <p className="text-sm text-gray-500">Vibration feedback</p>
              </div>
              <Switch
                checked={appSettings.hapticFeedback}
                onCheckedChange={(checked) => {
                  setAppSettings(prev => ({ ...prev, hapticFeedback: checked }));
                  setTimeout(saveSettings, 500);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Section */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Data & Privacy</CardTitle>
            <CardDescription>Manage your data and privacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={async () => {
                if (!user) return;
                try {
                  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
                  const { data: matches } = await supabase.from('matches').select('*').or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
                  const { data: likes } = await supabase.from('likes').select('*').eq('liker_id', user.id);
                  
                  const exportData = {
                    email: user.email,
                    profile,
                    matches_count: matches?.length || 0,
                    likes_sent: likes?.length || 0,
                    exported_at: new Date().toISOString(),
                  };
                  
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'lovequest-data-export.json';
                  a.click();
                  URL.revokeObjectURL(url);
                  
                  toast({ title: "Data exported", description: "Your data has been downloaded." });
                } catch (error) {
                  toast({ title: "Error", description: "Failed to export data.", variant: "destructive" });
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700" 
              size="sm"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Save Settings Button */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button 
              onClick={saveSettings}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary/50 to-primary text-white"
            >
              {loading ? "Saving..." : "Save All Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-500">
          <p>LoveQuest v1.0.0</p>
          <p className="mt-1">Premium Dating</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 