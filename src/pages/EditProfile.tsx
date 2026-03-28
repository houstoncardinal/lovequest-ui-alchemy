import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Plus, X, Save, Loader2, User, Church, Heart, MapPin, Briefcase, GraduationCap, Upload, Mic, Play, Pause, Star } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import profile1 from "@/assets/profile-1.jpg";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    displayName: "",
    age: "",
    bio: "",
    location: "",
    avatarUrl: "",

    // Professional Info
    careerField: "",
    educationLevel: "",
    incomeRange: "",

    // Islamic Practice
    religionLevel: "",
    prayerFrequency: "",
    hijabStatus: "",
    madhab: "",
    islamicKnowledgeLevel: "",
    communityInvolvementLevel: "",

    // Personal Details
    maritalStatus: "",
    smokingStatus: "",
    hasChildren: false,
    childrenPreference: "",
    bodyType: "",
    heightCm: "",
    exerciseFrequency: "",

    // Family & Marriage
    marriageTimeline: "",
    financialReadiness: "",
    familySizePreference: "",

    // Interests & Lifestyle
    hobbiesInterests: [] as string[],
    languagesSpoken: [] as string[],
    dietaryPreferences: [] as string[],
    personalityTraits: [] as string[],
    relationshipGoals: [] as string[],

    // Voice Note
    voiceNoteUrl: "",

    // Lifestyle Preferences
    petsPreference: "",
    workoutPreference: "",
    dietPreference: "",
    socialPreference: "",

    // Zodiac & Values
    zodiacSign: "",
    drinkingStatus: "",
    coreValues: [] as string[]
  });

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
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          displayName: data.display_name || "",
          age: data.age?.toString() || "",
          bio: data.bio || "",
          location: data.location || "",
          avatarUrl: data.avatar_url || "",

          careerField: data.career_field || "",
          educationLevel: data.education_level || "",
          incomeRange: data.income_range || "",

          religionLevel: data.religion_level || "",
          prayerFrequency: data.prayer_frequency || "",
          hijabStatus: data.hijab_status || "",
          madhab: data.madhab || "",
          islamicKnowledgeLevel: data.islamic_knowledge_level || "",
          communityInvolvementLevel: data.community_involvement_level || "",

          maritalStatus: data.marital_status || "",
          smokingStatus: data.smoking_status || "",
          hasChildren: data.has_children || false,
          childrenPreference: data.children_preference || "",
          bodyType: data.body_type || "",
          heightCm: data.height_cm?.toString() || "",
          exerciseFrequency: data.exercise_frequency || "",

          marriageTimeline: data.marriage_timeline || "",
          financialReadiness: data.financial_readiness || "",
          familySizePreference: data.family_size_preference || "",

          hobbiesInterests: data.hobbies_interests || [],
          languagesSpoken: data.languages_spoken || [],
          dietaryPreferences: data.dietary_preferences || [],
          personalityTraits: data.personality_traits || [],
          relationshipGoals: data.relationship_goals || [],

          voiceNoteUrl: data.avatar_url || "", // Using avatar_url for now, will add voice_note_url to schema later

          // Lifestyle Preferences
          petsPreference: "", // Will be added to schema later
          workoutPreference: "", // Will be added to schema later
          dietPreference: "", // Will be added to schema later
          socialPreference: "", // Will be added to schema later

          // Zodiac & Values
          zodiacSign: "", // Will be added to schema later
          drinkingStatus: "", // Will be added to schema later
          coreValues: [] // Will be added to schema later
        });
        
        // Check if there's a voice note in the avatar_url (temporary solution)
        if (data.avatar_url && data.avatar_url.includes('voice-note')) {
          setAudioUrl(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, item: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const startVoiceRecording = async () => {
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
      setRecordingVoice(true);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setRecordingVoice(false);
        }
      }, 60000);
    } catch (error) {
      toast({
        title: "Microphone access required",
        description: "Please allow microphone access to record a voice note.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && recordingVoice) {
      mediaRecorder.stop();
      setRecordingVoice(false);
    }
  };

  const uploadVoiceNote = async () => {
    if (!audioBlob || !user) return;
    
    try {
      const fileName = `voice-note-${Date.now()}.wav`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${fileName}`, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, voiceNoteUrl: publicUrl }));
      setAudioUrl(publicUrl);
      
      toast({
        title: "Voice note saved",
        description: "Your voice note has been uploaded.",
      });
    } catch (error) {
      console.error('Voice upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload voice note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        display_name: formData.displayName || `${formData.firstName} ${formData.lastName}`,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio,
        location: formData.location,
        avatar_url: formData.avatarUrl,
        
        career_field: formData.careerField,
        education_level: formData.educationLevel,
        income_range: formData.incomeRange,
        
        religion_level: formData.religionLevel,
        prayer_frequency: formData.prayerFrequency,
        hijab_status: formData.hijabStatus,
        madhab: formData.madhab,
        islamic_knowledge_level: formData.islamicKnowledgeLevel,
        community_involvement_level: formData.communityInvolvementLevel,
        
        marital_status: formData.maritalStatus,
        smoking_status: formData.smokingStatus,
        has_children: formData.hasChildren,
        children_preference: formData.childrenPreference,
        body_type: formData.bodyType,
        height_cm: formData.heightCm ? parseInt(formData.heightCm) : null,
        exercise_frequency: formData.exerciseFrequency,
        
        marriage_timeline: formData.marriageTimeline,
        financial_readiness: formData.financialReadiness,
        family_size_preference: formData.familySizePreference,
        
        hobbies_interests: formData.hobbiesInterests,
        languages_spoken: formData.languagesSpoken,
        dietary_preferences: formData.dietaryPreferences,
        personality_traits: formData.personalityTraits,
        relationship_goals: formData.relationshipGoals,
        
        // voice_note_url: formData.voiceNoteUrl, // Will be added to schema later
        
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      navigate("/account");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Static data arrays
  const interests = [
    "Travel", "Fitness", "Reading", "Cooking", "Music", "Art", 
    "Nature", "Gaming", "Coffee", "Education", "Photography", 
    "Sports", "Movies", "Technology", "Fashion", "Volunteering",
    "Personal Development", "Charity Work", "Family Time", "Writing"
  ];

  const languages = [
    "English", "Arabic", "Urdu", "French", "Spanish", "Turkish",
    "Indonesian", "Malay", "Persian", "Bengali", "Hindi", "German"
  ];

  const personalityTraits = [
    "Compassionate", "Ambitious", "Funny", "Intellectual", "Active",
    "Calm", "Outgoing", "Creative", "Spiritual", "Patient", "Honest", "Caring"
  ];

  const dietaryPrefs = [
    "No Restrictions", "Vegetarian", "Vegan", "Organic", "Pescatarian"
  ];

  const relationshipGoals = [
    "Marriage", "Long-term Relationship", "Finding Life Partner", "Building Family"
  ];

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        {/* Enhanced Desktop Header */}
        <div className="bg-white/98 backdrop-blur-xl border-b border-primary/10/60 shadow-lg">
          <div className="max-w-screen-2xl mx-auto px-8 py-6">
            {/* Primary Row - Title and Main Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate("/account")}
                  className="p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  title="Back to Account"
                >
                  <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-4">
                  <User className="w-10 h-10 text-primary" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-primary/80 bg-clip-text text-transparent">
                      Edit Profile
                    </h1>
                    <p className="text-sm text-primary font-medium">Complete your profile for better matches</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Progress Indicator */}
                <div className="text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-xl border border-primary/10">
                  <span className="font-semibold text-primary">85%</span> complete
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="px-4 py-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary/50 to-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Row - Section Navigation */}
            <div className="bg-white/80 rounded-2xl border border-primary/20/50 p-4">
              <div className="flex items-center gap-8">
                <h2 className="text-lg font-semibold text-gray-900">Profile Sections</h2>
                <div className="flex items-center gap-4 text-sm">
                  <button className="px-3 py-2 bg-primary/10 text-primary rounded-lg font-medium">Basic Info</button>
                  <button className="px-3 py-2 text-gray-600 hover:bg-primary/5 rounded-lg transition-colors">Professional</button>
                  <button className="px-3 py-2 text-gray-600 hover:bg-primary/5 rounded-lg transition-colors">Personal Values</button>
                  <button className="px-3 py-2 text-gray-600 hover:bg-primary/5 rounded-lg transition-colors">Interests</button>
                  <button className="px-3 py-2 text-gray-600 hover:bg-primary/5 rounded-lg transition-colors">Lifestyle</button>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  {/* Tips */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Tip: Upload photos for 2x more matches!</span>
                  </div>

                  {/* Quick Help */}
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Help">
                    ❓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="max-w-screen-xl mx-auto px-8 py-8">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-primary/5 via-white to-teal-50 rounded-3xl p-8 mb-8 border border-primary/10/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                <p className="text-primary">Fill out more sections to improve your match recommendations</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">85%</div>
                <div className="text-sm text-gray-600">Profile Complete</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-2xl border border-primary/20 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Photos</div>
                <div className="text-xs text-primary">+15% matches</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="text-center p-4 bg-white rounded-2xl border border-primary/20 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Church className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Values</div>
                <div className="text-xs text-primary">+10% matches</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="text-center p-4 bg-white rounded-2xl border border-primary/20 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Interests</div>
                <div className="text-xs text-primary">+20% matches</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="text-center p-4 bg-white rounded-2xl border border-primary/20 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Voice</div>
                <div className="text-xs text-primary">+25% matches</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-200 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => navigate("/account")}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
        {/* Profile Photo */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Profile Photo</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={formData.avatarUrl || profile1} 
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
              />
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAvatar(file);
                  }}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                ) : (
                  <Camera className="w-3 h-3 text-white" />
                )}
              </label>
            </div>
            <div>
              <p className="text-sm text-gray-600">Update your profile photo</p>
              <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="How others will see your name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Your age"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                value={formData.heightCm}
                onChange={handleInputChange}
                placeholder="e.g., 175"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us about yourself, your interests, and what you're looking for..."
              className="resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Professional</h3>
          </div>
          
          <div>
            <Label htmlFor="careerField">Career Field</Label>
            <Select value={formData.careerField} onValueChange={(value) => handleSelectChange('careerField', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your career field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="arts">Arts & Creative</SelectItem>
                <SelectItem value="personal_development">Personal Development</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="educationLevel">Education Level</Label>
            <Select value={formData.educationLevel} onValueChange={(value) => handleSelectChange('educationLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="some_college">Some College</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate</SelectItem>
                <SelectItem value="trade_school">Trade School</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="incomeRange">Income Range (Optional)</Label>
            <Select value={formData.incomeRange} onValueChange={(value) => handleSelectChange('incomeRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                <SelectItem value="under_30k">Under $30,000</SelectItem>
                <SelectItem value="30k_50k">$30,000 - $50,000</SelectItem>
                <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
                <SelectItem value="over_150k">Over $150,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Personal Values */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Church className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Personal Values</h3>
          </div>
          
          <div>
            <Label htmlFor="religionLevel">Religious Level</Label>
            <Select value={formData.religionLevel} onValueChange={(value) => handleSelectChange('religionLevel', value)}>
              <SelectTrigger>
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
            <Label htmlFor="prayerFrequency">Prayer Frequency</Label>
            <Select value={formData.prayerFrequency} onValueChange={(value) => handleSelectChange('prayerFrequency', value)}>
              <SelectTrigger>
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
            <Label htmlFor="madhab">Madhab (School of Thought)</Label>
            <Select value={formData.madhab} onValueChange={(value) => handleSelectChange('madhab', value)}>
              <SelectTrigger>
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
            <Label htmlFor="hijabStatus">Hijab Status (if applicable)</Label>
            <Select value={formData.hijabStatus} onValueChange={(value) => handleSelectChange('hijabStatus', value)}>
              <SelectTrigger>
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

          <div>
            <Label htmlFor="islamicKnowledgeLevel">Personal Values Level</Label>
            <Select value={formData.islamicKnowledgeLevel} onValueChange={(value) => handleSelectChange('islamicKnowledgeLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your personal values level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="scholar">Scholar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Personal Details */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Personal Details</h3>
          </div>
          
          <div>
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={formData.maritalStatus} onValueChange={(value) => handleSelectChange('maritalStatus', value)}>
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
            <Select value={formData.childrenPreference} onValueChange={(value) => handleSelectChange('childrenPreference', value)}>
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
            <Select value={formData.smokingStatus} onValueChange={(value) => handleSelectChange('smokingStatus', value)}>
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

          <div>
            <Label htmlFor="bodyType">Body Type</Label>
            <Select value={formData.bodyType} onValueChange={(value) => handleSelectChange('bodyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">Slim</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="curvy">Curvy</SelectItem>
                <SelectItem value="full_figured">Full Figured</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
            <Select value={formData.exerciseFrequency} onValueChange={(value) => handleSelectChange('exerciseFrequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="How often do you exercise?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="few_times_week">Few times a week</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
                <SelectItem value="rarely">Rarely</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Marriage & Family */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Marriage & Family</h3>
          </div>
          
          <div>
            <Label htmlFor="marriageTimeline">Marriage Timeline</Label>
            <Select value={formData.marriageTimeline} onValueChange={(value) => handleSelectChange('marriageTimeline', value)}>
              <SelectTrigger>
                <SelectValue placeholder="When are you looking to get married?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="within_year">Within a year</SelectItem>
                <SelectItem value="1_2_years">1-2 years</SelectItem>
                <SelectItem value="2_5_years">2-5 years</SelectItem>
                <SelectItem value="no_rush">No rush</SelectItem>
                <SelectItem value="just_exploring">Just exploring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="familySizePreference">Family Size Preference</Label>
            <Select value={formData.familySizePreference} onValueChange={(value) => handleSelectChange('familySizePreference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Preferred family size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_2_children">1-2 children</SelectItem>
                <SelectItem value="3_4_children">3-4 children</SelectItem>
                <SelectItem value="5_plus_children">5+ children</SelectItem>
                <SelectItem value="no_preference">No preference</SelectItem>
                <SelectItem value="depends_on_allah">Depends on Allah's will</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="financialReadiness">Financial Readiness</Label>
            <Select value={formData.financialReadiness} onValueChange={(value) => handleSelectChange('financialReadiness', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Financial readiness for marriage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fully_ready">Fully ready</SelectItem>
                <SelectItem value="mostly_ready">Mostly ready</SelectItem>
                <SelectItem value="preparing">Currently preparing</SelectItem>
                <SelectItem value="need_time">Need more time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Interests & Hobbies */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Interests & Hobbies</h3>
          </div>
          
          <div>
            <Label>Select your interests (choose multiple)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleArrayChange('hobbiesInterests', interest)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.hobbiesInterests.includes(interest)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {formData.hobbiesInterests.length} interests
            </p>
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Languages</h3>
          </div>
          
          <div>
            <Label>Languages you speak (choose multiple)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => handleArrayChange('languagesSpoken', language)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.languagesSpoken.includes(language)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {formData.languagesSpoken.length} languages
            </p>
          </div>
        </Card>

        {/* Voice Note */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Voice Introduction</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Record a short voice message to introduce yourself (up to 60 seconds)
            </p>

            {!recordingVoice && !audioUrl && (
              <Button
                onClick={startVoiceRecording}
                className="w-full bg-gradient-to-r from-primary/50 to-primary text-white hover:from-primary hover:to-primary/90 shadow-lg"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}

            {recordingVoice && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <Button onClick={stopVoiceRecording} className="w-full bg-red-500 hover:bg-red-600">
                  Stop Recording
                </Button>
              </div>
            )}

            {audioUrl && !recordingVoice && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleAudioPlayback}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm text-gray-600">Voice note recorded</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={startVoiceRecording} variant="outline" className="flex-1">
                    Re-record
                  </Button>
                  {audioBlob && (
                    <Button
                      onClick={uploadVoiceNote}
                      className="flex-1 bg-gradient-primary"
                    >
                      Save Voice Note
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Lifestyle Preferences */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Lifestyle Preferences</h3>
          </div>

          <div>
            <Label htmlFor="pets">Pet Preferences</Label>
            <Select value={formData.petsPreference || ""} onValueChange={(value) => handleSelectChange('petsPreference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Describe your relationship with pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cat_lover">Cat lover 🐱</SelectItem>
                <SelectItem value="dog_lover">Dog lover 🐕</SelectItem>
                <SelectItem value="all_animals">Love all animals 🐾</SelectItem>
                <SelectItem value="no_pets_yet">No pets yet</SelectItem>
                <SelectItem value="allergic">Allergic to pets</SelectItem>
                <SelectItem value="no_preference">No preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="workout">Fitness & Workout</Label>
            <Select value={formData.workoutPreference || ""} onValueChange={(value) => handleSelectChange('workoutPreference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="What's your fitness routine?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gym_daily">Gym 5x/week</SelectItem>
                <SelectItem value="yoga_pilate">Yoga & Pilates</SelectItem>
                <SelectItem value="running_hiking">Running & Hiking</SelectItem>
                <SelectItem value="sports">Team Sports</SelectItem>
                <SelectItem value="home_workouts">Home workouts</SelectItem>
                <SelectItem value="occasional">Occasional activity</SelectItem>
                <SelectItem value="not_active">Not very active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="diet">Dietary Preferences</Label>
            <Select value={formData.dietPreference || ""} onValueChange={(value) => handleSelectChange('dietPreference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="What's your diet preference?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_restrictions">No Restrictions</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="halal_certified">Halal Certified</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="pescatarian">Pescatarian</SelectItem>
                <SelectItem value="low_carb">Low Carb</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="socialLevel">Social Level</Label>
            <Select value={formData.socialPreference || ""} onValueChange={(value) => handleSelectChange('socialPreference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="How social are you?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extrovert">Extrovert - love social gatherings</SelectItem>
                <SelectItem value="ambivert">Ambivert - balance of both</SelectItem>
                <SelectItem value="introvert">Introvert - prefer quiet settings</SelectItem>
                <SelectItem value="social_butterfly">Social butterfly - always out</SelectItem>
                <SelectItem value="homebody">Homebody - prefer staying in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Zodiac & Values */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Star className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-gray-900">Personality & Zodiac</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zodiacSign">Zodiac Sign</Label>
              <Select value={formData.zodiacSign || ""} onValueChange={(value) => handleSelectChange('zodiacSign', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Your zodiac" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aries">Aries ♈</SelectItem>
                  <SelectItem value="taurus">Taurus ♉</SelectItem>
                  <SelectItem value="gemini">Gemini ♊</SelectItem>
                  <SelectItem value="cancer">Cancer ♋</SelectItem>
                  <SelectItem value="leo">Leo ♌</SelectItem>
                  <SelectItem value="virgo">Virgo ♍</SelectItem>
                  <SelectItem value="libra">Libra ♎</SelectItem>
                  <SelectItem value="scorpio">Scorpio ♏</SelectItem>
                  <SelectItem value="sagittarius">Sagittarius ♐</SelectItem>
                  <SelectItem value="capricorn">Capricorn ♑</SelectItem>
                  <SelectItem value="aquarius">Aquarius ♒</SelectItem>
                  <SelectItem value="pisces">Pisces ♓</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="drinkingPreference">Drinking Habits</Label>
              <Select value={formData.drinkingStatus || ""} onValueChange={(value) => handleSelectChange('drinkingStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Alcohol?" />
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

          <div>
            <Label>Your Core Values (choose multiple)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                "Creativity", "Honesty", "Adventure", "Growth", "Family",
                "Knowledge", "Kindness", "Loyalty", "Fun", "Compassion",
                "Ambition", "Faith", "Respect", "Empathy", "Health"
              ].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleArrayChange('coreValues', value)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    (formData.coreValues || []).includes(value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {(formData.coreValues || []).length} values
            </p>
          </div>
        </Card>
        </div>

        <InteractiveMenu />
      </div>
    </>
  );
};

export default EditProfile;
