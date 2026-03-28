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
  receiver_id: string;
  content: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  matched_user?: {
    user_id: string;
    display_name: string;
    avatar_url?: string;
    first_name: string;
    last_name: string;
  };
}

const DEMO_MESSAGES: Message[] = [
  {
    id: 'demo-1',
    sender_id: 'demo-user-1',
    receiver_id: 'current-user',
    content: "Hey! I noticed we both love hiking and coffee. What's your favorite trail?",
    message_type: 'text',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    sender_profile: {
      display_name: 'Sarah',
      avatar_url: '/lovable-uploads/a89fa103-cf18-412f-82e7-7e83b5aa0a85.png'
    }
  },
  {
    id: 'demo-2',
    sender_id: 'current-user',
    receiver_id: 'demo-user-1',
    content: "I love the trails up in the Catskills! Have you been to Kaaterskill Falls?",
    message_type: 'text',
    is_read: true,
    created_at: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'demo-3',
    sender_id: 'demo-user-1',
    receiver_id: 'current-user',
    content: "Not yet but it's been on my list forever! We should totally go together sometime 😊",
    message_type: 'text',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    sender_profile: {
      display_name: 'Sarah',
      avatar_url: '/lovable-uploads/a89fa103-cf18-412f-82e7-7e83b5aa0a85.png'
    }
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
      first_name: 'Sarah',
      last_name: 'Johnson',
      avatar_url: '/lovable-uploads/a89fa103-cf18-412f-82e7-7e83b5aa0a85.png'
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
      first_name: 'Emily',
      last_name: 'Chen',
      avatar_url: '/assets/profile-2.jpg'
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
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch matches and set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const { data: realMatches, error } = await supabase
          .from('matches')
          .select(`
            *,
            user1_profile:profiles!matches_user1_id_fkey (
              user_id,
              display_name,
              first_name,
              last_name,
              avatar_url
            ),
            user2_profile:profiles!matches_user2_id_fkey (
              user_id,
              display_name,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (realMatches && realMatches.length > 0) {
          // Transform real data to match our interface
          const transformedMatches: Match[] = realMatches.map(match => ({
            id: match.id,
            user1_id: match.user1_id,
            user2_id: match.user2_id,
            created_at: match.created_at,
            matched_user: match.user1_id === user.id 
              ? (match as any).user2_profile
              : (match as any).user1_profile
          }));
          setMatches(transformedMatches);
          setHasRealData(true);
        } else {
          // Use demo data if no real matches
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
        // Use demo messages
        setMessages(DEMO_MESSAGES);
        return;
      }

      try {
        const matchedUserId = selectedMatch.user1_id === user.id 
          ? selectedMatch.user2_id 
          : selectedMatch.user1_id;

        const { data: realMessages, error } = await supabase
          .from('messages')
          .select(`
            *,
            profiles!messages_sender_id_fkey (
              display_name,
              avatar_url
            )
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${matchedUserId}),and(sender_id.eq.${matchedUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(realMessages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: hasRealData ? `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})` : undefined
        },
        (payload) => {
          if (hasRealData) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
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
      // Demo mode - just add to local state
      const demoMessage: Message = {
        id: `demo-${Date.now()}`,
        sender_id: user.id,
        receiver_id: selectedMatch.user2_id === user.id ? selectedMatch.user1_id : selectedMatch.user2_id,
        content: newMessage.trim(),
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, demoMessage]);
      setNewMessage('');
      toast({
        title: "Demo Mode",
        description: "Message sent in demo mode",
      });
      return;
    }

    setLoading(true);

    try {
      const matchedUserId = selectedMatch.user1_id === user.id 
        ? selectedMatch.user2_id 
        : selectedMatch.user1_id;

      // Check content with moderation
      const { data: moderationResult } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'analyze_content',
          content: newMessage.trim()
        }
      });

      if (moderationResult?.recommended_action === 'block') {
        toast({
          title: "Message Blocked",
          description: "Your message contains inappropriate content and cannot be sent.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: matchedUserId,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMatch || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Uploading Image",
        description: "Please wait...",
      });

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `message-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      const matchedUserId = selectedMatch.user1_id === user.id
        ? selectedMatch.user2_id
        : selectedMatch.user1_id;

      if (!hasRealData) {
        // Demo mode - show image in chat
        const demoMessage: Message = {
          id: `demo-${Date.now()}`,
          sender_id: user.id,
          receiver_id: matchedUserId,
          content: "",
          message_type: 'image',
          attachment_url: publicUrl,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, demoMessage]);
        toast({
          title: "Image Sent",
          description: "Image shared in demo mode",
        });
      } else {
        // Send image message to database
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            receiver_id: matchedUserId,
            content: "",
            message_type: 'image',
            attachment_url: publicUrl
          });

        if (messageError) throw messageError;

        toast({
          title: "Image Sent",
          description: "Your image has been shared",
        });
      }

      // Clear file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const reportUser = async (reportType: string, reason?: string) => {
    if (!selectedMatch || !user) return;

    const matchedUserId = selectedMatch.user1_id === user.id
      ? selectedMatch.user2_id
      : selectedMatch.user1_id;

    try {
      const { error } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'report_user',
          reported_user_id: matchedUserId,
          report_type: reportType,
          reason: reason
        }
      });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting. We'll review this shortly.",
      });
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  const blockUser = async () => {
    if (!selectedMatch || !user) return;

    const matchedUserId = selectedMatch.user1_id === user.id
      ? selectedMatch.user2_id
      : selectedMatch.user1_id;

    try {
      const { error } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'block_user',
          reported_user_id: matchedUserId,
          reason: 'Blocked from conversation'
        }
      });

      if (error) throw error;

      toast({
        title: "User Blocked",
        description: "You won't receive messages from this user anymore.",
      });

      // Remove from matches
      setMatches(prev => prev.filter(match => match.id !== selectedMatch.id));
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  const handleVoiceSelect = () => {
    setIsVoiceRecorderOpen(true);
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    if (!selectedMatch || !user) return;

    try {
      toast({
        title: "Processing Voice Message",
        description: "Please wait...",
      });

      // Create unique file name for voice message
      const fileName = `${user.id}-voice-${Date.now()}.wav`;
      const filePath = `voice-messages/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      const matchedUserId = selectedMatch.user1_id === user.id
        ? selectedMatch.user2_id
        : selectedMatch.user1_id;

      if (!hasRealData) {
        // Demo mode - show voice message in chat
        const demoMessage: Message = {
          id: `demo-${Date.now()}`,
          sender_id: user.id,
          receiver_id: matchedUserId,
          content: `Voice message (${duration}s)`,
          message_type: 'voice',
          attachment_url: publicUrl,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, demoMessage]);
        toast({
          title: "Voice Message Sent",
          description: "Voice message shared in demo mode",
        });
      } else {
        // Send voice message to database
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            receiver_id: matchedUserId,
            content: "",
            message_type: 'voice',
            attachment_url: publicUrl
          });

        if (messageError) throw messageError;

        toast({
          title: "Voice Message Sent",
          description: "Your voice message has been shared",
        });
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Matches List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Your Matches
              {!hasRealData && (
                <Badge variant="secondary" className="text-xs">Demo</Badge>
              )}
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
                      <AvatarImage src={match.matched_user?.avatar_url} />
                      <AvatarFallback>
                        {match.matched_user?.first_name?.[0]}{match.matched_user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {match.matched_user?.display_name || `${match.matched_user?.first_name} ${match.matched_user?.last_name}`}
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
                    <AvatarImage src={selectedMatch.matched_user?.avatar_url} />
                    <AvatarFallback>
                      {selectedMatch.matched_user?.first_name?.[0]}{selectedMatch.matched_user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedMatch.matched_user?.display_name || `${selectedMatch.matched_user?.first_name} ${selectedMatch.matched_user?.last_name}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Online now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVideoCallOpen(true)}
                    className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
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
                {/* Messages */}
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
                        {message.message_type === 'image' && message.attachment_url ? (
                          <div className="max-w-[70%] rounded-lg overflow-hidden">
                            <img
                              src={message.attachment_url}
                              alt="Shared image"
                              className="w-full h-auto rounded-lg max-h-64 object-cover"
                            />
                            <p className="text-xs opacity-70 mt-1 px-3 py-1">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ) : (
                          <div className={`max-w-[70%] ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          } rounded-lg p-3`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImageSelect}
                      title="Send image"
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceSelect}
                      title="Send voice message"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Hidden file input for images */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
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

      {/* Video Call Modal */}
      {selectedMatch && (
        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          userName={selectedMatch.matched_user?.display_name || `${selectedMatch.matched_user?.first_name} ${selectedMatch.matched_user?.last_name}` || 'User'}
          userImage={selectedMatch.matched_user?.avatar_url || '/assets/profile-1.jpg'}
        />
      )}

      {/* Voice Recorder */}
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
