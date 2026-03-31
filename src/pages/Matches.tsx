import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Camera, Send, ArrowLeft, Crown, Mic, Smile, Video, Phone, Settings, Shield, HelpCircle, Heart, Lock, Sparkles, SlidersHorizontal } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import EmojiPicker from "@/components/EmojiPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import VideoCallModal from "@/components/VideoCallModal";
import VoiceMessage from "@/components/VoiceMessage";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

interface Message {
  id: string;
  sender_id: string;
  match_id: string;
  content: string;
  message_type: string | null;
  created_at: string;
  is_read: boolean | null;
}

interface MatchData {
  match_id: string;
  matched_user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  age: number;
  location: string;
  bio: string;
  avatar_url: string;
  match_score: number;
  matched_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // For demo purposes, assume user is not premium

  // Demo data for people who liked you
  const peopleWhoLikeYou = [
    {
      id: "like-1",
      name: "Maya Chen",
      age: 28,
      location: "San Francisco, CA",
      image: profile1,
    },
    {
      id: "like-2",
      name: "Rachel Green",
      age: 26,
      location: "Seattle, WA",
      image: profile3,
    },
    {
      id: "like-3",
      name: "Jessica Wang",
      age: 29,
      location: "Austin, TX",
      image: profile2,
    },
    {
      id: "like-4",
      name: "Sophia Adams",
      age: 25,
      location: "Phoenix, AZ",
      image: profile1,
    },
    {
      id: "like-5",
      name: "Lauren Miller",
      age: 27,
      location: "Dallas, TX",
      image: profile2,
    },
    {
      id: "like-6",
      name: "Hannah Brooks",
      age: 24,
      location: "Nashville, TN",
      image: profile3,
    }
  ];
  
  // Demo matches for when there's no real data
  const demoMatches: MatchData[] = [
    {
      match_id: "demo-1",
      matched_user_id: "demo-user-1",
      first_name: "Sarah",
      last_name: "Johnson",
      display_name: "Sarah Johnson",
      age: 25,
      location: "New York, NY",
      bio: "Love music, art, and meaningful conversations 🎵",
      avatar_url: profile1,
      match_score: 95,
      matched_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      match_id: "demo-2",
      matched_user_id: "demo-user-2",
      first_name: "Emily",
      last_name: "Chen",
      display_name: "Emily Chen",
      age: 23,
      location: "Los Angeles, CA",
      bio: "Passionate about photography and travel ✈️",
      avatar_url: profile2,
      match_score: 88,
      matched_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      match_id: "demo-3",
      matched_user_id: "demo-user-3",
      first_name: "Jessica",
      last_name: "Martinez",
      display_name: "Jessica Martinez",
      age: 27,
      location: "Chicago, IL",
      bio: "Book lover, coffee enthusiast, and nature explorer 📚",
      avatar_url: profile3,
      match_score: 92,
      matched_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    }
  ];

  // Demo messages for demo matches
  const demoMessages: { [key: string]: Message[] } = {
    "demo-user-1": [
      {
        id: "demo-msg-1",
        sender_id: "demo-user-1",
        receiver_id: user?.id || "",
        content: "Hey! I saw you're into music too 🎵",
        message_type: "text",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-2",
        sender_id: user?.id || "",
        receiver_id: "demo-user-1",
        content: "Yes! I love discovering new artists. What's your favorite genre?",
        message_type: "text",
        created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-3",
        sender_id: "demo-user-1",
        receiver_id: user?.id || "",
        content: "I'm really into indie rock and some electronic music. There's this new band I found called Aurora Dreams - they're incredible!",
        message_type: "text",
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-4",
        sender_id: user?.id || "",
        receiver_id: "demo-user-1",
        content: "That sounds amazing! I'd love to check them out. Do you want to go to a concert together sometime?",
        message_type: "text",
        created_at: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-5",
        sender_id: "demo-user-1",
        receiver_id: user?.id || "",
        content: "That sounds amazing! I'd love to go 🎵",
        message_type: "text",
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        is_read: false,
      }
    ]
  };
  const { toast } = useToast();

  // Fetch matches and set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;
    
    fetchMatches();
    
