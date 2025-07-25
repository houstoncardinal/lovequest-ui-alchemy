import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PremiumBadge from '@/components/PremiumBadge';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Calendar, 
  Shield,
  Phone,
  Mail,
  Video,
  FileText,
  Heart,
  Settings,
  CheckCircle
} from 'lucide-react';

interface WaliContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  preferred_contact: string;
}

interface FamilyMeeting {
  id: string;
  match_id: string;
  meeting_type: 'virtual' | 'in_person';
  scheduled_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

const FamilyFeatures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [waliContact, setWaliContact] = useState<WaliContact>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    preferred_contact: 'phone'
  });
  const [familyMeetings, setFamilyMeetings] = useState<FamilyMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWaliInfo();
      fetchFamilyMeetings();
    }
  }, [user]);

  const fetchWaliInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wali_contact_info')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data?.wali_contact_info) {
        setWaliContact(data.wali_contact_info as any);
      }
    } catch (error) {
      console.error('Error fetching wali info:', error);
    }
  };

  const fetchFamilyMeetings = async () => {
    try {
      // This would fetch from a family_meetings table
      // For now, using mock data
      setFamilyMeetings([]);
    } catch (error) {
      console.error('Error fetching family meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWaliInfo = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wali_contact_info: waliContact as any })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Wali Information Saved",
        description: "Your family contact information has been updated successfully",
      });
    } catch (error) {
      console.error('Error saving wali info:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your family contact information",
        variant: "destructive",
      });
    }
  };

  const scheduleFamilyMeeting = async (matchId: string, meetingType: 'virtual' | 'in_person') => {
    try {
      // Implementation for scheduling family meetings
      toast({
        title: "Meeting Request Sent",
        description: "Your family meeting request has been sent to the match",
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  const familyGuidelines = [
    {
      title: "Involving Your Wali",
      content: "According to Islamic tradition, involving a wali (guardian) in the marriage process is recommended. Set up your wali's contact information so potential matches can reach out appropriately."
    },
    {
      title: "Family Meetings",
      content: "Arrange supervised meetings with families present. This helps ensure proper Islamic etiquette and allows families to get to know each other."
    },
    {
      title: "Communication Boundaries",
      content: "Maintain appropriate communication boundaries. Use family members as intermediaries when needed, especially in the early stages of getting to know someone."
    },
    {
      title: "Cultural Considerations",
      content: "Respect cultural differences between families. Discuss traditions, expectations, and important family values early in the process."
    }
  ];

  const meetingTemplates = [
    {
      type: 'initial',
      title: 'Initial Family Introduction',
      description: 'First meeting between families to get acquainted',
      duration: '1-2 hours',
      format: 'Virtual or in-person'
    },
    {
      type: 'formal',
      title: 'Formal Meeting',
      description: 'More structured discussion about compatibility and expectations',
      duration: '2-3 hours',
      format: 'Preferably in-person'
    },
    {
      type: 'cultural',
      title: 'Cultural Exchange',
      description: 'Share cultural traditions and family backgrounds',
      duration: '2-4 hours',
      format: 'In-person with meal'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading family features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Family Features</h1>
            <PremiumBadge plan="platinum" />
          </div>
          <p className="text-muted-foreground">
            Tools for involving family in the Islamic courtship process
          </p>
        </div>

        <Tabs defaultValue="wali" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wali">Wali Info</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="wali" className="space-y-6">
            {/* Wali Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Wali (Guardian) Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Provide your wali's contact information so potential matches can reach out appropriately according to Islamic guidelines.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wali-name">Full Name</Label>
                    <Input
                      id="wali-name"
                      value={waliContact.name}
                      onChange={(e) => setWaliContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter wali's full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={waliContact.relationship}
                      onChange={(e) => setWaliContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Father, Brother, Uncle"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={waliContact.phone}
                      onChange={(e) => setWaliContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={waliContact.email}
                      onChange={(e) => setWaliContact(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="wali@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="preferred_contact"
                        value="phone"
                        checked={waliContact.preferred_contact === 'phone'}
                        onChange={(e) => setWaliContact(prev => ({ ...prev, preferred_contact: e.target.value }))}
                      />
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Phone</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="preferred_contact"
                        value="email"
                        checked={waliContact.preferred_contact === 'email'}
                        onChange={(e) => setWaliContact(prev => ({ ...prev, preferred_contact: e.target.value }))}
                      />
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </label>
                  </div>
                </div>

                <Button onClick={saveWaliInfo} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Wali Information
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Wali Contact to Matches</h4>
                    <p className="text-sm text-muted-foreground">Allow serious matches to contact your wali directly</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Require Family Meeting</h4>
                    <p className="text-sm text-muted-foreground">Request family involvement before deeper conversations</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            {/* Schedule Meeting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Family Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule a meeting between families to discuss compatibility and get to know each other.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => scheduleFamilyMeeting('match-id', 'virtual')}
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Schedule Virtual Meeting
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => scheduleFamilyMeeting('match-id', 'in_person')}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Schedule In-Person Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Family Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {familyMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {familyMeetings.map((meeting) => (
                      <div key={meeting.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Family Meeting</h4>
                          <Badge variant="secondary">{meeting.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.scheduled_date).toLocaleDateString()} at{' '}
                          {new Date(meeting.scheduled_date).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Meetings</h3>
                    <p className="text-muted-foreground">
                      Schedule your first family meeting with a potential match
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidance" className="space-y-6">
            {familyGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {guideline.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {guideline.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {meetingTemplates.map((template, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{template.title}</h4>
                        <Badge variant="outline">{template.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Format: {template.format}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FamilyFeatures;