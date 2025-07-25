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
  Zap,
  Eye,
  Crown,
  Gem,
  Infinity as InfinityIcon,
  ArrowUp
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

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Sunrise', time: prayerTimes.sunrise },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha },
    ];
    
    for (const prayer of prayers) {
      if (prayer.time > currentTimeStr) {
        return prayer;
      }
    }
    
    return { name: 'Fajr', time: prayerTimes.fajr }; // Next day's Fajr
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-emerald-400/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: 999999, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200/30 to-amber-400/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: 999999, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-purple-300/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 15, repeat: 999999 }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 pb-24 relative z-10">
        {/* Hero Header with Islamic Pattern */}
        <motion.div 
          className="mb-12 text-center relative"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/10 rounded-3xl -m-8"></div>
          <motion.div
            className="relative"
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: 999999 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-2xl mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
              <Star className="w-10 h-10 text-white relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: 999999, ease: "linear" }}
              />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Islamic Features
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive tools and guidance for your Islamic lifestyle, marriage journey, and spiritual growth
          </p>
          <motion.div
            className="flex items-center justify-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Blessed & Verified</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Tabs defaultValue="prayers" className="space-y-8">
            {/* Enhanced Tab Navigation */}
            <div className="relative">
              <TabsList className="grid w-full grid-cols-4 h-16 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2">
                <TabsTrigger 
                  value="prayers" 
                  className="h-12 rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Prayer
                </TabsTrigger>
                <TabsTrigger 
                  value="deen" 
                  className="h-12 rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Deen
                </TabsTrigger>
                <TabsTrigger 
                  value="safety" 
                  className="h-12 rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Safety
                </TabsTrigger>
                <TabsTrigger 
                  value="guidance" 
                  className="h-12 rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Guidance
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Prayer Tab Content */}
            <TabsContent value="prayers" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Current Time Card - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-2"
                >
                  <Card className="bg-gradient-to-br from-white via-emerald-50 to-white border-emerald-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-amber-500/5"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <motion.div
                          className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Clock className="h-6 w-6 text-white" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent font-bold">
                          Current Time
                        </span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: 999999 }}
                        >
                          <Sparkles className="w-5 h-5 text-emerald-500" />
                        </motion.div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-center space-y-4">
                        <motion.div 
                          className="text-5xl font-mono font-bold text-gray-800 tracking-wider"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 1, repeat: 999999 }}
                        >
                          {currentTime.toLocaleTimeString()}
                        </motion.div>
                        <AnimatePresence>
                          {islamicDate && (
                            <motion.div 
                              className="space-y-2 p-4 bg-white/60 rounded-2xl backdrop-blur-sm"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <div className="text-sm text-gray-600 font-medium">
                                {islamicDate.gregorian}
                              </div>
                              <div className="text-lg font-bold text-emerald-700 flex items-center justify-center gap-2">
                                <Moon className="w-5 h-5" />
                                {islamicDate.hijri} AH
                                <Moon className="w-5 h-5" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Next Prayer Card - Enhanced */}
                <AnimatePresence>
                  {nextPrayer && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className="bg-gradient-to-br from-white via-amber-50 to-white border-amber-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10"></div>
                        <CardHeader className="relative">
                          <CardTitle className="flex items-center gap-3">
                            <motion.div
                              className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 4, repeat: 999999 }}
                            >
                              <Moon className="h-6 w-6 text-white" />
                            </motion.div>
                            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent font-bold">
                              Next Prayer
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="relative text-center">
                          <motion.div 
                            className="text-2xl font-bold text-amber-700 mb-2"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: 999999 }}
                          >
                            {nextPrayer.name}
                          </motion.div>
                          <div className="text-3xl font-mono font-bold text-gray-800 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                            {nextPrayer.time}
                          </div>
                          <motion.div
                            className="mt-3 flex justify-center"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: 999999 }}
                          >
                            <ArrowUp className="w-5 h-5 text-amber-500" />
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Prayer Times Grid - Enhanced */}
              <AnimatePresence>
                {prayerTimes && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card className="bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-purple-500/5 to-amber-500/5"></div>
                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <motion.div
                            className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                          >
                            <Calendar className="h-6 w-6 text-white" />
                          </motion.div>
                          <span className="bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent font-bold">
                            Prayer Times
                          </span>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 10, repeat: 999999, ease: "linear" }}
                          >
                            <InfinityIcon className="w-5 h-5 text-purple-500" />
                          </motion.div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { name: 'Fajr', time: prayerTimes.fajr, icon: Sun, color: 'from-blue-500 to-blue-600' },
                            { name: 'Sunrise', time: prayerTimes.sunrise, icon: Sun, color: 'from-yellow-500 to-orange-500' },
                            { name: 'Dhuhr', time: prayerTimes.dhuhr, icon: Sun, color: 'from-orange-500 to-red-500' },
                            { name: 'Asr', time: prayerTimes.asr, icon: Sun, color: 'from-amber-500 to-yellow-600' },
                            { name: 'Maghrib', time: prayerTimes.maghrib, icon: Moon, color: 'from-purple-500 to-purple-600' },
                            { name: 'Isha', time: prayerTimes.isha, icon: Moon, color: 'from-indigo-500 to-purple-600' }
                          ].map((prayer, index) => (
                            <motion.div
                              key={prayer.name}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              className={`p-4 bg-gradient-to-br ${prayer.color} rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="flex items-center justify-between relative z-10">
                                <div>
                                  <div className="font-bold text-lg">{prayer.name}</div>
                                  <div className="font-mono text-sm opacity-90">{prayer.time}</div>
                                </div>
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 3, repeat: 999999, delay: index * 0.2 }}
                                >
                                  <prayer.icon className="w-6 h-6" />
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Qibla Direction - Enhanced */}
              <AnimatePresence>
                {qiblaDirection !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card className="bg-gradient-to-br from-white via-green-50 to-white border-green-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <motion.div
                            className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: 999999, ease: "linear" }}
                          >
                            <Compass className="h-6 w-6 text-white" />
                          </motion.div>
                          <span className="bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent font-bold">
                            Qibla Direction
                          </span>
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: 999999 }}
                          >
                            <Navigation className="w-5 h-5 text-green-500" />
                          </motion.div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative text-center">
                        <div className="flex justify-center mb-6">
                          <div className="relative w-40 h-40">
                            {/* Compass Background */}
                            <motion.div 
                              className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-green-400 to-emerald-400 shadow-lg"
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 30, repeat: 999999, ease: "linear" }}
                            >
                              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white via-green-50 to-emerald-50 shadow-inner"></div>
                            </motion.div>
                            
                            {/* Qibla Arrow */}
                            <motion.div 
                              className="absolute top-4 left-1/2 w-1 h-16 bg-gradient-to-t from-green-600 to-emerald-500 origin-bottom transform -translate-x-1/2 rounded-full shadow-lg"
                              style={{ transform: `translateX(-50%) rotate(${qiblaDirection}deg)` }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: 999999 }}
                            />
                            
                            {/* Center Point */}
                            <motion.div 
                              className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: 999999 }}
                            />
                            
                            {/* Compass Directions */}
                            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-green-700">N</div>
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-green-700">E</div>
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-green-700">S</div>
                            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-green-700">W</div>
                          </div>
                        </div>
                        
                        <motion.div 
                          className="text-2xl font-bold text-green-700 p-3 bg-white/60 rounded-xl backdrop-blur-sm inline-block"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: 999999 }}
                        >
                          {Math.round(qiblaDirection)}° from North
                        </motion.div>
                        <p className="text-sm text-gray-600 mt-2 italic">Point toward Mecca</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Deen Tab Content - Enhanced */}
            <TabsContent value="deen" className="space-y-6">
              {/* Daily Duas - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-white via-amber-50 to-white border-amber-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <Book className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent font-bold">
                        Daily Duas
                      </span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: 999999 }}
                      >
                        <Star className="w-5 h-5 text-amber-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    {dailyDuas.map((dua, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        className="p-6 bg-gradient-to-r from-white via-amber-50 to-white rounded-2xl border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative space-y-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 8, repeat: 999999, ease: "linear", delay: index }}
                            >
                              <Gem className="w-5 h-5 text-amber-500" />
                            </motion.div>
                            <h4 className="font-bold text-lg text-amber-700">{dua.title}</h4>
                          </div>
                          <div className="text-right text-2xl font-arabic leading-relaxed text-gray-800 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                            {dua.arabic}
                          </div>
                          <div className="text-sm italic text-amber-600 font-medium bg-amber-50 p-3 rounded-lg">
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

              {/* Islamic Reminders - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-white via-green-50 to-white border-green-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <Heart className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent font-bold">
                        Daily Reminders
                      </span>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <Sparkles className="w-5 h-5 text-green-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    {[
                      "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth. - Quran 6:73",
                      "The believer is not one who eats his fill while his neighbor goes hungry. - Prophet Muhammad (PBUH)"
                    ].map((reminder, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="p-6 bg-gradient-to-r from-white via-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-start gap-3 relative">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: 999999, delay: index }}
                          >
                            <Eye className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                          </motion.div>
                          <p className="text-sm text-gray-700 leading-relaxed italic">{reminder}</p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Safety Tab Content - Enhanced */}
            <TabsContent value="safety" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-white via-red-50 to-white border-red-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-rose-500/5"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <Shield className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent font-bold">
                        Safety Guidelines
                      </span>
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: 999999 }}
                      >
                        <Zap className="w-5 h-5 text-red-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative grid gap-6">
                    {safetyTips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        className="flex gap-4 p-6 bg-gradient-to-r from-white via-red-50 to-white rounded-2xl border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <motion.div
                          className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex-shrink-0"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          <tip.icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="relative">
                          <h4 className="font-bold text-lg text-red-700 mb-2">{tip.title}</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{tip.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Emergency Contacts - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-white via-orange-50 to-white border-orange-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg"
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: 999999 }}
                      >
                        <Phone className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-orange-700 to-red-600 bg-clip-text text-transparent font-bold">
                        Emergency Resources
                      </span>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    {[
                      { label: "Emergency Services", contact: "911", variant: "destructive" as const },
                      { label: "Crisis Text Line", contact: "Text HOME to 741741", variant: "secondary" as const },
                      { label: "National Domestic Violence Hotline", contact: "1-800-799-7233", variant: "secondary" as const }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-white via-orange-50 to-white rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <span className="font-semibold text-gray-800">{item.label}</span>
                        <Badge variant={item.variant} className="text-sm font-mono">
                          {item.contact}
                        </Badge>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Guidance Tab Content - Enhanced */}
            <TabsContent value="guidance" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-white via-purple-50 to-white border-purple-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg"
                        whileHover={{ scale: 1.1, rotate: -10 }}
                      >
                        <BookOpen className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent font-bold">
                        Islamic Marriage Guidance
                      </span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <Crown className="w-5 h-5 text-purple-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    {islamicGuidance.map((guide, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        className="p-6 bg-gradient-to-r from-white via-purple-50 to-white rounded-2xl border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative space-y-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 10, repeat: 999999, ease: "linear", delay: index }}
                            >
                              <Star className="w-5 h-5 text-purple-500" />
                            </motion.div>
                            <h4 className="font-bold text-lg text-purple-700">{guide.title}</h4>
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

              {/* Helpful Resources - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-white via-blue-50 to-white border-blue-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <Info className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent font-bold">
                        Helpful Resources
                      </span>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: 999999 }}
                      >
                        <Sparkles className="w-5 h-5 text-blue-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    {[
                      { icon: MapPin, label: "Find Nearby Mosques", color: "from-green-500 to-emerald-500" },
                      { icon: BookOpen, label: "Islamic Library", color: "from-blue-500 to-indigo-500" },
                      { icon: Users, label: "Community Groups", color: "from-purple-500 to-pink-500" },
                      { icon: Phone, label: "Islamic Counseling", color: "from-orange-500 to-red-500" }
                    ].map((resource, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-16 bg-gradient-to-r from-white via-blue-50 to-white border-blue-200/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <motion.div
                            className={`p-2 bg-gradient-to-br ${resource.color} rounded-xl shadow-lg mr-3 relative`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <resource.icon className="h-5 w-5 text-white" />
                          </motion.div>
                          <span className="font-semibold text-gray-800 relative">{resource.label}</span>
                          <motion.div
                            className="ml-auto relative"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: 999999 }}
                          >
                            <ArrowUp className="h-4 w-4 text-blue-500 rotate-45" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default IslamicFeatures;