    // Set up real-time subscription for new matches
    const matchChannel = supabase
      .channel('matches-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`,
        },
        handleNewMatch
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [user?.id]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat && user?.id) {
      fetchMessages(selectedChat);
      
      // Set up real-time subscription for messages
      const messageChannel = supabase
        .channel(`messages-${selectedChat}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          handleNewMessage
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
      };
    }
  }, [selectedChat, user?.id]);

  const fetchMatches = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_mutual_matches', { target_user_id: user.id });
      
      if (error) throw error;
      
      // Use real matches if available, otherwise use demo matches
      if (data && data.length > 0) {
        setMatches(data);
      } else {
        setMatches(demoMatches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Fallback to demo matches on error
      setMatches(demoMatches);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchUserId: string) => {
    if (!user?.id) return;
    
    // Check if this is a demo match
    if (matchUserId.startsWith('demo-user-')) {
      setMessages(demoMessages[matchUserId] || []);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${matchUserId}),and(sender_id.eq.${matchUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages((data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'voice'
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMatch = (payload: any) => {
    console.log('New match:', payload);
    fetchMatches(); // Refresh matches list
  };

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new as Message;
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id) return;
    
    // Handle demo matches differently
    if (selectedChat.startsWith('demo-user-')) {
      const newMsg: Message = {
        id: `demo-msg-${Date.now()}`,
        sender_id: user.id,
        receiver_id: selectedChat,
        content: newMessage,
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: false,
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setShowEmojiPicker(false);
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
      return;
    }
    
    try {
      // Check if users are matched before sending
      const areMatched = await supabase.rpc('are_users_matched', {
        user1_id: user.id,
        user2_id: selectedChat
      });
      
      if (!areMatched.data) {
        toast({
          title: "Cannot send message",
          description: "You can only message users you've matched with.",
          variant: "destructive",
        });
        return;
      }

      // Content moderation
      const { data: moderationResult } = await supabase.functions.invoke('content-moderation', {
        body: { content: newMessage }
      });

      if (moderationResult?.flagged) {
        toast({
          title: "Message not sent",
          description: "Your message contains inappropriate content.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedChat,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      setShowEmojiPicker(false);

      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji);
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    if (!selectedChat || !user?.id) return;
    
    try {
      // Upload voice message to storage
      const fileExt = 'webm';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedChat,
          content: `Voice message (${duration}s)`,
          message_type: 'voice',
          attachment_url: publicUrl
        });

      if (error) throw error;

      toast({
        title: "Voice message sent",
        description: "Your voice message has been delivered.",
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Error",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoCall = () => {
    setShowVideoCall(true);
  };

  if (selectedChat) {
    const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
    const currentUser = currentMatch;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col h-screen max-h-screen relative">
        {/* Chat Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSelectedChat(null)}
                className="mr-4 p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-primary" />
              </button>
              
                <div className="relative mr-3 sm:mr-4">
                <img 
                  src={currentUser?.avatar_url || profile1} 
                  alt={currentUser?.display_name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-primary/15"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-primary border-2 border-white rounded-full shadow-sm"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-foreground text-lg">{currentUser?.display_name}</h3>
                  <Crown className="w-4 h-4 text-amber-500 fill-current" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleVideoCall}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                title="Video Call"
              >
                <Video className="w-6 h-6 text-primary" />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <MoreHorizontal className="w-6 h-6 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 pb-40 sm:pb-32 space-y-4 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              {message.message_type === 'voice' && message.attachment_url ? (
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender_id === user?.id
                    ? 'bg-gradient-to-br from-primary to-primary text-white rounded-br-md'
                    : 'bg-card border border-border text-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm">Voice message</p>
                  <audio controls className="mt-2 w-full">
                    <source src={message.attachment_url} type="audio/webm" />
                  </audio>
                  <p className={`text-xs mt-2 ${
                    message.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender_id === user?.id
                      ? 'bg-gradient-to-br from-primary to-primary text-white rounded-br-md'
                      : 'bg-card border border-border text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div
          className="bg-card/90 backdrop-blur-sm border-t-2 border-border px-4 py-4 fixed bottom-0 left-0 w-full z-50 shadow-lg"
          style={{
            // Increase this value if the input is still hidden on your device
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)'
          }}
        >
          {/* Voice Recorder */}
          {showVoiceRecorder && (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onClose={() => setShowVoiceRecorder(false)}
            />
          )}
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className={`p-3 rounded-full transition-colors ${
                showVoiceRecorder 
                  ? 'bg-primary text-white' 
                  : 'bg-primary/10 hover:bg-primary/15 text-primary'
              }`}
              title="Voice Message"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button 
              className="p-3 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors"
              title="Camera"
            >
              <Camera className="w-5 h-5 text-primary" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 bg-primary/10 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-border transition-colors"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/15 rounded-full transition-colors"
                title="Emojis"
              >
                <Smile className="w-5 h-5 text-primary" />
              </button>
            </div>
            
            <button 
              onClick={handleSendMessage}
              className={`p-3 rounded-full transition-all duration-200 ${
                newMessage.trim() 
                  ? 'bg-gradient-to-br from-primary to-primary shadow-lg hover:shadow-xl' 
                  : 'bg-muted'
              }`}
              disabled={!newMessage.trim()}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Video Call Modal */}
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          userName={currentUser?.display_name || ""}
          userImage={currentUser?.avatar_url || ""}
        />

        <InteractiveMenu />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-20">
      {/* Desktop Header */}
      <div className="hidden md:flex bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center justify-between p-6 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">My Matches</h1>
            <Badge className="bg-gradient-to-r from-primary to-primary text-white px-3 py-1 text-sm font-medium">
              {matches.length} conversations
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="pl-10 pr-4 py-2.5 bg-primary/10 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-border transition-all duration-200 w-80 text-sm"
              />
            </div>

            {/* Filter Button */}
            <button className="p-3 rounded-xl bg-primary/10 hover:bg-primary/15 border border-border transition-colors duration-200" title="Filter conversations">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
            </button>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-3 rounded-xl hover:bg-primary/10 transition-colors" title="More options">
                  <MoreHorizontal className="w-5 h-5 text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/preferences')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/privacy-safety')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy & Safety
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help-support')}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-foreground">Matches</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <MoreHorizontal className="w-6 h-6 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/preferences')}>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/privacy-safety')}>
                <Shield className="w-4 h-4 mr-2" />
                Privacy & Safety
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/help-support')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-3 bg-primary/10 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-border transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="py-2 max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your matches...</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.match_id}
              onClick={() => setSelectedChat(match.matched_user_id)}
              className="flex items-center w-full max-w-md mx-auto py-4 px-3 sm:px-6 cursor-pointer bg-card rounded-2xl shadow-md border border-border mb-4 group animate-fade-in transition-all duration-300 hover:shadow-lg hover:border-border"
              style={{ boxSizing: 'border-box' }}
            >
              <div className="relative mr-4">
                <div className="relative overflow-hidden">
                  <img 
                    src={match.avatar_url || profile1} 
                    alt={match.display_name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-primary/15 shadow-md group-hover:ring-primary/20 transition-all duration-300"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-primary border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                  {/* Premium crown overlay */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <h3 className="font-semibold text-foreground text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                      {match.display_name}
                    </h3>
                    <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                      {match.match_score}% match
                    </Badge>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground/60 flex-shrink-0">
                    {new Date(match.matched_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1 mr-2 leading-relaxed">
                    {match.bio || "Start a conversation..."}
                  </p>
                  <Badge className="bg-gradient-to-r from-primary to-primary text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center font-medium shadow-sm flex-shrink-0">
                    ✓
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}

        {/* People Who Like You Section */}
        <div className="mt-8 mb-6">
          <div className="px-4 mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">People who liked you</h2>
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isPremiumUser
                ? "See who liked you and start connecting!"
                : "Upgrade to see who liked you and unlock special matches!"
              }
            </p>
          </div>

          {/* Premium Upsell Card for non-premium users */}
          {!isPremiumUser && (
            <div className="mx-4 mb-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Unlock Secret Admirers
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Discover who liked your profile and get access to premium matches with better compatibility scores.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Likers Grid */}
          <div className="px-4">
            <div className="grid grid-cols-2 gap-4">
              {peopleWhoLikeYou.map((person) => (
                <div
                  key={person.id}
                  className={`relative bg-card rounded-2xl shadow-md overflow-hidden border border-border transition-all duration-300 ${
                    isPremiumUser
                      ? 'cursor-pointer hover:shadow-lg'
                      : 'cursor-default opacity-75'
                  }`}
                  onClick={() => isPremiumUser && navigate(`/profile/${person.id}`)}
                >
                  {/* Blur overlay for non-premium users */}
                  {!isPremiumUser && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                        <p className="text-xs font-medium text-muted-foreground">Premium Only</p>
                      </div>
                    </div>
                  )}

                  {/* Profile Image */}
                  <div className={`relative ${isPremiumUser ? '' : 'filter blur-sm'}`}>
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-32 object-cover"
                    />
                    {/* Heart overlay */}
                    <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className={`p-3 ${isPremiumUser ? '' : 'filter blur-sm'}`}>
                    <h4 className="font-semibold text-foreground text-sm truncate">{person.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{person.age} • {person.location}</p>
                    {isPremiumUser && (
                      <button
                        className="w-full mt-3 bg-gradient-to-r from-primary to-primary text-white py-2 rounded-lg text-xs font-medium hover:shadow-md transition-all duration-300"
                      >
                        Say Hi! 👋
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default Chat;
