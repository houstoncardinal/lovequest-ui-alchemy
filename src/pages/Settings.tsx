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
import { db, doc, getDoc, setDoc } from "@/integrations/firebase";
import { getUserProfile } from "@/lib/firestore/users";

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
      const profileData = await getUserProfile(user.uid);
      setUserProfile(profileData);

      // Fetch user settings
      const settingsRef = doc(db, 'userSettings', user.uid);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const settingsData = settingsSnap.data();
        setUserSettings(settingsData);
        setPrivacy({
          profileVisibility: settingsData.profileVisibility || "everyone",
          showOnlineStatus: settingsData.showActiveStatus || true,
          showLastSeen: settingsData.showDistance || false,
          allowMessages: "matched", // Default since this isn't in schema
          locationSharing: "approximate", // Default since this isn't in schema
        });
        setAppSettings(prev => ({
          ...prev,
          soundEffects: settingsData.soundEnabled || true,
          hapticFeedback: settingsData.vibrationEnabled || true,
        }));
      }

      // Fetch notification preferences
      const notificationRef = doc(db, 'notificationPreferences', user.uid);
      const notificationSnap = await getDoc(notificationRef);

      if (notificationSnap.exists()) {
        const notificationData = notificationSnap.data();
        setNotifications({
          newMatches: notificationData.newMatches || true,
          messages: notificationData.newMessages || true,
          likes: notificationData.superLikes || true,
          events: false, // Not in schema
          safety: true, // Default
          marketing: notificationData.marketingEmails || false,
        });
      }
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
      // Save user settings
      const settingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(settingsRef, {
        userId: user.uid,
        profileVisibility: privacy.profileVisibility,
        showActiveStatus: privacy.showOnlineStatus,
        showDistance: privacy.showLastSeen,
        soundEnabled: appSettings.soundEffects,
        vibrationEnabled: appSettings.hapticFeedback,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Save notification preferences
      const notificationRef = doc(db, 'notificationPreferences', user.uid);
      await setDoc(notificationRef, {
        userId: user.uid,
        newMatches: notifications.newMatches,
        newMessages: notifications.messages,
        superLikes: notifications.likes,
        marketingEmails: notifications.marketing,
        updatedAt: new Date().toISOString()
      }, { merge: true });

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
        // TODO: Call Firebase Cloud Function to delete account
        // This should be implemented as a Cloud Function that:
        // 1. Deletes user document from Firestore
        // 2. Deletes user settings and preferences
        // 3. Deletes all user photos from Storage
        // 4. Deletes the Firebase Auth user
        // For now, just sign out

        toast({
          title: "Account deletion",
          description: "Account deletion will be implemented via Cloud Functions. Signing you out for now.",
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
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
              <div className="p-2 bg-emerald-100 rounded-lg">
                <User className="h-5 w-5 text-emerald-600" />
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
              <Button variant="outline" size="sm" disabled>
                Change
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profile Name</p>
                <p className="text-sm text-gray-500">
                  {userProfile?.displayName || userProfile?.firstName || "Not set"}
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
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Bell className="h-5 w-5 text-emerald-600" />
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
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600" />
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
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Globe className="h-5 w-5 text-emerald-600" />
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
              onClick={() => {
                toast({
                  title: "Data export",
                  description: "Data export feature will be implemented soon.",
                });
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
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
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