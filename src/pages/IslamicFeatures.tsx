import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Compass, 
  Calendar, 
  BookOpen, 
  Shield, 
  MapPin, 
  Heart,
  Moon,
  Sun,
  Navigation,
  Book,
  Users,
  AlertTriangle,
  Phone,
  Info,
  Star,
  Sparkles,
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
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
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
          calculateQiblaDirection(latitude, longitude);
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

  const calculateQiblaDirection = (lat: number, lng: number) => {
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    
    const deltaLng = (kaabaLng - lng) * Math.PI / 180;
    const lat1Rad = lat * Math.PI / 180;
    const lat2Rad = kaabaLat * Math.PI / 180;
    
    const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    setQiblaDirection(bearing);
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
    }
  ];

  const islamicGuidance = [
    {
      title: "Marriage in Islam",
      content: "Marriage (Nikah) is considered half of one's faith in Islam. It's a sacred bond that should be entered with the intention of pleasing Allah."
    },
    {
      title: "Choosing a Spouse",
      content: "The Prophet (PBUH) said: 'A woman is married for four things: her wealth, her family status, her beauty, and her religion. Choose the one who is religious.'"
    },
    {
      title: "Islamic Courtship",
      content: "Getting to know someone for marriage should be done with proper boundaries, respect, and the involvement of families."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Islamic Features
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Essential tools for your Islamic lifestyle and spiritual journey
          </p>
        </motion.div>

        <Tabs defaultValue="prayers" className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 h-12 bg-white/80 backdrop-blur-md border shadow-lg rounded-xl">
            <TabsTrigger value="prayers" className="flex items-center gap-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Prayer</span>
            </TabsTrigger>
            <TabsTrigger value="deen" className="flex items-center gap-2 rounded-lg">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">Deen</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2 rounded-lg">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Safety</span>
            </TabsTrigger>
            <TabsTrigger value="guidance" className="flex items-center gap-2 rounded-lg">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guidance</span>
            </TabsTrigger>
          </TabsList>

          {/* Prayer Tab Content */}
          <TabsContent value="prayers" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-emerald-700">Current Time</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl md:text-5xl font-mono font-bold text-gray-900">
                        {currentTime.toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </div>
                      {islamicDate && (
                        <div className="space-y-2 p-4 bg-emerald-50 rounded-xl">
                          <div className="text-sm text-gray-600">
                            {islamicDate.gregorian}
                          </div>
                          <div className="text-lg font-semibold text-emerald-700 flex items-center justify-center gap-2">
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
                  <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                          <nextPrayer.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-amber-700">Next Prayer</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold text-amber-700 mb-2">
                        {nextPrayer.name}
                      </div>
                      <div className="text-3xl font-mono font-bold text-gray-900 p-3 bg-amber-50 rounded-xl">
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
                <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-purple-700">Prayer Times</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { name: 'Fajr', time: prayerTimes.fajr, icon: Sun, color: 'blue' },
                        { name: 'Sunrise', time: prayerTimes.sunrise, icon: Sun, color: 'yellow' },
                        { name: 'Dhuhr', time: prayerTimes.dhuhr, icon: Sun, color: 'orange' },
                        { name: 'Asr', time: prayerTimes.asr, icon: Sun, color: 'amber' },
                        { name: 'Maghrib', time: prayerTimes.maghrib, icon: Moon, color: 'purple' },
                        { name: 'Isha', time: prayerTimes.isha, icon: Moon, color: 'indigo' }
                      ].map((prayer) => (
                        <div
                          key={prayer.name}
                          className={`p-4 bg-gradient-to-br from-${prayer.color}-500 to-${prayer.color}-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-lg">{prayer.name}</div>
                              <div className="font-mono text-sm opacity-90">
                                {formatTime(prayer.time)}
                              </div>
                            </div>
                            <prayer.icon className="w-6 h-6 opacity-80" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Qibla Direction */}
            {qiblaDirection !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <Compass className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-green-700">Qibla Direction</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex justify-center mb-6">
                      <div className="relative w-32 h-32">
                        {/* Compass Circle */}
                        <div className="absolute inset-0 rounded-full border-4 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-inner">
                          {/* Cardinal Directions */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-green-700">N</div>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-green-700">E</div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-green-700">S</div>
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-green-700">W</div>
                        </div>
                        
                        {/* Qibla Arrow */}
                        <div 
                          className="absolute top-4 left-1/2 w-1 h-12 bg-gradient-to-t from-green-600 to-green-400 origin-bottom transform -translate-x-1/2 rounded-full shadow-lg"
                          style={{ transform: `translateX(-50%) rotate(${qiblaDirection}deg)` }}
                        />
                        
                        {/* Center Point */}
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      {Math.round(qiblaDirection)}°
                    </div>
                    <p className="text-sm text-gray-600">from North towards Mecca</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Deen Tab Content */}
          <TabsContent value="deen" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                      <Book className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-amber-700">Daily Duas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {dailyDuas.map((dua, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Gem className="w-4 h-4 text-amber-500" />
                          <h4 className="font-semibold text-lg text-amber-700">{dua.title}</h4>
                        </div>
                        <div className="text-right text-xl font-arabic leading-relaxed text-gray-800 p-4 bg-white/60 rounded-lg">
                          {dua.arabic}
                        </div>
                        <div className="text-sm italic text-amber-600 font-medium bg-amber-100 p-3 rounded-lg">
                          {dua.transliteration}
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {dua.translation}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Islamic Reminders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-green-700">Daily Reminders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth. - Quran 6:73",
                    "The believer is not one who eats his fill while his neighbor goes hungry. - Prophet Muhammad (PBUH)"
                  ].map((reminder, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <Eye className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed italic">{reminder}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Safety Tab Content */}
          <TabsContent value="safety" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-red-700">Safety Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {safetyTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200"
                    >
                      <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex-shrink-0">
                        <tip.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-red-700 mb-1">{tip.title}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{tip.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-orange-700">Emergency Resources</span>
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
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                    >
                      <span className="font-medium text-gray-800">{item.label}</span>
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
          <TabsContent value="guidance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-purple-700">Islamic Marriage Guidance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {islamicGuidance.map((guide, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-500" />
                          <h4 className="font-semibold text-lg text-purple-700">{guide.title}</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {guide.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Helpful Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <Info className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-blue-700">Helpful Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: MapPin, label: "Find Nearby Mosques", color: "green" },
                    { icon: BookOpen, label: "Islamic Library", color: "blue" },
                    { icon: Users, label: "Community Groups", color: "purple" },
                    { icon: Phone, label: "Islamic Counseling", color: "orange" }
                  ].map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className={`p-2 bg-gradient-to-br from-${resource.color}-500 to-${resource.color}-600 rounded-lg mr-3`}>
                          <resource.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-800">{resource.label}</span>
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