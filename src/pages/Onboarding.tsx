import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Check, Crown, Star, Heart, Users, Shield, Camera, Upload, X, Plus, MapPin, ArrowLeft } from "lucide-react";
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
import { useUserRole, type UserPlanType } from "@/hooks/useUserRole";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateUserPlan } = useUserRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    location.state?.selectedPlan || null
  );

  // Verification and location completion tracking
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [locationCompleted, setLocationCompleted] = useState(false);

  // If user comes from pricing with a plan selected, skip to verification
  useEffect(() => {
    if (location.state?.selectedPlan) {
      setCurrentStep(2); // Skip welcome and plan selection
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
    religionLevel: "",
    prayerFrequency: "",
    hijabStatus: "",
    maritalStatus: "",
    smokingStatus: "",
    hasChildren: false,
    childrenPreference: "",
    madhab: "",
    interests: [] as string[],
    photos: [] as string[],
    voiceNoteUrl: null as string | null
  });

  // Photo and voice upload states
  const [photoUploads, setPhotoUploads] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 likes per day",
        "Basic matching",
        "View profiles",
        "Voice notes & emojis",
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
        "Everything in Free",
        "Unlimited likes",
        "See who liked you",
        "Advanced filters",
        "Video messaging",
        "Priority support"
      ],
      popular: true
    },
    {
      id: "elite",
      name: "Elite",
      price: "$39.99",
      period: "per month",
      description: "Ultimate marriage experience",
      features: [
        "Everything in Premium",
        "Video messaging",
        "Video calls with matches",
        "Profile verification priority",
        "VIP support"
      ],
      popular: false
    }
  ];

  const interests = [
    "Travel", "Fitness", "Reading", "Cooking", "Music", "Art", 
    "Nature", "Gaming", "Coffee", "Education", "Photography", 
    "Sports", "Movies", "Technology", "Fashion", "Volunteering"
  ];

  const planFeatures = [
    { label: "5 likes per day", basic: true, premium: true, elite: true },
    { label: "Unlimited likes", basic: false, premium: true, elite: true },
    { label: "See who liked you", basic: false, premium: true, elite: true },
    { label: "Advanced filters", basic: false, premium: true, elite: true },
    { label: "Priority support", basic: false, premium: true, elite: true },
    { label: "Video calls", basic: false, premium: false, elite: true },
    { label: "Profile verification", basic: false, premium: false, elite: true },
    { label: "VIP support", basic: false, premium: false, elite: true },
  ];

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setRecording(false);
        }
      }, 60000);
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record a voice note.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const uploadVoiceNote = async () => {
    if (!audioBlob || !user) return;
    
    setUploadingVoice(true);
    try {
      const fileName = `voice-note-${Date.now()}.wav`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${fileName}`, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setProfileData(prev => ({ ...prev, voiceNoteUrl: publicUrl }));
      
      toast({
        title: "Voice Note Saved",
        description: "Your voice note has been uploaded successfully!",
      });
    } catch (error) {
      console.error('Voice upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload voice note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingVoice(false);
    }
  };

  // Photo upload functions
  const uploadPhoto = async (file: File, index: number) => {
    if (!user) return;

    setUploadingPhotoIndex(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `photo-${index}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      const newPhotoUploads = [...photoUploads];
      newPhotoUploads[index] = publicUrl;
      setPhotoUploads(newPhotoUploads);

      toast({
        title: "Photo Uploaded",
        description: "Your photo has been uploaded successfully!",
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhotoIndex(null);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotoUploads = [...photoUploads];
    newPhotoUploads[index] = null;
    setPhotoUploads(newPhotoUploads);
  };

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const onboardingSteps = [
    {
      title: "Welcome to LoveQuest",
      subtitle: "Find your perfect match in a respectful, premium environment",
      content: () => (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
              <Heart className="w-16 h-16 text-white relative z-10" />
            </div>
            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 text-xs font-bold shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Start Your Journey</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Join thousands of singles finding meaningful relationships. 
            Our platform prioritizes respect, privacy, and authentic connections.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Verified Profiles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">50k+ Members</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Premium Dating</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Plan",
      subtitle: "Select the plan that best fits your needs",
      content: () => (
        <div className="w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative cursor-pointer rounded-3xl border-2 p-6 shadow-xl transition-all duration-300 flex flex-col text-center select-none
                    ${isSelected ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 scale-105 ring-2 ring-primary/20' : 'border-border bg-gradient-to-br from-white to-emerald-50 hover:border-border hover:shadow-2xl'}
                  `}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary text-white px-4 py-1 text-xs font-bold shadow-lg">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex flex-col items-center mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg
                      ${plan.id === 'free' ? 'bg-muted' : plan.id === 'premium' ? 'bg-primary/15' : 'bg-amber-100'}`}
                    >
                      {plan.id === 'free' && <Users className="w-8 h-8 text-primary" />}
                      {plan.id === 'premium' && <Star className="w-8 h-8 text-amber-500" />}
                      {plan.id === 'elite' && <Crown className="w-8 h-8 text-amber-500" />}
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2">{plan.name}</h4>
                    <div className="text-3xl font-extrabold text-primary mb-2">
                      {plan.price}
                      <span className="text-sm text-muted-foreground font-normal ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-primary text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full rounded-xl py-2 px-4 text-sm font-semibold transition-all duration-200
                      ${isSelected ? 'bg-gradient-to-r from-primary to-primary text-white shadow-lg' : 'border-border text-primary hover:bg-primary/10'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.id); }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              );
            })}
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
        <div className="space-y-6 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData({...profileData, age: e.target.value})}
              placeholder="Enter your age"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={profileData.gender || ""} onValueChange={(value) => setProfileData({...profileData, gender: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={profileData.occupation}
              onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
              placeholder="What do you do for work?"
            />
          </div>
          <div>
            <Label htmlFor="education">Education Level</Label>
            <Select value={profileData.education} onValueChange={(value) => setProfileData({...profileData, education: value})}>
              <SelectTrigger>
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
      title: "Lifestyle & Values",
      subtitle: "Help us understand what matters to you",
      content: () => (
        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <Label htmlFor="relationshipGoal">Relationship Goal</Label>
            <Select value={profileData.religionLevel} onValueChange={(value) => setProfileData({...profileData, religionLevel: value})}>
              <SelectTrigger>
                <SelectValue placeholder="What are you looking for?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serious_relationship">Serious Relationship</SelectItem>
                <SelectItem value="marriage">Marriage</SelectItem>
                <SelectItem value="casual_dating">Casual Dating</SelectItem>
                <SelectItem value="friendship_first">Friendship First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lifestyle">Lifestyle</Label>
            <Select value={profileData.prayerFrequency} onValueChange={(value) => setProfileData({...profileData, prayerFrequency: value})}>
              <SelectTrigger>
                <SelectValue placeholder="How would you describe your lifestyle?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active_adventurous">Active & Adventurous</SelectItem>
                <SelectItem value="laid_back">Laid Back & Relaxed</SelectItem>
                <SelectItem value="career_focused">Career Focused</SelectItem>
                <SelectItem value="homebody">Homebody</SelectItem>
                <SelectItem value="social_butterfly">Social Butterfly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="values">Core Values</Label>
            <Select value={profileData.madhab} onValueChange={(value) => setProfileData({...profileData, madhab: value})}>
              <SelectTrigger>
                <SelectValue placeholder="What matters most to you?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Family & Relationships</SelectItem>
                <SelectItem value="career">Career & Ambition</SelectItem>
                <SelectItem value="spirituality">Spirituality & Growth</SelectItem>
                <SelectItem value="adventure">Adventure & Experiences</SelectItem>
                <SelectItem value="community">Community & Giving Back</SelectItem>
                <SelectItem value="creativity">Creativity & Expression</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="drinkingStatus">Drinking</Label>
            <Select value={profileData.hijabStatus} onValueChange={(value) => setProfileData({...profileData, hijabStatus: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Do you drink?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="socially">Socially</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
                <SelectItem value="regularly">Regularly</SelectItem>
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
        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Tell us about yourself, your interests, and what you're looking for..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {profileData.bio.length}/500 characters
            </div>
          </div>
          <div>
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={profileData.maritalStatus} onValueChange={(value) => setProfileData({...profileData, maritalStatus: value})}>
              <SelectTrigger>
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
            <Label htmlFor="childrenPreference">Children Preference</Label>
            <Select value={profileData.childrenPreference} onValueChange={(value) => setProfileData({...profileData, childrenPreference: value})}>
              <SelectTrigger>
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
            <Label htmlFor="smokingStatus">Smoking Status</Label>
            <Select value={profileData.smokingStatus} onValueChange={(value) => setProfileData({...profileData, smokingStatus: value})}>
              <SelectTrigger>
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
      title: "Your Interests",
      subtitle: "Select your interests to help us find better matches",
      content: () => (
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  profileData.interests.includes(interest)
                    ? 'border-emerald-500 bg-primary/10 text-primary'
                    : 'border-border bg-white text-gray-700 hover:border-border'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Selected: {profileData.interests.length} interests
          </p>
        </div>
      )
    },
    {
      title: "Add Your Photos",
      subtitle: "Upload photos to make your profile shine",
      content: () => (
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {photoUploads.map((photo, index) => (
              <div key={index} className="aspect-square">
                {photo ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={photo} 
                      alt={`Upload ${index + 1}`} 
                      className="w-full h-full object-cover rounded-2xl border-2 border-border"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-amber-500 text-white text-xs">Main</Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="w-full h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted hover:bg-primary/10">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(file, index);
                      }}
                      className="hidden"
                      disabled={uploadingPhotoIndex === index}
                    />
                    {uploadingPhotoIndex === index ? (
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mb-2">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium text-center">Upload Photo</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {photoUploads.filter(Boolean).length} of 6 photos uploaded
          </p>
        </div>
      )
    },
    {
      title: "Add a Voice Note",
      subtitle: "Let your personality shine through your voice",
      content: () => (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-border rounded-3xl p-6 mb-6">
            <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Voice Introduction</h3>
            <p className="text-sm text-primary mb-4">
              Record a short voice message to introduce yourself (up to 60 seconds)
            </p>
            
            <div className="space-y-4">
              {!recording && !audioUrl && (
                <Button onClick={startRecording} className="w-full bg-gradient-to-r from-primary to-primary text-white">
                  Start Recording
                </Button>
              )}
              
              {recording && (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <Button onClick={stopRecording} className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white">
                    Stop Recording
                  </Button>
                </div>
              )}
              
              {audioUrl && !recording && (
                <div className="space-y-3">
                  <audio controls src={audioUrl} className="w-full" />
                  <div className="flex gap-2">
                    <Button onClick={startRecording} variant="outline" className="flex-1">
                      Re-record
                    </Button>
                    <Button 
                      onClick={uploadVoiceNote} 
                      disabled={uploadingVoice} 
                      className="flex-1 bg-gradient-to-r from-primary to-primary text-white"
                    >
                      {uploadingVoice ? 'Saving...' : 'Save Voice Note'}
                    </Button>
                  </div>
                </div>
              )}
              
              {profileData.voiceNoteUrl && (
                <div className="space-y-2">
                  <Check className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-sm text-green-700">Voice note saved!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "All Set!",
      subtitle: "Your profile is ready! Start exploring and making connections.",
      content: () => (
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to LoveQuest!</h2>
          <p className="text-muted-foreground">
            Your profile has been created successfully. You can start browsing profiles while we review your verification documents.
          </p>
          
          <div className="bg-primary/10 border border-border rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-medium text-primary">
                  Verification Pending
                </p>
                <p className="text-xs text-primary">
                  Full access will be granted once your identity is verified (typically 24-48 hours).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-primary">Browse Profiles</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-primary">Start Matching</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    // Skip verification and location steps if already completed via their components
    if (currentStep === 2 && verificationCompleted) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (currentStep === 3 && locationCompleted) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validate current step data
    if (currentStep === 1 && !selectedPlan) {
      toast({
        title: "Plan Selection Required",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 4) {
      if (!profileData.firstName || !profileData.lastName || !profileData.age) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 5) {
      if (!profileData.religionLevel || !profileData.prayerFrequency) {
        toast({
          title: "Required Fields",
          description: "Please complete your lifestyle preferences.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 6) {
      if (profileData.bio.length < 20) {
        toast({
          title: "Bio Too Short",
          description: "Please write at least 20 characters in your bio.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 7) {
      if (profileData.interests.length < 3) {
        toast({
          title: "Select More Interests",
          description: "Please select at least 3 interests.",
          variant: "destructive",
        });
        return;
      }
    }

    // If this is the last step, save profile and complete onboarding
    if (currentStep === onboardingSteps.length - 1) {
      await saveProfile();
      await savePlanSelection();
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
      // Calculate age from date of birth if provided
      let calculatedAge = profileData.age ? parseInt(profileData.age) : null;
      let dateOfBirth = null;
      
      if (profileData.age) {
        // Create a date of birth based on age (approximate)
        const today = new Date();
        const birthYear = today.getFullYear() - parseInt(profileData.age);
        dateOfBirth = `${birthYear}-01-01`;
      }

      // Update profile data with required fields for matching
      const updates: any = {
        user_id: user.id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        display_name: `${profileData.firstName} ${profileData.lastName}`,
        age: calculatedAge,
        gender: profileData.gender,
        date_of_birth: dateOfBirth,
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
        interests: profileData.interests,
        last_active: new Date().toISOString(),
        can_access_app: true, // Allow app access once profile is complete
        verification_required: false, // Basic verification completed through profile setup
        updated_at: new Date().toISOString()
      };

      // Only update avatar if we have photos
      if (photoUploads.filter(photo => photo !== null).length > 0) {
        updates.avatar_url = photoUploads.find(photo => photo !== null);
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

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

  const savePlanSelection = async () => {
    if (!selectedPlan) return;

    try {
      await updateUserPlan(selectedPlan as UserPlanType);
      toast({
        title: "Plan Activated",
        description: `Your ${selectedPlan} plan has been activated!`,
      });
    } catch (error) {
      console.error('Plan save error:', error);
      toast({
        title: "Plan Activation Failed",
        description: "Failed to activate your selected plan. You can change it later in settings.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return selectedPlan !== null;
      case 2:
        return verificationCompleted;
      case 3:
        return true; // Location can be skipped
      case 4:
        return profileData.firstName && profileData.lastName && profileData.age && profileData.gender;
      case 5:
        return profileData.religionLevel && profileData.prayerFrequency;
      case 6:
        return profileData.bio.length >= 20; // Reduced from 50 to 20 for easier completion
      case 7:
        return profileData.interests.length >= 3;
      case 8:
        return photoUploads.filter(photo => photo !== null).length >= 1; // Require at least 1 photo
      case 9:
        return true; // Voice note is optional
      default:
        return true;
    }
  };

  const shouldShowStep = (index: number) => {
    // If coming from pricing, skip welcome and plan selection
    if (location.state?.selectedPlan && (index === 0 || index === 1)) {
      return false;
    }
    return true;
  };

  const getAdjustedStepIndex = () => {
    if (location.state?.selectedPlan) {
      return currentStep - 2; // Adjust for skipped steps
    }
    return currentStep;
  };

  const visibleSteps = onboardingSteps.filter((_, index) => shouldShowStep(index));
  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || (currentStep === 2 && location.state?.selectedPlan)}
              className={`p-2 rounded-full transition-colors ${
                currentStep === 0 || (currentStep === 2 && location.state?.selectedPlan)
                  ? 'text-gray-300' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-2">
              {visibleSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= getAdjustedStepIndex() ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-right">
              <span className="text-sm font-medium text-muted-foreground">
                {getAdjustedStepIndex() + 1}/{visibleSteps.length}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-primary to-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((getAdjustedStepIndex() + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-muted-foreground">{currentStepData.subtitle}</p>
          </div>

          <div className="mb-8">
            {currentStepData.content()}
          </div>

          {/* Continue button (hidden for verification and location steps as they handle their own navigation) */}
          {currentStep !== 2 && currentStep !== 3 && (
            <div className="text-center">
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-primary to-primary text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                <span className="relative z-10">
                  {currentStep === onboardingSteps.length - 1 ? 'Start Exploring' : 'Continue'}
                </span>
                <ArrowRight className="w-4 h-4 ml-2 inline relative z-10" />
              </button>
            </div>
          )}

          {/* Selected plan indicator */}
          {selectedPlan && (
            <div className="text-center mt-4">
              <Badge className="bg-primary/15 text-primary px-3 py-1 text-xs font-medium">
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