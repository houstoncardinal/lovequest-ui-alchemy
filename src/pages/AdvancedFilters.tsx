import React, { useState } from "react";
import { ArrowLeft, Filter, MapPin, GraduationCap, Heart, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const AdvancedFilters = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    ageRange: [25, 35],
    distance: 50,
    religiousPractice: "moderate",
    education: "bachelors",
    familyValues: "traditional",
    maritalStatus: "never_married",
    children: "no_preference",
    location: "anywhere",
    interests: [],
    languages: [],
  });

  const religiousOptions = [
    { value: "very_practicing", label: "Very Practicing", icon: "🕌" },
    { value: "practicing", label: "Practicing", icon: "🙏" },
    { value: "moderate", label: "Moderate", icon: "📿" },
    { value: "cultural", label: "Cultural", icon: "🌙" },
    { value: "any", label: "Any", icon: "✨" },
  ];

  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "masters", label: "Master's Degree" },
    { value: "phd", label: "PhD/Doctorate" },
    { value: "any", label: "Any Education" },
  ];

  const familyValuesOptions = [
    { value: "very_traditional", label: "Very Traditional", icon: "👨‍👩‍👧‍👦" },
    { value: "traditional", label: "Traditional", icon: "🏠" },
    { value: "moderate", label: "Moderate", icon: "⚖️" },
    { value: "modern", label: "Modern", icon: "💼" },
    { value: "any", label: "Any", icon: "✨" },
  ];

  const maritalStatusOptions = [
    { value: "never_married", label: "Never Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "any", label: "Any Status" },
  ];

  const childrenOptions = [
    { value: "no_children", label: "No Children" },
    { value: "has_children", label: "Has Children" },
    { value: "no_preference", label: "No Preference" },
  ];

  const interestOptions = [
    "Reading Quran", "Islamic Studies", "Community Service", "Travel",
    "Cooking", "Sports", "Technology", "Arts", "Nature", "Fitness",
    "Photography", "Music", "Dancing", "Gaming", "Pets"
  ];

  const languageOptions = [
    "English", "Arabic", "Urdu", "French", "Spanish", "Turkish",
    "Malay", "Indonesian", "Bengali", "Persian"
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const applyFilters = () => {
    // Apply filters logic
    navigate("/home");
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [25, 35],
      distance: 50,
      religiousPractice: "moderate",
      education: "bachelors",
      familyValues: "traditional",
      maritalStatus: "never_married",
      children: "no_preference",
      location: "anywhere",
      interests: [],
      languages: [],
    });
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
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced Filters</h1>
          <p className="text-gray-600">Find your perfect match with detailed preferences</p>
        </div>

        {/* Age Range */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600" />
              Age Range
            </CardTitle>
            <CardDescription>
              {filters.ageRange[0]} - {filters.ageRange[1]} years old
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => handleFilterChange('ageRange', value)}
              max={60}
              min={18}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>18</span>
              <span>60</span>
            </div>
          </CardContent>
        </Card>

        {/* Distance */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Distance
            </CardTitle>
            <CardDescription>
              Within {filters.distance} miles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Slider
              value={[filters.distance]}
              onValueChange={(value) => handleFilterChange('distance', value[0])}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>5 miles</span>
              <span>100 miles</span>
            </div>
          </CardContent>
        </Card>

        {/* Religious Practice */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Religious Practice</CardTitle>
            <CardDescription>Select preferred religious practice level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {religiousOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  filters.religiousPractice === option.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleFilterChange('religiousPractice', option.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
                {filters.religiousPractice === option.value && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Education
            </CardTitle>
            <CardDescription>Preferred education level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {educationOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  filters.education === option.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleFilterChange('education', option.value)}
              >
                <span className="font-medium">{option.label}</span>
                {filters.education === option.value && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Family Values */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Family Values
            </CardTitle>
            <CardDescription>Preferred family values and lifestyle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {familyValuesOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  filters.familyValues === option.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleFilterChange('familyValues', option.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
                {filters.familyValues === option.value && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Marital Status */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Marital Status</CardTitle>
            <CardDescription>Preferred marital status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {maritalStatusOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  filters.maritalStatus === option.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleFilterChange('maritalStatus', option.value)}
              >
                <span className="font-medium">{option.label}</span>
                {filters.maritalStatus === option.value && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Children */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Children</CardTitle>
            <CardDescription>Preference regarding children</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {childrenOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  filters.children === option.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleFilterChange('children', option.value)}
              >
                <span className="font-medium">{option.label}</span>
                {filters.children === option.value && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Interests</CardTitle>
            <CardDescription>Select interests you'd like to share</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <Badge
                  key={interest}
                  variant={filters.interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.interests.includes(interest)
                      ? "bg-emerald-500 text-white"
                      : "hover:bg-emerald-50"
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Languages</CardTitle>
            <CardDescription>Languages you speak or prefer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((language) => (
                <Badge
                  key={language}
                  variant={filters.languages.includes(language) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.languages.includes(language)
                      ? "bg-emerald-500 text-white"
                      : "hover:bg-emerald-50"
                  }`}
                  onClick={() => handleLanguageToggle(language)}
                >
                  {language}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetFilters}
          >
            Reset
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={applyFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>

        {/* Active Filters Summary */}
        {Object.values(filters).some(value => 
          Array.isArray(value) ? value.length > 0 : value !== "moderate" && value !== "bachelors" && value !== "traditional" && value !== "never_married" && value !== "no_preference"
        ) && (
          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-700">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  Age: {filters.ageRange[0]}-{filters.ageRange[1]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Distance: {filters.distance} miles
                </Badge>
                {filters.religiousPractice !== "moderate" && (
                  <Badge variant="secondary" className="text-xs">
                    {religiousOptions.find(o => o.value === filters.religiousPractice)?.label}
                  </Badge>
                )}
                {filters.interests.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.interests.length} interests
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters; 