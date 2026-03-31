import { useState, useRef } from "react";
import { MapPin, ArrowLeft, Star, Play, Pause, Crown, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import InterestTag from "@/components/InterestTag";
import { Badge } from "@/components/ui/badge";
import NewMatchCelebration from "@/components/NewMatchCelebration";
import { getDemoProfileDetail } from "@/data/demoData";

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
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Bio</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">About Me</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: "👤", val: profile.details.gender },
                  { icon: "📏", val: profile.details.height },
                  { icon: "🌙", val: profile.details.religion },
                  { icon: "♉", val: profile.details.zodiac },
                  { icon: "🍷", val: profile.details.drinking },
                  { icon: "🚬", val: profile.details.smoking },
                ].map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center p-2.5 bg-muted/40 rounded-xl"
                  >
                    <span className="mr-2.5 text-base">{d.icon}</span>
                    <span className="text-muted-foreground text-xs font-medium">{d.val}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Work & Education</h3>
              <div className="space-y-2.5">
                <div className="flex items-center p-2.5 bg-muted/40 rounded-xl">
                  <span className="mr-2.5 text-base">💼</span>
                  <span className="text-muted-foreground text-xs font-medium">{profile.details.jobTitle} at {profile.details.company}</span>
                </div>
                <div className="flex items-center p-2.5 bg-muted/40 rounded-xl">
                  <span className="mr-2.5 text-base">🎓</span>
                  <span className="text-muted-foreground text-xs font-medium">{profile.details.education}</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <InterestTag icon={interest.icon} label={interest.label} variant={interest.highlighted ? 'highlighted' : 'default'} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">My Values</h3>
              <div className="flex flex-wrap gap-2">
                {profile.values.map((value, index) => (
                  <Badge key={index} className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">{value}</Badge>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case "Photos":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-3">
            {profile.photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-card rounded-2xl shadow-sm border border-border/30 overflow-hidden"
              >
                <img src={photo.url} alt={photo.caption} className="w-full h-56 object-cover" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-medium">{photo.caption}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      case "Voice":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {profile.voiceNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-sm border border-border/30 p-4"
              >
                <p className="text-xs font-medium text-foreground mb-2">{note.prompt}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => playVoiceNote(note.id)} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center transition-transform active:scale-90">
                    {playingVoiceNote === note.id ? <Pause className="w-3.5 h-3.5 text-primary-foreground" /> : <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />}
                  </button>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: playingVoiceNote === note.id ? '66%' : '0%' }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{note.duration}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      case "Lifestyle":
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Pets", val: profile.lifestyle.pets },
                  { label: "Workout", val: profile.lifestyle.workout },
                  { label: "Diet", val: profile.lifestyle.diet },
                  { label: "Social", val: profile.lifestyle.socialLevel },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 bg-muted/40 rounded-xl"
                  >
                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs font-medium text-foreground">{item.val}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-44 md:pb-24">
      {/* Hero Image */}
      <div className="relative h-[50vh] overflow-hidden">
        <motion.img
          key={activeImageIndex}
          src={profile.images[activeImageIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        {/* Image indicators */}
        <div className="absolute top-4 left-4 right-4 flex gap-1.5">
          {profile.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImageIndex(i)}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'bg-white shadow-sm' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        {profile.isPremium && (
          <div className="absolute top-12 right-4 bg-amber-500 rounded-full p-1.5 shadow-lg">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 pb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-1"
          >
            {profile.name}, {profile.age}
          </motion.h1>
          <div className="flex items-center gap-2.5 text-white/80 text-xs">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.distance}</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>{profile.commonInterests} common interests</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="flex px-4 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 max-w-lg mx-auto">
        {renderTabContent()}
      </div>

      {/* Action Bar — floating above the mobile bottom nav */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 py-4 px-4 z-40 pointer-events-none">
        <div className="flex items-center justify-center gap-6 max-w-lg mx-auto pointer-events-auto">
          <motion.button
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.85 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-lg border border-border/40 shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:bg-destructive/10 hover:border-destructive/30 active:bg-destructive/20"
          >
            <span className="text-base font-semibold text-muted-foreground">✕</span>
          </motion.button>
          <motion.button
            onClick={handlePassAction}
            whileTap={{ scale: 0.85 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
          >
            <Heart className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-lg border border-border/40 shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:bg-amber-500/10 hover:border-amber-400/30 active:bg-amber-500/20"
          >
            <Star className="w-5 h-5 text-amber-500" />
          </motion.button>
        </div>
      </div>

      {showMatchCelebration && (
        <NewMatchCelebration matchedProfile={{ name: profile.name, image: profile.image, age: profile.age }} onClose={() => { setShowMatchCelebration(false); navigate(-1); }} />
      )}
    </div>
  );
};

export default ProfileDetail;
