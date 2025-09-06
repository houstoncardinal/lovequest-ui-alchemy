import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Star, MapPin, Calendar, Heart, Coffee, Utensils, Music, BookOpen, Camera, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LifestyleFeatures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Daily lifestyle tips
  const dailyTips = [
    {
      title: "Self-Care Sunday",
      description: "Take time for yourself today - try meditation, a spa day, or your favorite hobby",
      icon: Heart,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Fitness Monday", 
      description: "Start your week strong with a workout or outdoor activity",
      icon: Dumbbell,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Cultural Tuesday",
      description: "Explore art, music, or literature from different cultures",
      icon: Music,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Adventure Wednesday",
      description: "Try something new - a restaurant, activity, or place you've never been",
      icon: MapPin,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Social Thursday",
      description: "Connect with friends, family, or meet new people in your community",
      icon: Coffee,
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "Learning Friday",
      description: "Expand your knowledge with a book, course, or documentary",
      icon: BookOpen,
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Photo Saturday",
      description: "Capture memories and beautiful moments around you",
      icon: Camera,
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const getTodaysTip = () => {
    const dayIndex = new Date().getDay();
    return dailyTips[dayIndex];
  };

  const todaysTip = getTodaysTip();
  const TodayIcon = todaysTip.icon;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Lifestyle & Tips</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Current Time and Today's Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-gradient-to-r from-background to-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">{formatTime(currentTime)}</p>
                  <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
              
              <div className={`bg-gradient-to-r ${todaysTip.color} p-4 rounded-xl text-white`}>
                <div className="flex items-center gap-3">
                  <TodayIcon className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{todaysTip.title}</h3>
                    <p className="text-white/90 text-sm">{todaysTip.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Tips Grid */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-foreground">Weekly Lifestyle Tips</h3>
          {dailyTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${tip.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{tip.title}</h3>
                        <p className="text-muted-foreground text-sm">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LifestyleFeatures;