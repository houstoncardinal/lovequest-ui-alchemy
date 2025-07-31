import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Shield, 
  MapPin, 
  Heart,
  Moon,
  Sun,
  Book,
  Users,
  AlertTriangle,
  Phone,
  Info,
  Star,
  Eye,
  Gem
} from 'lucide-react';

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface IslamicDate {
  hijri: string;
  gregorian: string;
}

const IslamicFeatures = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [islamicDate, setIslamicDate] = useState<IslamicDate | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchPrayerTimes(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=2`
      );
      const data = await response.json();
      
      if (data.data) {
        setPrayerTimes({
          fajr: data.data.timings.Fajr,
          sunrise: data.data.timings.Sunrise,
          dhuhr: data.data.timings.Dhuhr,
          asr: data.data.timings.Asr,
          maghrib: data.data.timings.Maghrib,
          isha: data.data.timings.Isha,
        });
        
        setIslamicDate({
          hijri: `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`,
          gregorian: `${data.data.date.readable}`
        });
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr, icon: Sun },
      { name: 'Dhuhr', time: prayerTimes.dhuhr, icon: Sun },
      { name: 'Asr', time: prayerTimes.asr, icon: Sun },
      { name: 'Maghrib', time: prayerTimes.maghrib, icon: Moon },
      { name: 'Isha', time: prayerTimes.isha, icon: Moon },
    ];
    
    for (const prayer of prayers) {
      if (prayer.time > currentTimeStr) {
        return prayer;
      }
    }
    
    return { name: 'Fajr', time: prayerTimes.fajr, icon: Sun }; // Next day's Fajr
  };

  const nextPrayer = getNextPrayer();

  const dailyDuas = [
    {
      title: "Morning Dua",
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
      transliteration: "Asbahna wa asbahal-mulku lillah",
      translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty."
    },
    {
      title: "Evening Dua", 
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
      transliteration: "Amsayna wa amsal-mulku lillah",
      translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty."
    },
    {
      title: "Before Eating",
      arabic: "بِسْمِ اللَّهِ",
      transliteration: "Bismillah",
      translation: "In the name of Allah"
    },
    {
      title: "After Eating",
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
      transliteration: "Alhamdulillahi-lladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
      translation: "All praise is due to Allah who has fed me this and provided it for me without any might or power on my part."
    }
  ];

  const safetyTips = [
    {
      icon: Users,
      title: "Meet in Public Places",
      description: "Always meet your potential match in crowded, public locations for the first few meetings."
    },
    {
      icon: Shield,
      title: "Involve Your Wali",
      description: "Consider involving your wali (guardian) in the process as per Islamic guidelines."
    },
    {
      icon: Phone,
      title: "Share Your Plans",
      description: "Inform trusted family members or friends about your meeting plans and location."
    },
    {
      icon: AlertTriangle,
      title: "Trust Your Instincts",
      description: "If something doesn't feel right, don't hesitate to end the conversation or meeting."
    },
    {
      icon: Heart,
      title: "Maintain Islamic Boundaries",
      description: "Keep interactions halal and within the boundaries of Islamic teachings."
    },
    {
      icon: Eye,
      title: "Verify Identity",
      description: "Take time to verify the person's identity and background through proper channels."
    }
  ];

  const islamicGuidance = [
    {
      title: "Marriage in Islam",
      content: "Marriage (Nikah) is considered half of one's faith in Islam. It's a sacred bond that should be entered with the intention of pleasing Allah and building a righteous family."
    },
    {
      title: "Choosing a Spouse",
      content: "The Prophet (PBUH) said: 'A woman is married for four things: her wealth, her family status, her beauty, and her religion. Choose the one who is religious, may your hands be rubbed with dust (i.e., may you prosper).'"
    },
    {
      title: "Islamic Courtship",
      content: "Getting to know someone for marriage should be done with proper boundaries, respect, and the involvement of families. Focus on character, values, and compatibility."
    },
    {
      title: "Family Values",
      content: "Islam emphasizes the importance of family unity, mutual respect, and shared responsibilities between spouses in creating a harmonious household."
    },
    {
      title: "Seeking Allah's Guidance",
      content: "Perform Istikhara (seeking Allah's guidance through prayer) when making important decisions about marriage and life partnerships."
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-primary rounded-2xl shadow-elegant flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Islamic Features
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Essential tools for your Islamic lifestyle and spiritual journey
          </p>
        </motion.div>

        <Tabs defaultValue="prayers" className="space-y-8">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 h-14 bg-card border rounded-2xl p-1">
            <TabsTrigger value="prayers" className="flex items-center gap-2 rounded-xl h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Prayer</span>
            </TabsTrigger>
            <TabsTrigger value="deen" className="flex items-center gap-2 rounded-xl h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Deen</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2 rounded-xl h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Safety</span>
            </TabsTrigger>
            <TabsTrigger value="guidance" className="flex items-center gap-2 rounded-xl h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Guidance</span>
            </TabsTrigger>
          </TabsList>

          {/* Prayer Tab Content */}
          <TabsContent value="prayers" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 bg-primary rounded-xl">
                        <Clock className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <span className="text-xl text-foreground">Current Time</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-2xl md:text-3xl font-mono font-semibold text-foreground">
                        {currentTime.toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </div>
                      {islamicDate && (
                        <div className="space-y-2 p-4 bg-muted rounded-xl">
                          <div className="text-xs text-muted-foreground">
                            {islamicDate.gregorian}
                          </div>
                          <div className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                            <Moon className="w-4 h-4" />
                            {islamicDate.hijri} AH
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Next Prayer */}
              {nextPrayer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-3 bg-accent rounded-xl">
                          <nextPrayer.icon className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <span className="text-xl text-foreground">Next Prayer</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-lg font-semibold text-foreground mb-2">
                        {nextPrayer.name}
                      </div>
                      <div className="text-xl font-mono font-semibold text-foreground p-3 bg-muted rounded-lg">
                        {formatTime(nextPrayer.time)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Prayer Times Grid */}
            {prayerTimes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 bg-secondary rounded-xl">
                        <Calendar className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <span className="text-xl text-foreground">Prayer Times</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { name: 'Fajr', time: prayerTimes.fajr, icon: Sun },
                        { name: 'Sunrise', time: prayerTimes.sunrise, icon: Sun },
                        { name: 'Dhuhr', time: prayerTimes.dhuhr, icon: Sun },
                        { name: 'Asr', time: prayerTimes.asr, icon: Sun },
                        { name: 'Maghrib', time: prayerTimes.maghrib, icon: Moon },
                        { name: 'Isha', time: prayerTimes.isha, icon: Moon }
                      ].map((prayer) => (
                        <div
                          key={prayer.name}
                          className="p-3 bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-foreground group-hover:text-accent-foreground">{prayer.name}</div>
                              <div className="font-mono text-xs text-muted-foreground group-hover:text-accent-foreground/80">
                                {formatTime(prayer.time)}
                              </div>
                            </div>
                            <prayer.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground/80" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Deen Tab Content */}
          <TabsContent value="deen" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-primary rounded-xl">
                      <Book className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl text-foreground">Daily Duas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-6 pr-4">
                      {dailyDuas.map((dua, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-4 bg-muted rounded-lg"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Gem className="w-4 h-4 text-primary" />
                              <h4 className="font-medium text-sm text-foreground">{dua.title}</h4>
                            </div>
                            <div className="text-right text-lg leading-relaxed text-foreground p-3 bg-card rounded-lg">
                              {dua.arabic}
                            </div>
                            <div className="text-xs italic text-muted-foreground font-medium bg-accent/20 p-2 rounded-lg">
                              {dua.transliteration}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              {dua.translation}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Islamic Reminders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-secondary rounded-xl">
                      <Heart className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <span className="text-xl text-foreground">Daily Reminders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth. - Quran 6:73",
                    "The believer is not one who eats his fill while his neighbor goes hungry. - Prophet Muhammad (PBUH)",
                    "The world is green and beautiful, and Allah has appointed you as His stewards over it. - Prophet Muhammad (PBUH)"
                  ].map((reminder, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground leading-relaxed italic">{reminder}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Safety Tab Content */}
          <TabsContent value="safety" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-destructive rounded-xl">
                      <Shield className="h-6 w-6 text-destructive-foreground" />
                    </div>
                    <span className="text-xl text-foreground">Safety Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4 pr-4">
                      {safetyTips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex gap-4 p-4 bg-muted rounded-xl"
                        >
                          <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                            <tip.icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-foreground mb-1">{tip.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-destructive rounded-xl">
                      <Phone className="h-6 w-6 text-destructive-foreground" />
                    </div>
                    <span className="text-xl text-foreground">Emergency Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Emergency Services", contact: "911", variant: "destructive" as const },
                    { label: "Crisis Text Line", contact: "Text HOME to 741741", variant: "secondary" as const },
                    { label: "National Domestic Violence Hotline", contact: "1-800-799-7233", variant: "secondary" as const }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex justify-between items-center p-4 bg-muted rounded-xl"
                    >
                      <span className="font-medium text-foreground">{item.label}</span>
                      <Badge variant={item.variant} className="text-xs font-mono">
                        {item.contact}
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Guidance Tab Content */}
          <TabsContent value="guidance" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-secondary rounded-xl">
                      <BookOpen className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <span className="text-xl text-foreground">Islamic Marriage Guidance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-6 pr-4">
                      {islamicGuidance.map((guide, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-6 bg-muted rounded-xl"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-lg text-foreground">{guide.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {guide.content}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Helpful Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-primary rounded-xl">
                      <Info className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl text-foreground">Helpful Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: MapPin, label: "Find Nearby Mosques" },
                    { icon: BookOpen, label: "Islamic Library" },
                    { icon: Users, label: "Community Groups" },
                    { icon: Phone, label: "Islamic Counseling" }
                  ].map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-14 bg-muted hover:bg-accent border-0 transition-all duration-300"
                      >
                        <div className="p-2 bg-primary rounded-lg mr-3">
                          <resource.icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{resource.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IslamicFeatures;