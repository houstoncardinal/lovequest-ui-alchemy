import { useState, useRef } from "react";
import { Heart, MapPin, ArrowLeft, Star, Play, Pause, Volume2, Camera, Music, Coffee, Plane, Book, Dumbbell, Dog, Crown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import InterestTag from "@/components/InterestTag";
import { Badge } from "@/components/ui/badge";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

const ProfileDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("About");
  const [playingVoiceNote, setPlayingVoiceNote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock profile data - in real app this would come from API based on id
  const profiles = {
    "1": {
      name: "Roseane Rose",
      age: 24,
      distance: "3 km away",
      commonInterests: 5,
      bio: "Digital art and anime lover, ready to share creations and interesting stories. I'm passionate about bringing imagination to life through my artwork.",
      image: profile2,
      images: [profile2, profile1, profile3],
      isPremium: true,
      details: {
        gender: "Woman",
        religion: "Christians",
        zodiac: "Pisces",
        drinking: "Socially",
        smoking: "Never",
        height: "5'6\"",
        education: "Bachelor's Degree",
        jobTitle: "Digital Artist",
        company: "Freelance"
      },
      interests: [
        { icon: "🎨", label: "Digital Art", highlighted: true },
        { icon: "📺", label: "Anime", highlighted: true },
        { icon: "☕", label: "Coffee", highlighted: true },
        { icon: "📚", label: "Reading" },
        { icon: "🎮", label: "Gaming" },
        { icon: "🎵", label: "Indie Music" }
      ],
      lifestyle: {
        pets: "Cat lover 🐱",
        workout: "Yoga & Pilates",
        diet: "Vegetarian",
        socialLevel: "Ambivert"
      },
      values: [
        "Creativity", "Honesty", "Adventure", "Growth", "Humor"
      ],
      voiceNotes: [
        {
          id: "vn1",
          prompt: "What's your perfect date idea?",
          duration: "0:45",
          audioUrl: null // Would be actual audio URL in real app
        },
        {
          id: "vn2", 
          prompt: "What makes you laugh?",
          duration: "0:32",
          audioUrl: null
        },
        {
          id: "vn3",
          prompt: "What are you passionate about?",
          duration: "1:12",
          audioUrl: null
        }
      ],
      photos: [
        { url: profile2, caption: "Coffee shop vibes ☕" },
        { url: profile1, caption: "Working on my latest digital piece 🎨" },
        { url: profile3, caption: "Sunday morning yoga 🧘‍♀️" }
      ]
    },
    "2": {
      name: "Shafa Asadel",
      age: 20,
      distance: "2 km away", 
      commonInterests: 4,
      bio: "Music enthusiast, always on the lookout for new tunes and ready to share playlists. Let's discover new sounds and enjoy the rhythm of life! ♥️✨",
      image: profile1,
      images: [profile1, profile2, profile3],
      isPremium: false,
      details: {
        gender: "Woman",
        religion: "Muslims",
        zodiac: "Taurus",
        drinking: "Never",
        smoking: "Sometimes",
        height: "5'4\"",
        education: "High School",
        jobTitle: "Music Student",
        company: "Local University"
      },
      interests: [
        { icon: "🎵", label: "Pop Punk", highlighted: true },
        { icon: "☕", label: "Coffee", highlighted: true },
        { icon: "🥊", label: "Boxing" },
        { icon: "📱", label: "Fifa Mobile" },
        { icon: "⚽", label: "Real Madrid" }
      ],
      lifestyle: {
        pets: "No pets yet",
        workout: "Boxing & Running",
        diet: "Halal",
        socialLevel: "Extrovert"
      },
      values: [
        "Music", "Family", "Authenticity", "Fun", "Loyalty"
      ],
      voiceNotes: [
        {
          id: "vn1",
          prompt: "What's your favorite music genre and why?",
          duration: "1:03",
          audioUrl: null
        },
        {
          id: "vn2",
          prompt: "Describe your dream concert experience",
          duration: "0:58",
          audioUrl: null
        }
      ],
      photos: [
        { url: profile1, caption: "Jamming to my favorite playlist 🎵" },
        { url: profile2, caption: "Coffee and music - perfect combo" },
        { url: profile3, caption: "Boxing training session 🥊" }
      ]
    }
  };

  const profile = profiles[id as keyof typeof profiles];
  
  if (!profile) {
    return <div>Profile not found</div>;
  }

  const tabs = ["About", "Photos", "Voice", "Lifestyle"];

  const playVoiceNote = async (voiceNoteId: string) => {
    if (playingVoiceNote === voiceNoteId) {
      setPlayingVoiceNote(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setPlayingVoiceNote(voiceNoteId);
      // In real app, would play actual audio file
      setTimeout(() => setPlayingVoiceNote(null), 3000); // Mock playback
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <div className="space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bio</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About Me</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">👤</span>
                  <span className="text-gray-700 font-medium">{profile.details.gender}</span>
                </div>
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">📏</span>
                  <span className="text-gray-700 font-medium">{profile.details.height}</span>
                </div>
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">🌙</span>
                  <span className="text-gray-700 font-medium">{profile.details.religion}</span>
                </div>
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">♉</span>
                  <span className="text-gray-700 font-medium">{profile.details.zodiac}</span>
                </div>
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">🚫</span>
                  <span className="text-gray-700 font-medium">{profile.details.drinking}</span>
                </div>
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">🚬</span>
                  <span className="text-gray-700 font-medium">{profile.details.smoking}</span>
                </div>
              </div>
            </div>

            {/* Work & Education */}
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Work & Education</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">💼</span>
                  <span className="text-gray-700 font-medium">{profile.details.jobTitle} at {profile.details.company}</span>
                </div>
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 mr-3 text-lg">🎓</span>
                  <span className="text-gray-700 font-medium">{profile.details.education}</span>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Interests</h3>
              <div className="flex flex-wrap gap-3">
                {profile.interests.map((interest, index) => (
                  <InterestTag
                    key={index}
                    icon={interest.icon}
                    label={interest.label}
                    variant={interest.highlighted ? 'highlighted' : 'default'}
                  />
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Values</h3>
              <div className="flex flex-wrap gap-3">
                {profile.values.map((value, index) => (
                  <Badge key={index} className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case "Photos":
        return (
          <div className="grid grid-cols-1 gap-4">
            {profile.photos.map((photo, index) => (
              <div key={index} className="relative bg-white rounded-3xl shadow-lg border border-emerald-100 overflow-hidden">
                <img 
                  src={photo.url} 
                  alt={`${profile.name}'s photo ${index + 1}`}
                  className="w-full aspect-[4/5] object-cover"
                />
                {photo.caption && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-white text-sm font-medium">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "Voice":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6 bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Voice Notes</h3>
              <p className="text-gray-600 text-sm">Get to know {profile.name.split(' ')[0]} better through her voice</p>
            </div>
            
            {profile.voiceNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{note.prompt}</h4>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                    {note.duration}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => playVoiceNote(note.id)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      playingVoiceNote === note.id
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                        : "bg-emerald-50 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {playingVoiceNote === note.id ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-emerald-500" />
                      <div className="flex-1 bg-emerald-100 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 ${
                            playingVoiceNote === note.id ? "w-full" : "w-0"
                          }`}
                          style={{
                            animation: playingVoiceNote === note.id ? "progress 3s linear" : "none"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-6 bg-emerald-50 rounded-3xl p-4">
              <p className="text-sm text-emerald-700 font-medium">
                👋 Voice notes help you connect on a deeper level
              </p>
            </div>
          </div>
        );

      case "Lifestyle":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lifestyle</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🐾</span>
                    <span className="font-bold text-gray-700">Pets</span>
                  </div>
                  <span className="text-gray-600 font-medium">{profile.lifestyle.pets}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">💪</span>
                    <span className="font-bold text-gray-700">Workout</span>
                  </div>
                  <span className="text-gray-600 font-medium">{profile.lifestyle.workout}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🍽️</span>
                    <span className="font-bold text-gray-700">Diet</span>
                  </div>
                  <span className="text-gray-600 font-medium">{profile.lifestyle.diet}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🎭</span>
                    <span className="font-bold text-gray-700">Social</span>
                  </div>
                  <span className="text-gray-600 font-medium">{profile.lifestyle.socialLevel}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[50vh] bg-gray-200 overflow-hidden">
        <img 
          src={profile.image} 
          alt={`${profile.name}'s profile`}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-32" />
        
        <div className="absolute bottom-6 left-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-2xl font-bold">{profile.name}, {profile.age}</h1>
            {profile.isPremium && (
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
            )}
          </div>
          <div className="flex items-center text-sm mb-1">
            <MapPin className="w-4 h-4 mr-2 text-emerald-400" />
            <span>{profile.distance}</span>
            <Star className="w-4 h-4 ml-4 mr-2 text-amber-400" />
            <span>{profile.commonInterests} Common Interest</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-20 shadow-sm">
        <div className="flex px-4 py-4 space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2 px-1 text-sm font-bold transition-colors duration-200 ${
                activeTab === tab
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
        <div className="flex justify-center space-x-6">
          <button className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              isLiked 
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" 
                : "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white"
            }`}
          >
            <Heart className={`w-9 h-9 ${isLiked ? "fill-current" : ""}`} />
          </button>
          
          <button className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300">
            <Star className="w-7 h-7 text-gray-600" />
          </button>
        </div>
      </div>

      <InteractiveMenu />
      
      {/* Hidden audio element for voice note playback */}
      <audio ref={audioRef} />
      
      {/* CSS for progress animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `
      }} />
    </div>
  );
};

export default ProfileDetail;