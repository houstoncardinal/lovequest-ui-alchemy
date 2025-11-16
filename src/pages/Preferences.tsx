import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Heart, Users, MapPin, Shield, Star, Church, Baby, GraduationCap, Briefcase, Home, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db, doc, getDoc, setDoc } from "@/integrations/firebase";
import { getUserProfile } from "@/lib/firestore/users";
import { motion } from "framer-motion";

interface UserPreferences {
  ageRangeMin: number;
  ageRangeMax: number;
  maxDistanceKm: number;
  lookingFor: string;
  showMe: string;
  dealBreakers: {
    smoking: boolean;
    drinking: boolean;
    hasChildren: boolean;
    previousMarriage: boolean;
    differentReligionLevel: boolean;
    differentMadhab: boolean;
    noHijab: boolean; // For men looking for women
    nonPracticing: boolean;
    differentPrayerFrequency: boolean;
  };
  religionPreferences: {
    minReligionLevel: string;
    preferredMadhab: string[];
    prayerFrequencyPreference: string;
    hijabPreference: string; // For men
    islamicKnowledgePreference: string;
  };
  lifestylePreferences: {
    educationLevelPreference: string[];
    careerFieldPreference: string[];
    smokingPreference: string;
    familySizePreference: string;
    marriageTimelinePreference: string;
    locationPreference: string;
  };
  familyPreferences: {
    childrenPreference: string;
    familyInvolvementPreference: string;
    livingArrangementPreference: string;
  };
}

