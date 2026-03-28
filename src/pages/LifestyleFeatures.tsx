import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Star, MapPin, Calendar, Heart, Coffee, Utensils, Music, BookOpen, Camera, Dumbbell, Plus, Target, TrendingUp, Award, Smile, Frown, Meh, Zap, Moon, Sun, Activity, Droplets as Water, Flame, CheckCircle2, Circle, Settings as SettingsIcon, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LifestyleFeatures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");

  // Wellness tracking data
  const [todaysMood, setTodaysMood] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState(4);
  const [journalEntry, setJournalEntry] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [goals, setGoals] = useState([
    { id: 1, text: "Drink 8 glasses of water daily", completed: false, category: "health" },
    { id: 2, text: "Meditate for 10 minutes", completed: true, category: "mindfulness" },
    { id: 3, text: "Read 30 pages of a book", completed: false, category: "learning" },
    { id: 4, text: "Take a 20-minute walk", completed: true, category: "fitness" },
  ]);

  const { toast } = useToast();

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

  const handleMoodSelect = (mood: string) => {
    setTodaysMood(mood);
    const moodMessages = {
      happy: "Great to hear you're feeling happy! Keep that positive energy!",
      neutral: "Neutral days are good - sometimes reflection is just as valuable.",
      sad: "It's okay to have down days. Try a warm cup of tea and some deep breathing.",
      energized: "Use that energy for something productive today!",
      tired: "Rest is important - consider an early bedtime tonight."
    };
    toast({
      title: `Mood recorded: ${mood}`,
      description: moodMessages[mood as keyof typeof moodMessages],
    });
  };

  const handleGoalToggle = (goalId: number) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      toast({
        title: goal.completed ? "Goal unchecked" : "Goal achieved! 🎉",
        description: `Updated: ${goal.text}`,
      });
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;

    const newGoalObj = {
      id: Date.now(),
      text: newGoal,
      completed: false,
      category: "personal"
    };

    setGoals([...goals, newGoalObj]);
    setNewGoal("");

    toast({
      title: "New goal added!",
      description: "Track your progress and stay motivated.",
    });
  };

  const handleWaterIntake = (amount: number) => {
    setWaterIntake(prev => Math.min(prev + amount, 12));
    toast({
      title: "Water logged! 💧",
      description: `You've now had ${waterIntake + amount} glasses today.`,
    });
  };

  const handleSaveJournal = () => {
    if (!journalEntry.trim()) return;
    // In a real app, save to database
    toast({
      title: "Journal entry saved ✍️",
      description: "Your thoughts and reflections are safely stored.",
    });
    setJournalEntry("");
  };

  // Interactive wellness activities
  const quickActivities = [
    {
      id: "breathing",
      title: "Deep Breathing",
      description: "4-7-8 breathing technique",
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      action: () => {
        toast({
          title: "Starting breathing exercise",
          description: "Breathe in for 4 seconds, hold for 7, exhale for 8. Repeat 4 times.",
        });
      }
    },
    {
      id: "gratitude",
      title: "Gratitude Moment",
      description: "Think of 3 things you're grateful for",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      action: () => {
        toast({
          title: "Taking a gratitude moment",
          description: "Think about the good things in your life right now. 🌟",
        });
      }
    },
    {
      id: "stretch",
      title: "Quick Stretch",
      description: "10-minute desk stretch routine",
      icon: Dumbbell,
      color: "from-green-500 to-primary/50",
      action: () => {
        toast({
          title: "Time for stretching!",
          description: "Stand up and stretch those muscles. Your body will thank you!",
        });
      }
    },
    {
      id: "mindfulness",
      title: "Mindful Moment",
      description: "Focus on the present for 2 minutes",
      icon: Zap,
      color: "from-purple-500 to-violet-500",
      action: () => {
        toast({
          title: "Being mindful",
          description: "Focus on your breath and the present moment. 🧘‍♀️",
        });
      }
    }
  ];

  const wellnessCategories = [
    { name: "All Goals", count: goals.length },
    { name: "Health", count: goals.filter(g => g.category === "health").length },
    { name: "Fitness", count: goals.filter(g => g.category === "fitness").length },
    { name: "Mindfulness", count: goals.filter(g => g.category === "mindfulness").length },
    { name: "Learning", count: goals.filter(g => g.category === "learning").length },
    { name: "Personal", count: goals.filter(g => g.category === "personal").length },
  ];

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
          <h1 className="text-xl font-bold text-foreground">Wellness & Growth</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-4 space-y-6">
          {/* Welcome & Daily Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{formatTime(currentTime)}</p>
                    <p className="text-muted-foreground">How are you feeling today?</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMoodSelect('happy')}
                      className={`p-3 rounded-full ${todaysMood === 'happy' ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}
                      variant="ghost"
                    >
                      <Smile className="h-6 w-6 text-yellow-500" />
                    </Button>
                    <Button
                      onClick={() => handleMoodSelect('neutral')}
                      className={`p-3 rounded-full ${todaysMood === 'neutral' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      variant="ghost"
                    >
                      <Meh className="h-6 w-6 text-gray-500" />
                    </Button>
                    <Button
                      onClick={() => handleMoodSelect('sad')}
                      className={`p-3 rounded-full ${todaysMood === 'sad' ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
                      variant="ghost"
                    >
                      <Frown className="h-6 w-6 text-blue-500" />
                    </Button>
                    <Button
                      onClick={() => handleMoodSelect('energized')}
                      className={`p-3 rounded-full ${todaysMood === 'energized' ? 'bg-green-100' : 'hover:bg-green-50'}`}
                      variant="ghost"
                    >
                      <Zap className="h-6 w-6 text-green-500" />
                    </Button>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-white/50 rounded-xl">
                    <Water className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-foreground">{waterIntake}/8</p>
                    <p className="text-sm text-muted-foreground">Water Intake</p>
                    <Button onClick={() => handleWaterIntake(1)} size="sm" className="mt-2">
                      + Add Glass
                    </Button>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-xl">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-foreground">
                      {goals.filter(g => g.completed).length}/{goals.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Goals Completed</p>
                  </div>
                </div>

                <Progress value={((goals.filter(g => g.completed).length / goals.length) * 100)} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round((goals.filter(g => g.completed).length / goals.length) * 100)}% of today's goals completed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Wellness Activities</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{activity.description}</p>
                        <Button onClick={activity.action} size="sm" className="w-full">
                          Start Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Today's Goals Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today's Goals</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("goals")}>
                View All →
              </Button>
            </div>
            <div className="space-y-2">
              {goals.slice(0, 3).map((goal) => (
                <Card key={goal.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleGoalToggle(goal.id)}
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6"
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <span className={`flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.text}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Goal Tracker</h2>
            <Badge variant="secondary">
              {goals.filter(g => g.completed).length}/{goals.length} Completed
            </Badge>
          </div>

          {/* Add New Goal */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="What's your goal for today?"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button onClick={handleAddGoal} disabled={!newGoal.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Goals List */}
          <div className="space-y-3">
            {goals.map((goal) => (
              <Card key={goal.id} className={`transition-all ${goal.completed ? 'bg-green-50 border-green-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleGoalToggle(goal.id)}
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6"
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <span className={`flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.text}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {goal.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journal" className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daily Journal</h2>
            <Badge variant="secondary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Badge>
          </div>

          {/* Journal Prompts */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Reflection Prompt</h3>
              <p className="text-muted-foreground">
                What are you most grateful for today? Think about the small moments that brought you joy.
              </p>
            </CardContent>
          </Card>

          {/* Journal Entry */}
          <Card>
            <CardContent className="p-4">
              <Textarea
                placeholder="Write about your day, thoughts, or anything on your mind..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="min-h-32 resize-none"
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {journalEntry.length} characters
                </p>
                <Button onClick={handleSaveJournal} disabled={!journalEntry.trim()}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mood Insights */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Mood Tracker Insights</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Today's Mood</p>
                    <p className="text-sm text-muted-foreground">
                      {todaysMood ? todaysMood.charAt(0).toUpperCase() + todaysMood.slice(1) : 'Not recorded yet'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {todaysMood || 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Habit Tracker</h2>
            <Button variant="ghost" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>

          {/* Habit Categories */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center p-6">
              <Water className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{waterIntake}</p>
              <p className="text-sm text-muted-foreground">Glasses of Water</p>
              <Progress value={(waterIntake / 8) * 100} className="mt-3" />
            </Card>
            <Card className="text-center p-6">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-muted-foreground">Days Streak</p>
              <Progress value={77} className="mt-3" />
            </Card>
          </div>

          {/* Habit Actions */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleWaterIntake(1)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Water className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Drink Water</h4>
                  <p className="text-sm text-muted-foreground">Stay hydrated throughout your day</p>
                </div>
                <Badge variant="secondary">+1 Glass</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Mindful Minute</h4>
                  <p className="text-sm text-muted-foreground">Take a moment to breathe and center yourself</p>
                </div>
                <Badge variant="secondary">Start Now</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Daily Walk</h4>
                  <p className="text-sm text-muted-foreground">Step outside and enjoy some fresh air</p>
                </div>
                <Badge variant="secondary">20 min</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifestyleFeatures;
