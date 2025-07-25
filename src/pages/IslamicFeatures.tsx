import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Info
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Islamic Features</h1>
          <p className="text-muted-foreground">Helpful tools and information for your Islamic lifestyle</p>
        </div>

        <Tabs defaultValue="prayers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prayers">Prayer</TabsTrigger>
            <TabsTrigger value="deen">Deen</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
          </TabsList>

          <TabsContent value="prayers" className="space-y-4">
            {/* Current Time and Islamic Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-mono">
                    {currentTime.toLocaleTimeString()}
                  </div>
                  {islamicDate && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {islamicDate.gregorian}
                      </div>
                      <div className="text-sm font-medium">
                        {islamicDate.hijri} AH
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Prayer */}
            {nextPrayer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Next Prayer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {nextPrayer.name}
                    </div>
                    <div className="text-lg font-mono">
                      {nextPrayer.time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prayer Times */}
            {prayerTimes && (
              <Card>
                <CardHeader>
                  <CardTitle>Prayer Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Fajr</span>
                      <span className="font-mono">{prayerTimes.fajr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sunrise</span>
                      <span className="font-mono">{prayerTimes.sunrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dhuhr</span>
                      <span className="font-mono">{prayerTimes.dhuhr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Asr</span>
                      <span className="font-mono">{prayerTimes.asr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Maghrib</span>
                      <span className="font-mono">{prayerTimes.maghrib}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Isha</span>
                      <span className="font-mono">{prayerTimes.isha}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Qibla Direction */}
            {qiblaDirection !== null && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Qibla Direction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-muted-foreground"></div>
                      <div 
                        className="absolute top-0 left-1/2 w-1 h-16 bg-primary origin-bottom transform -translate-x-1/2"
                        style={{ transform: `translateX(-50%) rotate(${qiblaDirection}deg)` }}
                      ></div>
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    <div className="text-lg font-bold">
                      {Math.round(qiblaDirection)}° from North
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deen" className="space-y-4">
            {/* Daily Duas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Daily Duas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {dailyDuas.map((dua, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-primary">{dua.title}</h4>
                    <div className="text-right text-lg font-arabic leading-relaxed">
                      {dua.arabic}
                    </div>
                    <div className="text-sm italic text-muted-foreground">
                      {dua.transliteration}
                    </div>
                    <div className="text-sm">
                      {dua.translation}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Islamic Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Daily Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">"And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth." - Quran 6:73</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">"The believer is not one who eats his fill while his neighbor goes hungry." - Prophet Muhammad (PBUH)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-muted rounded-lg">
                      <tip.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Emergency Services</span>
                    <Badge variant="destructive">911</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Crisis Text Line</span>
                    <Badge variant="secondary">Text HOME to 741741</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">National Domestic Violence Hotline</span>
                    <Badge variant="secondary">1-800-799-7233</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Islamic Marriage Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {islamicGuidance.map((guide, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-primary">{guide.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {guide.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Helpful Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Helpful Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Nearby Mosques
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Islamic Calendar & Events
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Marriage Preparation Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IslamicFeatures;