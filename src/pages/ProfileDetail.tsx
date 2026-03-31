import { useState, useRef } from "react";
import { MapPin, ArrowLeft, Star, Play, Pause, Volume2, Camera, Crown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import InterestTag from "@/components/InterestTag";
import { Badge } from "@/components/ui/badge";
import NewMatchCelebration from "@/components/NewMatchCelebration";
import { getDemoProfileDetail, type DemoProfileDetail } from "@/data/demoData";

const ProfileDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("About");
  const [playingVoiceNote, setPlayingVoiceNote] = useState<string | null>(null);
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const profile = getDemoProfileDetail(id || "demo-1");

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground px-6 py-2 rounded-full">Go Back</button>
        </div>
      </div>
    );
  }

  const tabs = ["About", "Photos", "Voice", "Lifestyle"];

  const playVoiceNote = async (voiceNoteId: string) => {
    if (playingVoiceNote === voiceNoteId) {
      setPlayingVoiceNote(null);
    } else {
      setPlayingVoiceNote(voiceNoteId);
      setTimeout(() => setPlayingVoiceNote(null), 3000);
    }
  };

  const handlePassAction = () => {
    const isMatch = Math.random() < 0.3;
    if (isMatch) setShowMatchCelebration(true);
    else navigate(-1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-3xl shadow-lg border border-border/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Bio</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>
            <div className="bg-card rounded-3xl shadow-lg border border-border/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">About Me</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: "👤", val: profile.details.gender },
                  { icon: "📏", val: profile.details.height },
                  { icon: "🌙", val: profile.details.religion },
                  { icon: "♉", val: profile.details.zodiac },
                  { icon: "🍷", val: profile.details.drinking },
                  { icon: "🚬", val: profile.details.smoking },
                ].map((d, i) => (
                  <div key={i} className="flex items-center p-3 bg-primary/5 rounded-xl">
                    <span className="mr-3 text-lg">{d.icon}</span>
                    <span className="text-muted-foreground font-medium">{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-3xl shadow-lg border border-border/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Work & Education</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-primary/5 rounded-xl">
                  <span className="mr-3 text-lg">💼</span>
                  <span className="text-muted-foreground font-medium">{profile.details.jobTitle} at {profile.details.company}</span>
                </div>
                <div className="flex items-center p-3 bg-primary/5 rounded-xl">
                  <span className="mr-3 text-lg">🎓</span>
                  <span className="text-muted-foreground font-medium">{profile.details.education}</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-3xl shadow-lg border border-border/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Interests</h3>
              <div className="flex flex-wrap gap-3">
                {profile.interests.map((interest, index) => (
                  <InterestTag key={index} icon={interest.icon} label={interest.label} variant={interest.highlighted ? 'highlighted' : 'default'} />
                ))}
              </div>
            </div>
            <div className="bg-card rounded-3xl shadow-lg border border-border/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">My Values</h3>
              <div className="flex flex-wrap gap-3">
                {profile.values.map((value, index) => (
                  <Badge key={index} className="bg-primary/10 text-primary border-primary/20 font-medium">{value}</Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case "Photos":
        return (
          <div className="grid grid-cols-1 gap-4">
            {profile.photos.map((photo, index) => (
              <div key={index} className="relative bg-card rounded-3xl shadow-lg border border-border/30 overflow-hidden">
                <img src={photo.url} alt={photo.caption} className="w-full h-64 object-cover" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case "Voice":
        return (
          <div className="space-y-4">
            {profile.voiceNotes.map((note) => (
              <div key={note.id} className="bg-card rounded-3xl shadow-lg border border-border/30 p-5">
                <p className="text-sm font-medium text-foreground mb-3">{note.prompt}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => playVoiceNote(note.id)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    {playingVoiceNote === note.id ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
                  </button>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-primary rounded-full transition-all duration-300 ${playingVoiceNote === note.id ? 'w-2/3' : 'w-0'}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{note.duration}</span>
                </div>
              </div>
            ))}
          </div>
        );
      case "Lifestyle":
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-3xl shadow-lg border border-border/30 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Pets", val: profile.lifestyle.pets },
                  { label: "Workout", val: profile.lifestyle.workout },
                  { label: "Diet", val: profile.lifestyle.diet },
                  { label: "Social", val: profile.lifestyle.socialLevel },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-primary/5 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-[55vh] overflow-hidden">
        <img src={profile.images[activeImageIndex]} alt={profile.name} className="w-full h-full object-cover" />
        {/* Image indicators */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {profile.images.map((_, i) => (
            <button key={i} onClick={() => setActiveImageIndex(i)} className={`flex-1 h-1 rounded-full transition-all ${i === activeImageIndex ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        {profile.isPremium && (
          <div className="absolute top-12 right-4 bg-yellow-500 rounded-full p-2 shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
          <h1 className="text-3xl font-bold text-white mb-1">{profile.name}, {profile.age}</h1>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.distance}</span>
            <span>•</span>
            <span>{profile.commonInterests} common interests</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex px-4 gap-1">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 max-w-lg mx-auto">
        {renderTabContent()}
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/30 p-4 z-40">
        <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="w-14 h-14 rounded-full bg-card border border-border shadow-card flex items-center justify-center active:scale-90 transition-all">
            <span className="text-2xl">✕</span>
          </button>
          <button onClick={handlePassAction} className="w-16 h-16 rounded-full bg-gradient-primary shadow-elegant flex items-center justify-center active:scale-90 transition-all">
            <span className="text-3xl">❤️</span>
          </button>
          <button className="w-14 h-14 rounded-full bg-card border border-border shadow-card flex items-center justify-center active:scale-90 transition-all">
            <Star className="w-6 h-6 text-yellow-500" />
          </button>
        </div>
      </div>

      {showMatchCelebration && (
        <NewMatchCelebration matchedProfile={{ name: profile.name, image: profile.image, age: profile.age }} onClose={() => { setShowMatchCelebration(false); navigate(-1); }} />
      )}
    </div>
  );
};

export default ProfileDetail;
