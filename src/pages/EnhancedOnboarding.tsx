import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Check, Crown, Star, Users, Shield, Globe, Heart, MessageCircle, Video, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import VerificationFlow from "@/components/VerificationFlow";
import LocationSetup from "@/components/LocationSetup";

const EnhancedOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    location.state?.selectedPlan || null
  );

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    bio: "",
    occupation: "",
    education: "",
    location: "",
    religionLevel: "",
    prayerFrequency: "",
    hijabStatus: "",
    maritalStatus: "",
    smokingStatus: "",
    hasChildren: false,
    childrenPreference: "",
    madhab: "",
  });

  // Verification and location completion tracking
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [locationCompleted, setLocationCompleted] = useState(false);

  // Skip to verification if coming from pricing
  useEffect(() => {
    if (location.state?.selectedPlan) {
      setCurrentStep(1); // Skip welcome, go to verification
    }
  }, [location.state]);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 likes per day",
        "Basic matching",
        "View profiles",
        "Standard support"
      ],
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      price: "$19.99",
      period: "per month",
      description: "Most popular choice",
      features: [
        "Unlimited likes",
        "See who liked you",
        "Advanced filters",
        "Priority support"
      ],
      popular: true
    },
    {
      id: "elite",
      name: "Elite",
      price: "$39.99",
      period: "per month",
      description: "Ultimate dating experience",
      features: [
        "Everything in Premium",
        "Video calls",
        "Profile verification",
        "VIP support"
      ],
      popular: false
    }
  ];

  const onboardingSteps = [
    {
      title: "Welcome to Jaan",
      subtitle: "Find your perfect match in a respectful, halal environment",
      content: () => (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
              <Heart className="w-16 h-16 text-white relative z-10" />
            </div>
            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 text-xs font-bold shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Start Your Journey</h2>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Join thousands of Muslims finding meaningful relationships. 
            Our platform prioritizes respect, privacy, and authentic connections.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Verified Profiles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">50k+ Members</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Halal Dating</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Identity Verification",
      subtitle: "Verify your identity to ensure a safe community",
      content: () => (
        <VerificationFlow 
          onComplete={() => {
            setVerificationCompleted(true);
            handleNext();
          }}
        />
      )
    },
    {
      title: "Enable Location",
      subtitle: "Find matches near you with location-based recommendations",
      content: () => (
        <LocationSetup 
          onComplete={() => {
            setLocationCompleted(true);
            handleNext();
          }}
          onSkip={() => handleNext()}
        />
      )
    },
    {
      title: "Basic Information",
      subtitle: "Tell us a bit about yourself",
      content: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                placeholder="Enter your first name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                placeholder="Enter your last name"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
            <Input
              id="age"
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData({...profileData, age: e.target.value})}
              placeholder="Enter your age"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">Occupation</Label>
            <Input
              id="occupation"
              value={profileData.occupation}
              onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
              placeholder="What do you do for work?"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="education" className="text-sm font-medium text-gray-700">Education Level</Label>
            <Select value={profileData.education} onValueChange={(value) => setProfileData({...profileData, education: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="some_college">Some College</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Islamic Practice",
      subtitle: "Help us understand your religious practice",
      content: () => (
        <div className="space-y-6">
          <div>
            <Label htmlFor="religionLevel" className="text-sm font-medium text-gray-700">Religious Level</Label>
            <Select value={profileData.religionLevel} onValueChange={(value) => setProfileData({...profileData, religionLevel: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="How would you describe your religious practice?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_religious">Very Religious</SelectItem>
                <SelectItem value="religious">Religious</SelectItem>
                <SelectItem value="somewhat_religious">Somewhat Religious</SelectItem>
                <SelectItem value="not_very_religious">Not Very Religious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="prayerFrequency" className="text-sm font-medium text-gray-700">Prayer Frequency</Label>
            <Select value={profileData.prayerFrequency} onValueChange={(value) => setProfileData({...profileData, prayerFrequency: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="How often do you pray?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5_times_daily">5 times daily</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
                <SelectItem value="rarely">Rarely</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="madhab" className="text-sm font-medium text-gray-700">Madhab (School of Thought)</Label>
            <Select value={profileData.madhab} onValueChange={(value) => setProfileData({...profileData, madhab: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your madhab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hanafi">Hanafi</SelectItem>
                <SelectItem value="maliki">Maliki</SelectItem>
                <SelectItem value="shafi">Shafi'i</SelectItem>
                <SelectItem value="hanbali">Hanbali</SelectItem>
                <SelectItem value="jafari">Ja'fari</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hijabStatus" className="text-sm font-medium text-gray-700">Hijab Status (if applicable)</Label>
            <Select value={profileData.hijabStatus} onValueChange={(value) => setProfileData({...profileData, hijabStatus: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select hijab status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always wear hijab</SelectItem>
                <SelectItem value="sometimes">Sometimes wear hijab</SelectItem>
                <SelectItem value="planning_to">Planning to wear hijab</SelectItem>
                <SelectItem value="not_applicable">Not applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "About You",
      subtitle: "Share more about yourself and what you're looking for",
      content: () => (
        <div className="space-y-6">
          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Tell us about yourself, your interests, and what you're looking for..."
              className="mt-1 min-h-[120px]"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {profileData.bio.length}/500 characters
            </div>
          </div>
          <div>
            <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Marital Status</Label>
            <Select value={profileData.maritalStatus} onValueChange={(value) => setProfileData({...profileData, maritalStatus: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never_married">Never Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="childrenPreference" className="text-sm font-medium text-gray-700">Children Preference</Label>
            <Select value={profileData.childrenPreference} onValueChange={(value) => setProfileData({...profileData, childrenPreference: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="What are your thoughts on having children?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wants_children">Wants children</SelectItem>
                <SelectItem value="open_to_children">Open to children</SelectItem>
                <SelectItem value="doesnt_want_children">Doesn't want children</SelectItem>
                <SelectItem value="already_has_enough">Already has enough children</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="smokingStatus" className="text-sm font-medium text-gray-700">Smoking Status</Label>
            <Select value={profileData.smokingStatus} onValueChange={(value) => setProfileData({...profileData, smokingStatus: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Do you smoke?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
                <SelectItem value="socially">Socially</SelectItem>
                <SelectItem value="regularly">Regularly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "All Set!",
      subtitle: "Your verification is pending. Start exploring while we review your profile.",
      content: () => (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Jaan!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Your profile has been created successfully. We're reviewing your verification documents and will notify you once approved.
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  Verification Pending
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You can browse profiles but cannot send messages until verified (typically 24-48 hours).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <Globe className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-emerald-800">Explore Profiles</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-emerald-800">Start Matching</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    // Skip verification and location steps if already completed via their components
    if (currentStep === 1 && verificationCompleted) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (currentStep === 2 && locationCompleted) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validate current step data
    if (currentStep === 3) {
      if (!profileData.firstName || !profileData.lastName || !profileData.age) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 4) {
      if (!profileData.religionLevel || !profileData.prayerFrequency) {
        toast({
          title: "Required Fields",
          description: "Please complete your Islamic practice information.",
          variant: "destructive",
        });
        return;
      }
    }

    // If this is the last step, save profile and complete onboarding
    if (currentStep === onboardingSteps.length - 1) {
      await saveProfile();
      navigate('/');
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          display_name: `${profileData.firstName} ${profileData.lastName}`,
          age: parseInt(profileData.age),
          bio: profileData.bio,
          career_field: profileData.occupation,
          education_level: profileData.education,
          religion_level: profileData.religionLevel,
          prayer_frequency: profileData.prayerFrequency,
          hijab_status: profileData.hijabStatus,
          marital_status: profileData.maritalStatus,
          smoking_status: profileData.smokingStatus,
          children_preference: profileData.childrenPreference,
          madhab: profileData.madhab,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Created",
        description: "Your profile has been saved successfully!",
      });
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return verificationCompleted;
      case 2:
        return true; // Location can be skipped
      case 3:
        return profileData.firstName && profileData.lastName && profileData.age;
      case 4:
        return profileData.religionLevel && profileData.prayerFrequency;
      case 5:
        return profileData.bio.length >= 50;
      default:
        return true;
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`p-2 rounded-full transition-colors ${
                currentStep === 0
                  ? 'text-gray-300' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500">
                {currentStep + 1}/{onboardingSteps.length}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600">{currentStepData.subtitle}</p>
          </div>

          <div className="mb-8">
            {currentStepData.content()}
          </div>

          {/* Continue button (hidden for verification and location steps as they handle their own navigation) */}
          {currentStep !== 1 && currentStep !== 2 && (
            <div className="text-center">
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                <span className="relative z-10">
                  {currentStep === onboardingSteps.length - 1 ? 'Start Exploring' : 'Continue'}
                </span>
                <ArrowRight className="w-4 h-4 ml-2 inline relative z-10" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboarding;