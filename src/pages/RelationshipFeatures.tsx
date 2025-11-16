// ✅ MIGRATED TO FIREBASE - Terminal 4 - 2025-11-15
import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Calendar, MessageCircle, Heart, Video, Phone, Coffee, MapPin, Clock, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  notifyOnDates: boolean;
}

const RelationshipFeatures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
    notifyOnDates: false
  });

  useEffect(() => {
    if (user) {
      fetchEmergencyContact();
    }
  }, [user]);

  const fetchEmergencyContact = async () => {
    // For now, we'll store this locally or implement proper database column later
    const stored = localStorage.getItem(`emergency_contact_${user?.uid}`);
    if (stored) {
      setEmergencyContact(JSON.parse(stored));
    }
    setLoading(false);
  };

  const saveEmergencyContact = async () => {
    try {
      // Store locally for now
      localStorage.setItem(`emergency_contact_${user?.uid}`, JSON.stringify(emergencyContact));
      toast.success("Emergency contact saved successfully");
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      toast.error("Failed to save emergency contact");
    }
  };

  // Dating safety guidelines
  const safetyGuidelines = [
    {
      icon: Users,
      title: "Meet in Public Places",
      description: "Always choose public venues for first dates - cafes, restaurants, or popular activities."
    },
    {
      icon: MessageCircle,
      title: "Tell Someone Your Plans", 
      description: "Share your date details with a trusted friend or family member."
    },
    {
      icon: Phone,
      title: "Keep Your Phone Charged",
      description: "Ensure your phone is fully charged and you have a way to get home safely."
    },
    {
      icon: Coffee,
      title: "Trust Your Instincts",
      description: "If something feels off, don't hesitate to leave. Your safety comes first."
    },
    {
      icon: Heart,
      title: "Take Your Time",
      description: "Don't feel pressured to rush into anything. Good connections develop naturally."
    },
    {
      icon: MapPin,
      title: "Plan Your Transportation",
      description: "Have your own transportation arranged and don't depend solely on your date."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-foreground">Safety & Support</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        <Tabs defaultValue="safety" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="contact">Emergency Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="safety" className="space-y-6">
            {/* Safety Guidelines */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-foreground">Dating Safety Guidelines</h3>
              {safetyGuidelines.map((tip, index) => {
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
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-2">{tip.title}</h4>
                            <p className="text-muted-foreground text-sm">{tip.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Contact Name</Label>
                    <Input
                      id="name"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={emergencyContact.relationship}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Friend, Sibling, Parent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify"
                      checked={emergencyContact.notifyOnDates}
                      onCheckedChange={(checked) => setEmergencyContact(prev => ({ ...prev, notifyOnDates: checked }))}
                    />
                    <Label htmlFor="notify" className="text-sm">Notify on dates</Label>
                  </div>
                </div>
                <Button onClick={saveEmergencyContact} className="w-full">
                  Save Emergency Contact
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RelationshipFeatures;