import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Image, MoreVertical, Shield, Flag, Video, Mic } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import VideoCallModal from './VideoCallModal';
import VoiceRecorder from './VoiceRecorder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  sender_id: string;
  match_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  matched_user?: {
    user_id: string;
    display_name: string;
    photos?: string[];
  };
}

const DEMO_MESSAGES: Message[] = [
  {
    id: 'demo-1',
    sender_id: 'demo-user-1',
    match_id: 'demo-match-1',
    content: "Hey! I noticed we both love hiking and coffee. What's your favorite trail?",
    message_type: 'text',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'demo-2',
    sender_id: 'current-user',
    match_id: 'demo-match-1',
    content: "I love the trails up in the Catskills! Have you been to Kaaterskill Falls?",
    message_type: 'text',
    is_read: true,
    created_at: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'demo-3',
    sender_id: 'demo-user-1',
    match_id: 'demo-match-1',
    content: "Not yet but it's been on my list forever! We should totally go together sometime 😊",
    message_type: 'text',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  }
];

const DEMO_MATCHES: Match[] = [
  {
    id: 'demo-match-1',
    user1_id: 'current-user',
    user2_id: 'demo-user-1',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    matched_user: {
      user_id: 'demo-user-1',
      display_name: 'Sarah Johnson',
    }
  },
  {
    id: 'demo-match-2',
    user1_id: 'current-user',
    user2_id: 'demo-user-2',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    matched_user: {
      user_id: 'demo-user-2',
      display_name: 'Emily Chen',
    }
  }
];

export const MessagingInterface = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch matches
  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const { data: realMatches, error } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (realMatches && realMatches.length > 0) {
          // Fetch profiles for matched users
          const transformedMatches: Match[] = await Promise.all(
            realMatches.map(async (match) => {
              const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
              const { data: profile } = await supabase
                .from('profiles')
                .select('user_id, display_name, photos')
                .eq('user_id', otherUserId)
                .single();
              
              return {
                id: match.id,
                user1_id: match.user1_id,
                user2_id: match.user2_id,
                created_at: match.created_at,
                matched_user: profile || { user_id: otherUserId, display_name: 'User' }
              };
            })
          );
          setMatches(transformedMatches);
          setHasRealData(true);
        } else {
          setMatches(DEMO_MATCHES);
          setHasRealData(false);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches(DEMO_MATCHES);
        setHasRealData(false);
      }
    };

    fetchMatches();
  }, [user]);

  // Fetch messages for selected match
  useEffect(() => {
    if (!selectedMatch || !user) return;

    const fetchMessages = async () => {
      if (!hasRealData) {
        setMessages(DEMO_MESSAGES);
        return;
      }

      try {
        const { data: realMessages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', selectedMatch.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(realMessages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`messages-${selectedMatch.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${selectedMatch.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMatch, user, hasRealData]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || !user) return;

    if (!hasRealData) {
      const demoMessage: Message = {
        id: `demo-${Date.now()}`,
        sender_id: user.id,
        match_id: selectedMatch.id,
        content: newMessage.trim(),
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, demoMessage]);
      setNewMessage('');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          match_id: selectedMatch.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMatch || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `message-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath);

      if (!hasRealData) {
        const demoMessage: Message = {
          id: `demo-${Date.now()}`,
          sender_id: user.id,
          match_id: selectedMatch.id,
          content: publicUrl,
          message_type: 'image',
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, demoMessage]);
      } else {
        await supabase.from('messages').insert({
          sender_id: user.id,
          match_id: selectedMatch.id,
          content: publicUrl,
          message_type: 'image'
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Upload Failed", description: "Failed to upload image.", variant: "destructive" });
    }
  };

  const reportUser = async (reportType: string) => {
    if (!selectedMatch || !user) return;
    const matchedUserId = selectedMatch.user1_id === user.id ? selectedMatch.user2_id : selectedMatch.user1_id;
    try {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: matchedUserId,
        reason: reportType,
      });
      toast({ title: "Report Submitted", description: "Thank you for reporting." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit report", variant: "destructive" });
    }
  };

  const blockUser = async () => {
    if (!selectedMatch || !user) return;
    const matchedUserId = selectedMatch.user1_id === user.id ? selectedMatch.user2_id : selectedMatch.user1_id;
    try {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: matchedUserId,
        reason: 'blocked',
        details: 'Blocked from conversation',
      });
      setMatches(prev => prev.filter(match => match.id !== selectedMatch.id));
      setSelectedMatch(null);
      toast({ title: "User Blocked" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to block user", variant: "destructive" });
    }
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    if (!selectedMatch || !user) return;
    try {
      const fileName = `${user.id}-voice-${Date.now()}.wav`;
      const filePath = `voice-messages/${fileName}`;
      await supabase.storage.from('user-photos').upload(filePath, audioBlob);
      const { data: { publicUrl } } = supabase.storage.from('user-photos').getPublicUrl(filePath);

      if (!hasRealData) {
        const demoMessage: Message = {
          id: `demo-${Date.now()}`,
          sender_id: user.id,
          match_id: selectedMatch.id,
          content: publicUrl,
          message_type: 'voice',
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, demoMessage]);
      } else {
        await supabase.from('messages').insert({
          sender_id: user.id,
          match_id: selectedMatch.id,
          content: publicUrl,
          message_type: 'voice'
        });
      }
    } catch (error) {
      toast({ title: "Upload Failed", description: "Failed to send voice message.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Matches List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="secondary">{matches.length}</Badge>
              Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                    selectedMatch?.id === match.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={match.matched_user?.photos?.[0]} />
                      <AvatarFallback>
                        {match.matched_user?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {match.matched_user?.display_name || 'User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Matched {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {matches.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No matches yet</p>
                  <p className="text-sm">Start swiping to find your match!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="md:col-span-2">
          {selectedMatch ? (
            <>
              <CardHeader className="flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedMatch.matched_user?.photos?.[0]} />
                    <AvatarFallback>
                      {selectedMatch.matched_user?.display_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedMatch.matched_user?.display_name || 'User'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Online now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsVideoCallOpen(true)}>
                    <Video className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => reportUser('inappropriate_content')}>
                        <Flag className="w-4 h-4 mr-2" />
                        Report User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={blockUser} className="text-destructive">
                        <Shield className="w-4 h-4 mr-2" />
                        Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.message_type === 'image' && message.content ? (
                          <div className="max-w-[70%] rounded-lg overflow-hidden">
                            <img src={message.content} alt="Shared image" className="w-full h-auto rounded-lg max-h-64 object-cover" />
                            <p className="text-xs opacity-70 mt-1 px-3 py-1">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <div className={`max-w-[70%] ${
                            message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          } rounded-lg p-3`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleImageSelect} title="Send image">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsVoiceRecorderOpen(true)} title="Send voice message">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim() || loading} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Send className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a match to start chatting</p>
                <p className="text-sm">Choose from your matches on the left to begin a conversation</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {selectedMatch && (
        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          userName={selectedMatch.matched_user?.display_name || 'User'}
          userImage={selectedMatch.matched_user?.photos?.[0] || '/assets/profile-1.jpg'}
        />
      )}

      {isVoiceRecorderOpen && selectedMatch && (
        <VoiceRecorder
          onSend={(audioBlob, duration) => {
            handleVoiceSend(audioBlob, duration);
            setIsVoiceRecorderOpen(false);
          }}
          onClose={() => setIsVoiceRecorderOpen(false)}
        />
      )}
    </div>
  );
};
