import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check, X } from "lucide-react";

interface ApiKeyManagerProps {
  onApiKeyChange?: (apiKey: string) => void;
}

const ApiKeyManager = ({ onApiKeyChange }: ApiKeyManagerProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing API key from localStorage
    const savedApiKey = localStorage.getItem("elevenlabs_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsValid(true);
    }
  }, []);

  const validateApiKey = (key: string) => {
    // Basic validation for ElevenLabs API key format
    return key.length > 0 && key.startsWith("sk-") && key.length > 10;
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    const valid = validateApiKey(value);
    setIsValid(valid);
    
    if (valid) {
      onApiKeyChange?.(value);
    }
  };

  const saveApiKey = async () => {
    if (!isValid || !apiKey) return;
    
    setIsSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem("elevenlabs_api_key", apiKey);
      
      // Simulate API validation (in real app, you'd test the key)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsValid(true);
      onApiKeyChange?.(apiKey);
    } catch (error) {
      setIsValid(false);
    } finally {
      setIsSaving(false);
    }
  };

  const removeApiKey = () => {
    localStorage.removeItem("elevenlabs_api_key");
    setApiKey("");
    setIsValid(null);
    onApiKeyChange?.("");
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
          <Key className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">ElevenLabs API Key</h3>
          <p className="text-sm text-gray-500">Required for voice note features</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="sk-..."
              className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 pr-20 ${
                isValid === true
                  ? "border-green-300 focus:ring-green-200 bg-green-50"
                  : isValid === false
                  ? "border-red-300 focus:ring-red-200 bg-red-50"
                  : "border-gray-200 focus:ring-primary/20 focus:border-primary"
              }`}
            />
            
            {/* Show/Hide Button */}
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>

            {/* Status Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid === true && (
                <Check className="w-5 h-5 text-green-500" />
              )}
              {isValid === false && (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          
          {/* Validation Message */}
          {isValid === false && (
            <p className="text-sm text-red-600 mt-2">
              Please enter a valid ElevenLabs API key (starts with sk-)
            </p>
          )}
          {isValid === true && (
            <p className="text-sm text-green-600 mt-2">
              ✓ API key is valid and saved
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {apiKey && isValid && (
            <button
              onClick={saveApiKey}
              disabled={isSaving || !isValid}
              className="flex-1 bg-primary text-white py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Key"}
            </button>
          )}
          
          {apiKey && (
            <button
              onClick={removeApiKey}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to get your API key:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Visit <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">elevenlabs.io</a></li>
            <li>2. Sign up or log in to your account</li>
            <li>3. Go to your profile settings</li>
            <li>4. Copy your API key (starts with "sk-")</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;