import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Check, Crown, Star, Zap, Heart, MessageCircle, Video, Users, Shield, Globe, Camera, Upload, X, Plus, BookOpen, GraduationCap, MapPin, Briefcase, Coffee, Music, Book, Plane, Dumbbell, Palette, ChefHat, TreePine, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    location.state?.selectedPlan || null
  );

  // If user comes from pricing with a plan selected, skip to step 2 (basic info)
  useEffect(() => {
    if (location.state?.selectedPlan) {
      setCurrentStep(2);
    }
  }, [location.state]);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    education: "",
    bio: "",
    interests: [] as string[],
    islamicPractices: {
      prayerFrequency: "",
      hijabChoice: "",
      beard: "",
      fasting: "",
      halalDiet: "",
      sect: ""
    },
    photos: [] as string[],
    preferences: {
      ageRange: [18, 35],
      maxDistance: 50,
      education: "",
      occupation: ""
    },
    voiceNoteUrl: null as string | null
  });

  const { user } = useAuth();
  const [photoUploads, setPhotoUploads] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);

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
      limitations: [
        "No messaging without match",
        "Limited daily likes",
        "No premium features"
      ],
      color: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
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
        "Priority support",
        "Message anyone (with paid message)",
        "Read receipts",
        "Profile boost"
      ],
      limitations: [
        "No video calls",
        "Limited paid messages"
      ],
      color: "border-emerald-200",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
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
        "Unlimited paid messages",
        "Video calls",
        "Profile verification",
        "Advanced analytics",
        "VIP support",
        "Concierge matching"
      ],
      limitations: [],
      color: "border-amber-200",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      popular: false
    }
  ];

  const interests = [
    { id: "travel", name: "Travel", icon: Plane, category: "lifestyle" },
    { id: "fitness", name: "Fitness", icon: Dumbbell, category: "lifestyle" },
    { id: "reading", name: "Reading", icon: Book, category: "intellectual" },
    { id: "cooking", name: "Cooking", icon: ChefHat, category: "lifestyle" },
    { id: "music", name: "Music", icon: Music, category: "arts" },
    { id: "art", name: "Art", icon: Palette, category: "arts" },
    { id: "nature", name: "Nature", icon: TreePine, category: "lifestyle" },
    { id: "gaming", name: "Gaming", icon: Gamepad2, category: "entertainment" },
    { id: "coffee", name: "Coffee", icon: Coffee, category: "lifestyle" },
    { id: "education", name: "Education", icon: BookOpen, category: "intellectual" }
  ];

  const planFeatures = [
    { label: "5 likes per day", basic: true, premium: true, elite: true },
    { label: "Unlimited likes", basic: false, premium: true, elite: true },
    { label: "See who liked you", basic: false, premium: true, elite: true },
    { label: "Advanced filters", basic: false, premium: true, elite: true },
    { label: "Priority support", basic: false, premium: true, elite: true },
    { label: "Paid messages", basic: false, premium: true, elite: true },
    { label: "Read receipts", basic: false, premium: true, elite: true },
    { label: "Profile boost", basic: false, premium: true, elite: true },
    { label: "Video calls", basic: false, premium: false, elite: true },
    { label: "Profile verification", basic: false, premium: false, elite: true },
    { label: "Advanced analytics", basic: false, premium: false, elite: true },
    { label: "VIP support", basic: false, premium: false, elite: true },
    { label: "Concierge matching", basic: false, premium: false, elite: true },
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
      title: "Compare Plans",
      subtitle: "See what each plan offers before you choose",
      content: () => {
        // For scrolling to the grid
        const gridRef = typeof window !== 'undefined' ? document.getElementById('plan-comparison-grid') : null;
        const handleViewComparison = () => {
          if (gridRef) {
            gridRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        };
        // Plan highlights for each plan
        const planHighlights = {
          basic: [
            "5 likes per day",
            "Basic matching",
            "View profiles",
            "Standard support"
          ],
          premium: [
            "Unlimited likes",
            "See who liked you",
            "Advanced filters",
            "Priority support"
          ],
          elite: [
            "Everything in Premium",
            "Unlimited paid messages",
            "Video calls",
            "VIP support"
          ]
        };
        return (
          <div className="w-full max-w-lg mx-auto">
            {/* Plan selection cards - now above the grid */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const highlights = planHighlights[plan.id] || [];
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative cursor-pointer rounded-3xl border-2 p-6 shadow-xl transition-all duration-300 flex flex-col items-center text-center select-none
                      ${isSelected ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 scale-105 ring-2 ring-emerald-200' : 'border-gray-200 bg-gradient-to-br from-white to-emerald-50 hover:border-emerald-200 hover:shadow-2xl'}
                      before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-emerald-100/30 before:to-amber-100/10 before:opacity-70 before:pointer-events-none
                    `}
                    style={{ minHeight: 340 }}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold shadow-lg">
                        Most Popular
                      </Badge>
                    )}
                    <div className="flex flex-col items-center mb-4 z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg
                        ${plan.id === 'basic' ? 'bg-gray-100' : plan.id === 'premium' ? 'bg-emerald-100' : 'bg-amber-100'}`}
                      >
                        {plan.id === 'basic' && <Users className="w-8 h-8 text-emerald-600" />}
                        {plan.id === 'premium' && <Star className="w-8 h-8 text-amber-500" />}
                        {plan.id === 'elite' && <Crown className="w-8 h-8 text-amber-500" />}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1 tracking-tight drop-shadow-sm">{plan.name}</h4>
                      <div className="text-2xl font-extrabold text-emerald-700 mb-1">
                        {plan.price}
                        <span className="text-sm text-gray-500 font-normal ml-1">{plan.period}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 font-medium">{plan.description}</p>
                    </div>
                    {/* Plan highlights */}
                    <div className="w-full mb-3">
                      <ul className="space-y-2">
                        {highlights.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-emerald-700 text-xs md:text-sm font-medium bg-emerald-50/60 rounded-xl px-3 py-1">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full rounded-xl py-2 px-4 text-sm font-semibold transition-all duration-200 mb-2
                        ${isSelected ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.id); }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full rounded-xl py-2 px-4 text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all duration-200"
                      onClick={(e) => { e.stopPropagation(); document.getElementById('plan-comparison-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    >
                      View Comparison
                    </Button>
                  </div>
                );
              })}
            </div>
            {/* Plan comparison grid - now below the cards */}
            <div id="plan-comparison-grid" className="mb-8 overflow-x-auto rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100">
              <table className="min-w-full text-sm md:text-base">
                <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-50 to-emerald-100">
                  <tr>
                    <th className="py-4 px-2 text-left font-bold text-gray-800 border-b border-emerald-100">Feature</th>
                    <th className="py-4 px-2 text-center font-bold text-emerald-700 border-b border-emerald-100">
                      <div className="flex flex-col items-center">
                        <Users className="w-5 h-5 mb-1" />
                        Basic
                      </div>
                    </th>
                    <th className="py-4 px-2 text-center font-bold text-emerald-700 border-b border-emerald-100">
                      <div className="flex flex-col items-center">
                        <Star className="w-5 h-5 mb-1 text-amber-500" />
                        Premium
                      </div>
                    </th>
                    <th className="py-4 px-2 text-center font-bold text-amber-700 border-b border-emerald-100">
                      <div className="flex flex-col items-center">
                        <Crown className="w-5 h-5 mb-1 text-amber-500" />
                        Elite
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.map((feature, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-emerald-50/40' : 'bg-white/80'}>
                      <td className="py-3 px-2 text-gray-700 font-medium whitespace-nowrap border-b border-emerald-100">{feature.label}</td>
                      <td className="py-3 px-2 text-center border-b border-emerald-100">
                        {feature.basic ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-2 text-center border-b border-emerald-100">
                        {feature.premium ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-2 text-center border-b border-emerald-100">
                        {feature.elite ? (
                          <Check className="w-5 h-5 text-amber-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Only one Continue button below */}
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                onClick={handleNext}
                disabled={!selectedPlan}
                className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Continue
              </Button>
            </div>
          </div>
        );
      }
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
              <Input
                id="age"
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                placeholder="Your age"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
              <Select onValueChange={(value) => setProfileData({...profileData, gender: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              placeholder="City, Country"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">Occupation</Label>
            <Input
              id="occupation"
              value={profileData.occupation}
              onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
              placeholder="Your job title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="education" className="text-sm font-medium text-gray-700">Education</Label>
            <Select onValueChange={(value) => setProfileData({...profileData, education: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "About You",
      subtitle: "Share what makes you unique",
      content: () => (
        <div className="space-y-6">
          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Tell us about yourself, your values, and what you're looking for..."
              className="mt-1 h-32 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
            {profileData.bio.length > 0 && profileData.bio.length < 20 && (
              <p className="text-xs text-red-500 mt-1">Please write at least 20 characters.</p>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Islamic Practices</h4>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Prayer Frequency</Label>
              <Select onValueChange={(value) => setProfileData({
                ...profileData, 
                islamicPractices: {...profileData.islamicPractices, prayerFrequency: value}
              })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="How often do you pray?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="five-times">Five times daily</SelectItem>
                  <SelectItem value="regularly">Regularly</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Gender-specific options */}
            {profileData.gender === 'female' && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Hijab</Label>
                <Select onValueChange={(value) => setProfileData({
                  ...profileData, 
                  islamicPractices: {...profileData.islamicPractices, hijabChoice: value}
                })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your hijab preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always wear hijab</SelectItem>
                    <SelectItem value="sometimes">Sometimes wear hijab</SelectItem>
                    <SelectItem value="planning">Planning to wear hijab</SelectItem>
                    <SelectItem value="no-hijab">Don't wear hijab</SelectItem>
                    <SelectItem value="not-applicable">Not applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {profileData.gender === 'male' && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Beard</Label>
                <Select onValueChange={(value) => setProfileData({
                  ...profileData, 
                  islamicPractices: {...profileData.islamicPractices, beard: value}
                })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Do you keep a beard?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-700">Fasting (Ramadan)</Label>
              <Select onValueChange={(value) => setProfileData({
                ...profileData, 
                islamicPractices: {...profileData.islamicPractices, fasting: value}
              })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Do you fast in Ramadan?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="most">Most years</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Halal Diet</Label>
              <Select onValueChange={(value) => setProfileData({
                ...profileData, 
                islamicPractices: {...profileData.islamicPractices, halalDiet: value}
              })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Do you follow a halal diet?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strictly halal</SelectItem>
                  <SelectItem value="mostly">Mostly halal</SelectItem>
                  <SelectItem value="sometimes">Sometimes halal</SelectItem>
                  <SelectItem value="not-halal">Not halal</SelectItem>
                  <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Sect</Label>
              <Select onValueChange={(value) => setProfileData({
                ...profileData, 
                islamicPractices: {...profileData.islamicPractices, sect: value}
              })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your sect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunni">Sunni</SelectItem>
                  <SelectItem value="shia">Shia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Interests",
      subtitle: "Select what you're passionate about",
      content: () => (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What are you interested in?</h3>
            <p className="text-gray-600 text-sm">Choose at least 3 interests to help us find your perfect match</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {interests.map((interest) => {
              const Icon = interest.icon;
              const isSelected = profileData.interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => {
                    const updatedInterests = isSelected
                      ? profileData.interests.filter(id => id !== interest.id)
                      : [...profileData.interests, interest.id];
                    setProfileData({...profileData, interests: updatedInterests});
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{interest.name}</span>
                </button>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Selected: {profileData.interests.length} interests
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Add Photos",
      subtitle: "Show your best self with great photos and a voice note",
      content: () => (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Photos</h3>
            <p className="text-gray-600 text-sm">Add at least 2 photos to create a compelling profile</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {photoUploads.map((url, index) => (
              <div key={index} className="relative aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group">
                {index === 0 && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 py-1 shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Main Photo
                  </Badge>
                )}
                {url ? (
                  <>
                    <img src={url} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                    <button onClick={() => handleRemovePhoto(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                    {url && (
                      <div className="break-all text-xs text-gray-400 mt-1">{url}</div>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => e.target.files && handlePhotoUpload(e.target.files[0], index)}
                      disabled={uploadingPhotoIndex === index}
                    />
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors duration-200">
                        {uploadingPhotoIndex === index ? (
                          <span className="loader w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500 font-medium text-center">Upload Photo</span>
                      <span className="text-xs text-gray-400 text-center mt-1">JPG, PNG up to 10MB</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-gray-500">{photoUploads.filter(Boolean).length} of 6 photos uploaded</div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-3xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900 text-sm mb-2">Photo Guidelines</h4>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-emerald-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>Clear, well-lit photos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>Show your genuine smile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>Include variety (close-up, full body)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>Avoid group photos as main</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white/60 rounded-xl">
                  <p className="text-xs text-emerald-800 font-medium">
                    💡 Tip: Profiles with photos get 10x more matches!
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Voice Note Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-3xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900 text-sm mb-2">Add a Voice Note</h4>
                <p className="text-xs text-emerald-700 mb-2">Let others hear your personality! Record a short voice note (up to 60 seconds).</p>
                <div className="flex flex-col gap-2">
                  {!recording && !audioUrl && (
                    <Button onClick={startRecording} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">Record Voice Note</Button>
                  )}
                  {recording && (
                    <Button onClick={stopRecording} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white">Stop Recording</Button>
                  )}
                  {audioUrl && !recording && (
                    <div className="flex flex-col gap-2 items-center">
                      <audio controls src={audioUrl} className="w-full" />
                      <div className="flex gap-2 w-full">
                        <Button onClick={startRecording} variant="outline" className="flex-1">Re-record</Button>
                        <Button onClick={uploadVoiceNote} disabled={uploadingVoice} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                          {uploadingVoice ? 'Uploading...' : 'Save Voice Note'}
                        </Button>
                      </div>
                    </div>
                  )}
                  {voiceNoteUrl && !recording && (
                    <div className="flex flex-col gap-2 items-center mt-2">
                      <audio controls src={voiceNoteUrl} className="w-full" />
                      <span className="text-xs text-emerald-700">Voice note saved!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Almost Done!",
      subtitle: "Review and complete your profile",
      content: () => (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Complete!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your profile is ready to go. Start connecting with amazing people who share your values.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Profile Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{profileData.firstName} {profileData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{profileData.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{profileData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interests:</span>
                <span className="font-medium">{profileData.interests.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium capitalize">{selectedPlan}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !selectedPlan) {
      return; // Don't proceed without selecting a plan
    }
    
    if (currentStep === 2) {
      // Validate basic info
      if (!profileData.firstName || !profileData.lastName || !profileData.age || !profileData.location || !profileData.gender) {
        return;
      }
    }
    
    if (currentStep === 3) {
      // Validate bio length
      if (profileData.bio.length < 20) {
        return;
      }
    }
    
    if (currentStep === 4) {
      // Validate interests (at least 3)
      if (profileData.interests.length < 3) {
        return;
      }
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and save data
      console.log('Profile Data:', profileData);
      console.log('Selected Plan:', selectedPlan);
      navigate("/home");
    }
  };

  const handleBack = () => {
    // If we came from pricing and are at step 2, go back to pricing
    if (currentStep === 2 && location.state?.selectedPlan) {
      navigate("/pricing");
      return;
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedPlan !== null;
      case 2:
        return profileData.firstName && profileData.lastName && profileData.age && profileData.location && profileData.gender;
      case 3:
        return profileData.bio.length >= 20;
      case 4:
        return profileData.interests.length >= 3;
      default:
        return true;
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  // Skip the plan selection step if coming from pricing
  const shouldShowStep = (stepIndex: number) => {
    if (location.state?.selectedPlan && stepIndex === 1) {
      return false;
    }
    return true;
  };

  // Helper: Upload photo to Supabase Storage
  async function handlePhotoUpload(file: File, index: number) {
    if (!user) return;
    setUploadingPhotoIndex(index);
    const fileExt = file.name.split('.').pop();
    const filePath = `profile-photos/${user.id}/${Date.now()}-${index}.${fileExt}`;
    const { data, error } = await supabase.storage.from('lovable-uploads').upload(filePath, file, { upsert: true });
    if (error) {
      setUploadingPhotoIndex(null);
      console.error('Photo upload failed:', error.message, error);
      alert('Photo upload failed: ' + error.message);
      return;
    }
    const url = supabase.storage.from('lovable-uploads').getPublicUrl(filePath).data.publicUrl;
    console.log('Photo uploaded. URL:', url);
    setPhotoUploads(prev => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
    setProfileData(prev => ({ ...prev, photos: [...photoUploads.slice(0, index), url, ...photoUploads.slice(index + 1)] }));
    setUploadingPhotoIndex(null);
  }

  // Helper: Remove photo
  function handleRemovePhoto(index: number) {
    setPhotoUploads(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setProfileData(prev => ({ ...prev, photos: photoUploads.map((url, i) => (i === index ? null : url)).filter(Boolean) as string[] }));
  }

  // Voice note recording logic
  async function startRecording() {
    if (!navigator.mediaDevices) return alert('Audio recording not supported.');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    setMediaRecorder(recorder);
    setRecording(true);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    recorder.start();
  }
  function stopRecording() {
    mediaRecorder?.stop();
    setRecording(false);
  }
  async function uploadVoiceNote() {
    if (!audioBlob || !user) return;
    setUploadingVoice(true);
    const filePath = `profile-voice-notes/${user.id}/${Date.now()}.webm`;
    const { data, error } = await supabase.storage.from('lovable-uploads').upload(filePath, audioBlob, { upsert: true });
    if (error) {
      setUploadingVoice(false);
      alert('Voice note upload failed.');
      return;
    }
    const url = supabase.storage.from('lovable-uploads').getPublicUrl(filePath).data.publicUrl;
    setVoiceNoteUrl(url);
    setProfileData(prev => ({ ...prev, voiceNoteUrl: url }));
    setUploadingVoice(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || (currentStep === 2 && location.state?.selectedPlan)}
              className={`p-2 rounded-full transition-colors ${
                currentStep === 0 || (currentStep === 2 && location.state?.selectedPlan)
                  ? 'text-gray-300' 
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => {
                if (!shouldShowStep(index)) return null;
                return (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                );
              })}
            </div>
            
            <div className="w-9 flex justify-center">
              <span className="text-sm font-medium text-gray-500">
                {currentStep + 1}/{onboardingSteps.filter((_, index) => shouldShowStep(index)).length}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / onboardingSteps.filter((_, index) => shouldShowStep(index)).length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600">{currentStepData.subtitle}</p>
        </div>

        <div className="mb-8">
          {currentStepData.content()}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${
              !canProceed()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {/* Button shine effect */}
            {canProceed() && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            )}
            <span className="relative z-10">
              {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
            </span>
          </button>
          
          {currentStep === 1 && (
            <p className="text-xs text-gray-500 text-center">
              You can change your plan anytime in your account settings
            </p>
          )}
          
          {currentStep === 4 && profileData.interests.length < 3 && (
            <p className="text-xs text-red-500 text-center">
              Please select at least 3 interests to continue
            </p>
          )}

          {/* Selected plan indicator */}
          {selectedPlan && (
            <div className="text-center">
              <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                <Crown className="w-3 h-3 mr-1" />
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan Selected
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;