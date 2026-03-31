import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileCard from '@/components/ProfileCard';
import PremiumBadge from '@/components/PremiumBadge';
import { 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  Users,
  Calendar,
  BookOpen,
  Zap,
  Star
} from 'lucide-react';

interface SearchFilters {
  ageRange: [number, number];
  location: string;
  radius: number;
  educationLevel: string[];
  careerField: string[];
  incomeRange: string;
  marriageTimeline: string[];
  previousMarriage: boolean | null;
  wantsChildren: boolean | null;
  isVerified: boolean;
  lastActiveWithin: string;
  smokingStatus: string[];
  maritalStatus: string[];
  hasChildren: boolean | null;
  childrenPreference: string[];
}

interface Profile {
  user_id: string;
  display_name: string | null;
  age: number | null;
  location: string | null;
  bio: string | null;
  photos: string[] | null;
  education: string | null;
  occupation: string | null;
  religion: string | null;
  is_verified: boolean | null;
}

const AdvancedSearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [22, 35],
    location: '',
    radius: 50,
    educationLevel: [],
    careerField: [],
    incomeRange: '',
    marriageTimeline: [],
    previousMarriage: null,
    wantsChildren: null,
    isVerified: false,
    lastActiveWithin: '30',
    smokingStatus: [],
    maritalStatus: [],
    hasChildren: null,
    childrenPreference: []
  });
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');

  const educationLevels = [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 
    'Master\'s Degree', 'PhD/Doctorate', 'Professional Degree'
  ];

  const careerFields = [
    'Technology', 'Healthcare', 'Education', 'Business/Finance', 
    'Engineering', 'Legal', 'Arts/Entertainment', 'Non-Profit',
    'Government', 'Self-Employed', 'Student', 'Other'
  ];

  const lifestyleOptions = [
    'Active & Fit', 'Homebody', 'Social Butterfly', 'Adventurous',
    'Career-Focused', 'Family-Oriented', 'Prefer not to say'
  ];

  const smokingStatuses = [
    'never', 'occasionally', 'socially', 'regularly', 'prefer_not_to_say'
  ];

  const maritalStatuses = [
    'never_married', 'divorced', 'widowed', 'separated'
  ];

  const childrenPreferences = [
    'wants_children', 'doesnt_want_children', 'open_to_children', 
    'already_has_enough', 'prefer_not_to_say'
  ];

  const marriageTimelines = [
    'Within 6 months', '6-12 months', '1-2 years', 
    '2+ years', 'Not sure yet'
  ];

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    // Implementation for loading saved searches
    // This would fetch from a saved_searches table
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id)
        .gte('age', filters.ageRange[0])
        .lte('age', filters.ageRange[1]);

      // Apply filters
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.educationLevel.length > 0) {
        query = query.in('education_level', filters.educationLevel);
      }

      if (filters.careerField.length > 0) {
        query = query.in('career_field', filters.careerField);
      }

      if (filters.marriageTimeline.length > 0) {
        query = query.in('marriage_timeline', filters.marriageTimeline);
      }

      if (filters.smokingStatus.length > 0) {
        query = query.in('smoking_status', filters.smokingStatus);
      }

      if (filters.maritalStatus.length > 0) {
        query = query.in('marital_status', filters.maritalStatus);
      }

      if (filters.childrenPreference.length > 0) {
        query = query.in('children_preference', filters.childrenPreference);
      }

      if (filters.previousMarriage !== null) {
        query = query.eq('previous_marriage', filters.previousMarriage);
      }

      if (filters.wantsChildren !== null) {
        query = query.eq('wants_children', filters.wantsChildren);
      }

      if (filters.hasChildren !== null) {
        query = query.eq('has_children', filters.hasChildren);
      }

      if (filters.isVerified) {
        query = query.eq('is_verified', true);
      }

      // Last active filter
      if (filters.lastActiveWithin !== 'any') {
        const days = parseInt(filters.lastActiveWithin);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('last_active', cutoffDate.toISOString());
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      setResults(data || []);
      
      toast({
        title: "Search Complete",
        description: `Found ${data?.length || 0} profiles matching your criteria`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "There was an error performing your search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your saved search",
        variant: "destructive",
      });
      return;
    }

    try {
      // Implementation for saving search
      // This would save to a saved_searches table
      toast({
        title: "Search Saved",
        description: `"${searchName}" has been saved to your searches`,
      });
      setSearchName('');
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const updateMultiSelect = (field: keyof SearchFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Advanced Search</h1>
            <PremiumBadge plan="premium" />
          </div>
          <p className="text-muted-foreground">
            Find your perfect match with detailed compatibility filters
          </p>
        </div>

        <Tabs defaultValue="filters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved Searches</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-6">
            {/* Basic Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Basic Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age Range */}
                <div className="space-y-3">
                  <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</Label>
                  <Slider
                    value={filters.ageRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                    min={18}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="City, State or Country"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="flex-1"
                    />
                    <Select value={filters.radius.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, radius: parseInt(value) }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                        <SelectItem value="500">500 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Last Active */}
                <div className="space-y-2">
                  <Label>Last Active Within</Label>
                  <Select value={filters.lastActiveWithin} onValueChange={(value) => setFilters(prev => ({ ...prev, lastActiveWithin: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="any">Any time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Education & Career */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education & Career
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Education Level */}
                <div className="space-y-3">
                  <Label>Education Level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {educationLevels.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.educationLevel.includes(level)}
                          onCheckedChange={(checked) => updateMultiSelect('educationLevel', level, checked)}
                        />
                        <Label className="text-sm">{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Field */}
                <div className="space-y-3">
                  <Label>Career Field</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {careerFields.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.careerField.includes(field)}
                          onCheckedChange={(checked) => updateMultiSelect('careerField', field, checked)}
                        />
                        <Label className="text-sm">{field}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Lifestyle & Values
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Lifestyle</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {lifestyleOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Switch
                          checked={false}
                          onCheckedChange={() => {}}
                        />
                        <Label className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family & Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family & Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Marital Status */}
                <div className="space-y-3">
                  <Label>Marital Status</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {maritalStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.maritalStatus.includes(status)}
                          onCheckedChange={(checked) => updateMultiSelect('maritalStatus', status, checked)}
                        />
                        <Label className="text-sm capitalize">{status.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smoking Status */}
                <div className="space-y-3">
                  <Label>Smoking Status</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {smokingStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.smokingStatus.includes(status)}
                          onCheckedChange={(checked) => updateMultiSelect('smokingStatus', status, checked)}
                        />
                        <Label className="text-sm capitalize">{status.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Children Preference */}
                <div className="space-y-3">
                  <Label>Children Preference</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {childrenPreferences.map((preference) => (
                      <div key={preference} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.childrenPreference.includes(preference)}
                          onCheckedChange={(checked) => updateMultiSelect('childrenPreference', preference, checked)}
                        />
                        <Label className="text-sm capitalize">{preference.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Has Children */}
                <div className="space-y-3">
                  <Label>Has Children</Label>
                  <Select value={filters.hasChildren?.toString() || 'any'} onValueChange={(value) => setFilters(prev => ({ ...prev, hasChildren: value === 'any' ? null : value === 'true' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Has Children</SelectItem>
                      <SelectItem value="false">No Children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Marriage Timeline */}
                <div className="space-y-3">
                  <Label>Marriage Timeline</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {marriageTimelines.map((timeline) => (
                      <div key={timeline} className="flex items-center space-x-2">
                        <Switch
                          checked={filters.marriageTimeline.includes(timeline)}
                          onCheckedChange={(checked) => updateMultiSelect('marriageTimeline', timeline, checked)}
                        />
                        <Label className="text-sm">{timeline}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.isVerified}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isVerified: checked }))}
                  />
                  <Label>Only show verified profiles</Label>
                </div>
              </CardContent>
            </Card>

            {/* Search Actions */}
            <div className="flex gap-4">
              <Button onClick={performSearch} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Profiles
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Input
                  placeholder="Search name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-40"
                />
                <Button variant="outline" onClick={saveSearch}>
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {results.length > 0 ? (
              <div className="grid gap-4">
                {results.map((profile) => (
                  <ProfileCard
                    key={profile.user_id}
                    id={profile.user_id}
                    name={profile.display_name || 'Unknown'}
                    age={profile.age}
                    location={profile.location}
                    bio={profile.bio}
                    image={profile.avatar_url}
                    verified={profile.is_verified}
                    matchScore={85} // This would be calculated
                    badges={[]}
                    onClick={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Use the filters tab to search for your perfect match
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
                <p className="text-muted-foreground">
                  Save your favorite search combinations for quick access
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedSearch;