import React, { useState } from "react";
import { ArrowLeft, Bell, Shield, User, Globe, Moon, Download, Trash2, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Settings = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    events: false,
    safety: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "all",
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

  const handleLogout = () => {
    // Handle logout logic
    navigate("/welcome");
  };

  const handleDeleteAccount = () => {
    // Handle account deletion logic
    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      navigate("/welcome");
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
                <p className="text-sm text-gray-500">user@example.com</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">
                  {showPassword ? "••••••••" : "••••••••"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Phone Number</p>
                <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
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
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, [key]: checked }))
                  }
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
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="text-sm border border-gray-200 rounded-md px-3 py-1"
              >
                <option value="all">Everyone</option>
                <option value="matched">Matched Only</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Online Status</p>
                <p className="text-sm text-gray-500">Let others see when you're online</p>
              </div>
              <Switch
                checked={privacy.showOnlineStatus}
                onCheckedChange={(checked) =>
                  setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Location Sharing</p>
                <p className="text-sm text-gray-500">How precise your location is shared</p>
              </div>
              <select
                value={privacy.locationSharing}
                onChange={(e) => setPrivacy(prev => ({ ...prev, locationSharing: e.target.value }))}
                className="text-sm border border-gray-200 rounded-md px-3 py-1"
              >
                <option value="approximate">Approximate</option>
                <option value="city">City Only</option>
                <option value="none">Don't Share</option>
              </select>
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
                onCheckedChange={(checked) =>
                  setAppSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Language</p>
                <p className="text-sm text-gray-500">App language</p>
              </div>
              <select
                value={appSettings.language}
                onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
                className="text-sm border border-gray-200 rounded-md px-3 py-1"
              >
                <option value="English">English</option>
                <option value="Arabic">العربية</option>
                <option value="Urdu">اردو</option>
                <option value="French">Français</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sound Effects</p>
                <p className="text-sm text-gray-500">Play sounds for interactions</p>
              </div>
              <Switch
                checked={appSettings.soundEffects}
                onCheckedChange={(checked) =>
                  setAppSettings(prev => ({ ...prev, soundEffects: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Haptic Feedback</p>
                <p className="text-sm text-gray-500">Vibration feedback</p>
              </div>
              <Switch
                checked={appSettings.hapticFeedback}
                onCheckedChange={(checked) =>
                  setAppSettings(prev => ({ ...prev, hapticFeedback: checked }))
                }
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
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="sm">
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

        {/* Version Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Jaan v1.0.0</p>
          <p className="mt-1">Premium Muslim Dating</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 