import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, EyeOff, Users, Bell } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";

const PrivacySafety = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    profileVisibility: "everyone",
    showAge: true,
    showDistance: true,
    showActiveStatus: true,
    allowReadReceipts: true,
    incognitoMode: false,
    blockContacts: false
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate("/account")}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Privacy & Safety</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Visibility */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-500" />
            Profile Visibility
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Who can see your profile</label>
              <div className="space-y-2">
                {[
                  { value: "everyone", label: "Everyone" },
                  { value: "matches", label: "Only matches" },
                  { value: "premium", label: "Premium users only" }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option.value}
                      checked={settings.profileVisibility === option.value}
                      onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                      className="mr-3"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Show my age</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAge}
                  onChange={() => handleToggle("showAge")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span>Show distance</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showDistance}
                  onChange={() => handleToggle("showDistance")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Activity Status */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-green-500" />
            Activity Status
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show active status</p>
                <p className="text-sm text-gray-500">Let others see when you're online</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showActiveStatus}
                  onChange={() => handleToggle("showActiveStatus")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Read receipts</p>
                <p className="text-sm text-gray-500">Show when you've read messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowReadReceipts}
                  onChange={() => handleToggle("allowReadReceipts")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Privacy */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-500" />
            Advanced Privacy
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Incognito Mode</p>
                <p className="text-sm text-gray-500">Browse profiles without being seen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.incognitoMode}
                  onChange={() => handleToggle("incognitoMode")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Block phone contacts</p>
                <p className="text-sm text-gray-500">Don't show me people from my contacts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.blockContacts}
                  onChange={() => handleToggle("blockContacts")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Safety Resources */}
        <div className="bg-red-50 rounded-2xl p-6">
          <h3 className="font-semibold text-red-900 mb-4">Safety Resources</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Report a User</p>
              <p className="text-sm text-gray-500">Report inappropriate behavior</p>
            </button>
            <button className="w-full text-left p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Safety Tips</p>
              <p className="text-sm text-gray-500">Learn how to stay safe while dating</p>
            </button>
            <button className="w-full text-left p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Blocked Users</p>
              <p className="text-sm text-gray-500">Manage your blocked list</p>
            </button>
          </div>
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default PrivacySafety;