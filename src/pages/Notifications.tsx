import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Heart, MessageSquare, Users, Star, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  related_user_id: string | null;
  related_match_id: string | null;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    newMatches: true, messages: true, likes: true, superLikes: true,
    profileViews: true, soundEnabled: true, vibrationEnabled: true,
  });

  useEffect(() => { if (user) fetchNotifications(); }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'superlike': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'match': return <Users className="w-5 h-5 text-primary" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markAsRead(n.id);
    if (n.type === 'match' && n.related_match_id) navigate('/matches');
    else if (n.type === 'message' && n.related_match_id) navigate('/matches');
    else if ((n.type === 'like' || n.type === 'superlike') && n.related_user_id) navigate('/like-you');
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs">{unreadCount}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="w-full px-4 mt-3">
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="px-4 mt-2">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
                <p className="text-muted-foreground text-sm">When someone likes or matches with you, you'll see it here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      n.is_read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? 'text-foreground' : 'font-semibold text-foreground'}`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="px-4 mt-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'newMatches', label: 'New Matches', desc: 'When someone new matches with you' },
                  { key: 'messages', label: 'Messages', desc: 'When you receive new messages' },
                  { key: 'likes', label: 'Likes', desc: 'When someone likes your profile' },
                  { key: 'superLikes', label: 'Super Likes', desc: 'When someone super likes you' },
                  { key: 'soundEnabled', label: 'Sound Effects', desc: 'Play notification sounds' },
                  { key: 'vibrationEnabled', label: 'Vibration', desc: 'Haptic feedback on notifications' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={settings[key as keyof typeof settings]}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;