const Preferences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    ageRangeMin: 22,
    ageRangeMax: 35,
    maxDistanceKm: 50,
    lookingFor: "marriage",
    showMe: "opposite", // Will be determined by user's gender
    dealBreakers: {
      smoking: false,
      drinking: false,
      hasChildren: false,
      previousMarriage: false,
      differentReligionLevel: false,
      differentMadhab: false,
      noHijab: false,
      nonPracticing: false,
      differentPrayerFrequency: false,
    },
    religionPreferences: {
      minReligionLevel: "somewhat_religious",
      preferredMadhab: [],
      prayerFrequencyPreference: "any",
      hijabPreference: "any",
      islamicKnowledgePreference: "any",
    },
    lifestylePreferences: {
      educationLevelPreference: [],
      careerFieldPreference: [],
      smokingPreference: "never",
      familySizePreference: "any",
      marriageTimelinePreference: "any",
      locationPreference: "any",
    },
    familyPreferences: {
      childrenPreference: "wants_children",
      familyInvolvementPreference: "moderate",
      livingArrangementPreference: "any",
    },
  });

  useEffect(() => {
    fetchUserProfile();
    fetchPreferences();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const data = await getUserProfile(user.uid);
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const prefsRef = doc(db, 'userPreferences', user.uid);
      const prefsSnap = await getDoc(prefsRef);

      if (prefsSnap.exists()) {
        const data = prefsSnap.data();
        const dealBreakers = data.dealBreakers as any || {};

        setPreferences({
          ageRangeMin: data.ageRangeMin || 22,
          ageRangeMax: data.ageRangeMax || 35,
          maxDistanceKm: data.maxDistanceKm || 50,
          lookingFor: data.lookingFor || "marriage",
          showMe: data.showMe || "opposite",
          dealBreakers: {
            smoking: dealBreakers.smoking || false,
            drinking: dealBreakers.drinking || false,
            hasChildren: dealBreakers.hasChildren || false,
            previousMarriage: dealBreakers.previousMarriage || false,
            differentReligionLevel: dealBreakers.differentReligionLevel || false,
            differentMadhab: dealBreakers.differentMadhab || false,
            noHijab: dealBreakers.noHijab || false,
            nonPracticing: dealBreakers.nonPracticing || false,
            differentPrayerFrequency: dealBreakers.differentPrayerFrequency || false,
          },
          religionPreferences: dealBreakers.religionPreferences || preferences.religionPreferences,
          lifestylePreferences: dealBreakers.lifestylePreferences || preferences.lifestylePreferences,
          familyPreferences: dealBreakers.familyPreferences || preferences.familyPreferences,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error loading preferences",
        description: "Failed to load your saved preferences. Using defaults.",
        variant: "destructive",
      });
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Prepare the data structure for saving
      const preferencesData = {
        userId: user.uid,
        ageRangeMin: preferences.ageRangeMin,
        ageRangeMax: preferences.ageRangeMax,
        maxDistanceKm: preferences.maxDistanceKm,
        lookingFor: preferences.lookingFor,
        showMe: preferences.showMe,
        dealBreakers: {
          // Basic deal breakers
          smoking: preferences.dealBreakers.smoking,
          drinking: preferences.dealBreakers.drinking,
          hasChildren: preferences.dealBreakers.hasChildren,
          previousMarriage: preferences.dealBreakers.previousMarriage,
          differentReligionLevel: preferences.dealBreakers.differentReligionLevel,
          differentMadhab: preferences.dealBreakers.differentMadhab,
          noHijab: preferences.dealBreakers.noHijab,
          nonPracticing: preferences.dealBreakers.nonPracticing,
          differentPrayerFrequency: preferences.dealBreakers.differentPrayerFrequency,

          // Extended preferences stored within dealBreakers JSON
          religionPreferences: preferences.religionPreferences,
          lifestylePreferences: preferences.lifestylePreferences,
          familyPreferences: preferences.familyPreferences,
        },
        updatedAt: new Date().toISOString(),
      };

      const prefsRef = doc(db, 'userPreferences', user.uid);
      await setDoc(prefsRef, preferencesData, { merge: true });

      toast({
        title: "Preferences saved successfully! ✅",
        description: "Your matching preferences have been updated and will be used to find compatible matches.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Failed to save preferences",
        description: "There was an error saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get opposite gender options
  const getGenderOptions = () => {
    if (!userProfile) return [];
    
    // In Islam, only opposite gender matching is allowed
    if (userProfile.gender === 'male') {
      return [{ value: 'female', label: 'Women', icon: '👩' }];
    } else if (userProfile.gender === 'female') {
      return [{ value: 'male', label: 'Men', icon: '👨' }];
    }
    return [];
  };

  const religionLevels = [
    { value: 'very_religious', label: 'Very Religious' },
    { value: 'religious', label: 'Religious' },
    { value: 'somewhat_religious', label: 'Somewhat Religious' },
    { value: 'not_very_religious', label: 'Not Very Religious' },
  ];

  const madhabs = [
    { value: 'hanafi', label: 'Hanafi' },
    { value: 'maliki', label: 'Maliki' },
    { value: 'shafii', label: 'Shafi\'i' },
    { value: 'hanbali', label: 'Hanbali' },
  ];

  const prayerFrequencies = [
    { value: '5_times_daily', label: '5 times daily' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'occasionally', label: 'Occasionally' },
    { value: 'rarely', label: 'Rarely' },
  ];

  const educationLevels = [
    { value: 'high_school', label: 'High School' },
    { value: 'bachelors', label: 'Bachelor\'s Degree' },
    { value: 'masters', label: 'Master\'s Degree' },
    { value: 'doctorate', label: 'Doctorate' },
    { value: 'trade_school', label: 'Trade School' },
  ];

  const careerFields = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'arts', label: 'Arts & Creative' },
    { value: 'personal_development', label: 'Personal Development' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/90 border-b border-border/50">
        <div className="flex items-center justify-between p-6">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate("/account")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Preferences</h1>
            <p className="text-sm text-muted-foreground">Customize your match criteria</p>
          </div>
          
          <Button 
            onClick={savePreferences}
            disabled={loading}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Basic Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 shadow-elegant border-border/50 bg-gradient-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Basic Preferences</h3>
            </div>
            
            {/* Age Range */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Age Range</Label>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {preferences.age_range_min} - {preferences.age_range_max} years
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Minimum Age</Label>
                  <Slider
                    value={[preferences.age_range_min]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, age_range_min: value[0] }))}
                    max={50}
                    min={18}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Maximum Age</Label>
                  <Slider
                    value={[preferences.age_range_max]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, age_range_max: value[0] }))}
                    max={60}
                    min={preferences.age_range_min}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Maximum Distance</Label>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {preferences.max_distance_km} km
                </Badge>
              </div>
              <Slider
                value={[preferences.max_distance_km]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, max_distance_km: value[0] }))}
                max={500}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Looking For */}
            <div className="space-y-4 mb-6">
              <Label className="text-sm font-medium">Looking For</Label>
              <Select 
                value={preferences.looking_for} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, looking_for: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select what you're looking for" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                  <SelectItem value="marriage">💍 Marriage</SelectItem>
                  <SelectItem value="serious_relationship">❤️ Serious Relationship</SelectItem>
                  <SelectItem value="getting_to_know">🤝 Getting to Know</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Me - Based on user preferences */}
            {userProfile && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Show Me</Label>
                <div className="p-3 rounded-xl border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {userProfile.gender === 'male' ? '👩' : '👨'}
                    </span>
                    <div>
                      <p className="font-medium">
                        {userProfile.gender === 'male' ? 'Women' : 'Men'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Based on your preferences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Religious Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 shadow-elegant border-border/50 bg-gradient-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Church className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Religious Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Minimum Religion Level</Label>
                <Select 
                  value={preferences.religion_preferences.min_religion_level}
                  onValueChange={(value) => setPreferences(prev => ({
                    ...prev,
                    religion_preferences: { ...prev.religion_preferences, min_religion_level: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                    {religionLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Prayer Frequency Preference</Label>
                <Select 
                  value={preferences.religion_preferences.prayer_frequency_preference}
                  onValueChange={(value) => setPreferences(prev => ({
                    ...prev,
                    religion_preferences: { ...prev.religion_preferences, prayer_frequency_preference: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                    <SelectItem value="any">Any</SelectItem>
                    {prayerFrequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userProfile?.gender === 'male' && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Hijab Preference</Label>
                  <Select 
                    value={preferences.religion_preferences.hijab_preference}
                    onValueChange={(value) => setPreferences(prev => ({
                      ...prev,
                      religion_preferences: { ...prev.religion_preferences, hijab_preference: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="wears_hijab">Wears Hijab</SelectItem>
                      <SelectItem value="prefers_hijab">Prefers Hijab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Deal Breakers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 shadow-elegant border-border/50 bg-gradient-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-red-500/20">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Deal Breakers</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Don't show me people who have these traits
            </p>
            
            <div className="space-y-4">
              {[
                { key: 'smoking', label: 'Smoking', icon: '🚬' },
                { key: 'has_children', label: 'Has children', icon: '👶' },
                { key: 'previous_marriage', label: 'Previously married', icon: '💍' },
                { key: 'different_religion_level', label: 'Very different religion level', icon: '📿' },
                { key: 'spiritual', label: 'Spiritual/Religious', icon: '🙏' },
                ...(userProfile?.gender === 'male' ? [{ key: 'no_hijab', label: 'Does not wear hijab', icon: '🧕' }] : []),
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border/30 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <Switch
                    checked={preferences.deal_breakers[item.key as keyof typeof preferences.deal_breakers]}
                    onCheckedChange={(checked) => setPreferences(prev => ({
                      ...prev,
                      deal_breakers: { ...prev.deal_breakers, [item.key]: checked }
                    }))}
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Lifestyle Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6 shadow-elegant border-border/50 bg-gradient-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Lifestyle Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Education Level</Label>
                <Select 
                  value={preferences.lifestyle_preferences.education_level_preference[0] || "any"}
                  onValueChange={(value) => setPreferences(prev => ({
                    ...prev,
                    lifestyle_preferences: { 
                      ...prev.lifestyle_preferences, 
                      education_level_preference: value === "any" ? [] : [value]
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                    <SelectItem value="any">Any</SelectItem>
                    {educationLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Marriage Timeline</Label>
                <Select 
                  value={preferences.lifestyle_preferences.marriage_timeline_preference}
                  onValueChange={(value) => setPreferences(prev => ({
                    ...prev,
                    lifestyle_preferences: { ...prev.lifestyle_preferences, marriage_timeline_preference: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="within_year">Within a year</SelectItem>
                    <SelectItem value="1_2_years">1-2 years</SelectItem>
                    <SelectItem value="2_plus_years">2+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Family Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="p-6 shadow-elegant border-border/50 bg-gradient-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Family Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Children Preference</Label>
                <Select 
                  value={preferences.family_preferences.children_preference}
                  onValueChange={(value) => setPreferences(prev => ({
                    ...prev,
                    family_preferences: { ...prev.family_preferences, children_preference: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                    <SelectItem value="wants_children">Wants children</SelectItem>
                    <SelectItem value="open_to_children">Open to children</SelectItem>
                    <SelectItem value="doesnt_want_children">Doesn't want children</SelectItem>
                    <SelectItem value="already_has_enough">Already has enough</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Family Involvement</Label>
                <Select 
                  value={preferences.family_preferences.family_involvement_preference}
                  onValueChange={(value) => setPreferences(prev => ({
                    ...prev,
                    family_preferences: { ...prev.family_preferences, family_involvement_preference: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border/50 shadow-glow z-50">
                    <SelectItem value="very_involved">Very involved family</SelectItem>
                    <SelectItem value="moderate">Moderately involved</SelectItem>
                    <SelectItem value="independent">More independent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Preferences;