import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Camera, Send, ArrowLeft, Crown, Mic, Smile, Video, Settings, Shield, HelpCircle, Heart, Lock, Sparkles, SlidersHorizontal, UserX, Image as ImageIcon } from "lucide-react";

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
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Demo data for people who liked you
  const peopleWhoLikeYou = [
    { id: "like-1", name: "Maya Chen", age: 28, location: "San Francisco, CA", image: profile1 },
    { id: "like-2", name: "Rachel Green", age: 26, location: "Seattle, WA", image: profile3 },
    { id: "like-3", name: "Jessica Wang", age: 29, location: "Austin, TX", image: profile2 },
    { id: "like-4", name: "Sophia Adams", age: 25, location: "Phoenix, AZ", image: profile1 },
    { id: "like-5", name: "Lauren Miller", age: 27, location: "Dallas, TX", image: profile2 },
    { id: "like-6", name: "Hannah Brooks", age: 24, location: "Nashville, TN", image: profile3 }
  ];
  
  const demoMatches: MatchData[] = [
    {
      match_id: "demo-1", matched_user_id: "demo-user-1",
      first_name: "Sarah", last_name: "Johnson", display_name: "Sarah Johnson",
      age: 25, location: "New York, NY", bio: "Love music, art, and meaningful conversations 🎵",
      avatar_url: profile1, match_score: 95,
      matched_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      match_id: "demo-2", matched_user_id: "demo-user-2",
      first_name: "Emily", last_name: "Chen", display_name: "Emily Chen",
      age: 23, location: "Los Angeles, CA", bio: "Passionate about photography and travel ✈️",
      avatar_url: profile2, match_score: 88,
      matched_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      match_id: "demo-3", matched_user_id: "demo-user-3",
      first_name: "Jessica", last_name: "Martinez", display_name: "Jessica Martinez",
      age: 27, location: "Chicago, IL", bio: "Book lover, coffee enthusiast, and nature explorer 📚",
      avatar_url: profile3, match_score: 92,
      matched_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const demoMessages: { [key: string]: Message[] } = {
    "demo-user-1": [
      { id: "demo-msg-1", sender_id: "demo-user-1", match_id: "demo-match-1", content: "Hey! I saw you're into music too 🎵", message_type: "text", created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), is_read: true },
      { id: "demo-msg-2", sender_id: user?.id || "", match_id: "demo-match-1", content: "Yes! I love discovering new artists. What's your favorite genre?", message_type: "text", created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(), is_read: true },
      { id: "demo-msg-3", sender_id: "demo-user-1", match_id: "demo-match-1", content: "I'm really into indie rock and some electronic music. There's this new band I found called Aurora Dreams - they're incredible!", message_type: "text", created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), is_read: true },
      { id: "demo-msg-4", sender_id: user?.id || "", match_id: "demo-match-1", content: "That sounds amazing! I'd love to check them out. Do you want to go to a concert together sometime?", message_type: "text", created_at: new Date(Date.now() - 23 * 60 * 1000).toISOString(), is_read: true },
      { id: "demo-msg-5", sender_id: "demo-user-1", match_id: "demo-match-1", content: "That sounds amazing! I'd love to go 🎵", message_type: "text", created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), is_read: false },
    ]
  };

  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;
    fetchMatches();

    const matchChannel = supabase
      .channel('matches-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchMatches())
      .subscribe();

    return () => { supabase.removeChannel(matchChannel); };
  }, [user?.id]);

  useEffect(() => {
    if (selectedChat && user?.id) {
      fetchMessages(selectedChat);

      const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
      if (currentMatch && !currentMatch.match_id.startsWith('demo')) {
        const messageChannel = supabase
          .channel(`messages-${currentMatch.match_id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${currentMatch.match_id}`,
          }, (payload) => {
            const newMsg = payload.new as Message;
            setMessages(prev => [...prev, newMsg]);
          })
          .subscribe();

        return () => { supabase.removeChannel(messageChannel); };
      }
    }
  }, [selectedChat, user?.id]);

  const fetchMatches = async () => {
    if (!user?.id) return;
    try {
      // Get blocked user IDs
      const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      const blockedIds = blocks?.map(b => b.blocked_id) || [];

      // Also get users who blocked me
      const { data: blockedBy } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocked_id', user.id);
      const blockedByIds = blockedBy?.map(b => b.blocker_id) || [];
      const allBlockedIds = [...new Set([...blockedIds, ...blockedByIds])];

      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'matched');

      if (error || !matchesData || matchesData.length === 0) {
        setMatches(demoMatches);
        setLoading(false);
        return;
      }

      // Filter out blocked users
      const filteredMatches = matchesData.filter(m => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        return !allBlockedIds.includes(otherId);
      });

      if (filteredMatches.length === 0) {
        setMatches(demoMatches);
        setLoading(false);
        return;
      }

      // Get the other user's profile for each match
      const otherUserIds = filteredMatches.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherUserIds);

      const formattedMatches: MatchData[] = filteredMatches.map(match => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const profile = profiles?.find(p => p.user_id === otherUserId);
        return {
          match_id: match.id,
          matched_user_id: otherUserId,
          first_name: profile?.display_name?.split(' ')[0] || 'User',
          last_name: profile?.display_name?.split(' ').slice(1).join(' ') || '',
          display_name: profile?.display_name || 'User',
          age: profile?.age || 0,
          location: profile?.location || '',
          bio: profile?.bio || '',
          avatar_url: profile?.photos?.[0] || profile1,
          match_score: Math.floor(Math.random() * 15) + 85,
          matched_at: match.matched_at || match.created_at,
        };
      });

      setMatches(formattedMatches.length > 0 ? formattedMatches : demoMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches(demoMatches);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchUserId: string) => {
    if (!user?.id) return;
    
    if (matchUserId.startsWith('demo-user-')) {
      setMessages(demoMessages[matchUserId] || []);
      return;
    }
    
    const currentMatch = matches.find(m => m.matched_user_id === matchUserId);
    if (!currentMatch) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', currentMatch.match_id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages((data || []) as unknown as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id) return;
    
    if (selectedChat.startsWith('demo-user-')) {
      const newMsg: Message = {
        id: `demo-msg-${Date.now()}`,
        sender_id: user.id,
        match_id: "demo-match-1",
        content: newMessage,
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: false,
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setShowEmojiPicker(false);
      return;
    }
    
    const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
    if (!currentMatch) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          match_id: currentMatch.match_id,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    if (!selectedChat || !user?.id) return;
    
    // Demo handling
    if (selectedChat.startsWith('demo-user-')) {
      const newMsg: Message = {
        id: `demo-msg-${Date.now()}`,
        sender_id: user.id,
        match_id: "demo-match-1",
        content: `🎤 Voice message (${duration}s)`,
        message_type: "voice",
        created_at: new Date().toISOString(),
        is_read: false,
      };
      setMessages(prev => [...prev, newMsg]);
      setShowVoiceRecorder(false);
      toast({ title: "Voice message sent" });
      return;
    }

    const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
    if (!currentMatch) return;

    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          match_id: currentMatch.match_id,
          content: `Voice message (${duration}s)`,
          message_type: 'voice'
        });

      if (error) throw error;
      setShowVoiceRecorder(false);
      toast({ title: "Voice message sent" });
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({ title: "Error", description: "Failed to send voice message.", variant: "destructive" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !user?.id) return;

    // Demo handling
    if (selectedChat.startsWith('demo-user-')) {
      const newMsg: Message = {
        id: `demo-msg-${Date.now()}`,
        sender_id: user.id,
        match_id: "demo-match-1",
        content: `📷 Photo sent`,
        message_type: "image",
        created_at: new Date().toISOString(),
        is_read: false,
      };
      setMessages(prev => [...prev, newMsg]);
      toast({ title: "Photo sent" });
      return;
    }

    const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
    if (!currentMatch) return;

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          match_id: currentMatch.match_id,
          content: publicUrl,
          message_type: 'image'
        });

      if (error) throw error;
      toast({ title: "Photo sent" });
    } catch (error) {
      console.error('Error sending image:', error);
      toast({ title: "Error", description: "Failed to send photo.", variant: "destructive" });
    }
  };

  const handleUnmatch = async () => {
    if (!selectedChat || !user?.id) return;

    const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
    
    // Demo handling
    if (selectedChat.startsWith('demo-user-') || !currentMatch) {
      setMatches(prev => prev.filter(m => m.matched_user_id !== selectedChat));
      setSelectedChat(null);
      setMessages([]);
      toast({ title: "Unmatched", description: "You've unmatched with this person." });
      return;
    }

    try {
      // Delete messages first, then the match
      await supabase.from('messages').delete().eq('match_id', currentMatch.match_id);
      const { error } = await supabase.from('matches').delete().eq('id', currentMatch.match_id);
      if (error) throw error;

      setMatches(prev => prev.filter(m => m.match_id !== currentMatch.match_id));
      setSelectedChat(null);
      setMessages([]);
      toast({ title: "Unmatched", description: "You've unmatched with this person." });
    } catch (error) {
      console.error('Error unmatching:', error);
      toast({ title: "Error", description: "Failed to unmatch.", variant: "destructive" });
    }
  };

  const handleVideoCall = () => setShowVideoCall(true);

  // Hidden file input for camera/image upload
  const triggerImageUpload = () => fileInputRef.current?.click();

  if (selectedChat) {
    const currentMatch = matches.find(m => m.matched_user_id === selectedChat);
    const currentUser = currentMatch;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col h-screen max-h-screen relative">
        {/* Chat Header */}
        <div className="bg-card/95 backdrop-blur-md border-b border-border/50 px-3 py-2.5 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              
              <div className="relative">
                <img 
                  src={currentUser?.avatar_url || profile1} 
                  alt={currentUser?.display_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/15"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-[1.5px] border-card rounded-full"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{currentUser?.display_name}</h3>
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {currentUser?.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleVideoCall}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                title="Video Call"
              >
                <Video className="w-5 h-5 text-primary" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-primary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${selectedChat}`)}>
                    <Heart className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleUnmatch}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Unmatch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 pb-36 pt-3 space-y-3 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              {message.message_type === 'voice' ? (
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border text-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm">🎤 Voice message</p>
                  <p className={`text-xs mt-1.5 ${
                    message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : message.message_type === 'image' ? (
                <div className={`max-w-[80%] rounded-2xl shadow-sm overflow-hidden ${
                  message.sender_id === user?.id
                    ? 'bg-primary rounded-br-md'
                    : 'bg-card border border-border rounded-bl-md'
                }`}>
                  {message.content.startsWith('http') ? (
                    <img src={message.content} alt="Shared photo" className="max-w-full max-h-60 object-cover" />
                  ) : (
                    <div className="px-4 py-3">
                      <p className={`text-sm ${message.sender_id === user?.id ? 'text-primary-foreground' : 'text-foreground'}`}>{message.content}</p>
                    </div>
                  )}
                  <p className={`text-xs px-4 py-1.5 ${
                    message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1.5 ${
                    message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Message Input */}
        <div
          className="bg-card/95 backdrop-blur-md border-t border-border/50 px-3 py-2 fixed bottom-0 left-0 w-full z-50"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4.5rem)' }}
        >
          {showVoiceRecorder && (
            <VoiceRecorder onSend={handleVoiceSend} onClose={() => setShowVoiceRecorder(false)} />
          )}
          
          {showEmojiPicker && (
            <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
          )}
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setShowVoiceRecorder(!showVoiceRecorder); setShowEmojiPicker(false); }}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                showVoiceRecorder ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 text-primary'
              }`}
              title="Voice Message"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button 
              onClick={triggerImageUpload}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
              title="Send Photo"
            >
              <Camera className="w-5 h-5 text-primary" />
            </button>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-2 pr-10 bg-muted/60 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors text-sm placeholder:text-muted-foreground"
              />
              <button
                onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowVoiceRecorder(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-primary/10 rounded-full transition-colors"
                title="Emojis"
              >
                <Smile className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <button 
              onClick={handleSendMessage}
              className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                newMessage.trim() ? 'bg-primary shadow-md hover:shadow-lg' : 'bg-muted'
              }`}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          userName={currentUser?.display_name || ""}
          userImage={currentUser?.avatar_url || ""}
        />
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
            <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
              {matches.length} conversations
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
              <input type="text" placeholder="Search conversations..." className="pl-10 pr-4 py-2.5 bg-muted/50 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 w-80 text-sm" />
            </div>
            <button className="p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border transition-colors" title="Filter">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-3 rounded-xl hover:bg-muted/50 transition-colors"><MoreHorizontal className="w-5 h-5 text-primary" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/preferences')}><Settings className="w-4 h-4 mr-2" />Preferences</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/privacy-safety')}><Shield className="w-4 h-4 mr-2" />Privacy & Safety</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help-support')}><HelpCircle className="w-4 h-4 mr-2" />Help & Support</DropdownMenuItem>
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
              <DropdownMenuItem onClick={() => navigate('/preferences')}><Settings className="w-4 h-4 mr-2" />Preferences</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/privacy-safety')}><Shield className="w-4 h-4 mr-2" />Privacy & Safety</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/help-support')}><HelpCircle className="w-4 h-4 mr-2" />Help & Support</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
            <input type="text" placeholder="Search conversations..." className="w-full pl-12 pr-4 py-3 bg-muted/50 rounded-2xl border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors" />
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="py-2 max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="text-center py-8"><p className="text-muted-foreground">Loading matches...</p></div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8"><p className="text-muted-foreground">No matches yet. Start swiping!</p></div>
        ) : (
          matches.map((match) => (
            <div
              key={match.match_id}
              onClick={() => setSelectedChat(match.matched_user_id)}
              className="flex items-center w-full max-w-md mx-auto py-4 px-3 sm:px-6 cursor-pointer bg-card rounded-2xl shadow-md border border-border mb-4 group animate-fade-in transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative mr-4">
                <div className="relative overflow-hidden">
                  <img src={match.avatar_url || profile1} alt={match.display_name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-primary/15 shadow-md" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-card rounded-full animate-pulse"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">{match.display_name}</h3>
                    <Badge className="bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{match.match_score}%</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{new Date(match.matched_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{match.bio || "Start a conversation..."}</p>
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
              <Badge className="bg-amber-500 text-white text-xs font-medium">
                <Sparkles className="w-3 h-3 mr-1" />Premium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isPremiumUser ? "See who liked you and start connecting!" : "Upgrade to see who liked you!"}
            </p>
          </div>

          {!isPremiumUser && (
            <div className="mx-4 mb-4 bg-muted/30 rounded-2xl border border-border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Unlock Secret Admirers</h3>
              <p className="text-muted-foreground mb-4 text-sm">Discover who liked your profile and get premium matches.</p>
              <button onClick={() => navigate('/pricing')} className="bg-amber-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all">
                <Sparkles className="w-4 h-4 mr-2 inline" />Upgrade to Premium
              </button>
            </div>
          )}

          <div className="px-4">
            <div className="grid grid-cols-2 gap-4">
              {peopleWhoLikeYou.map((person) => (
                <div key={person.id} className={`relative bg-card rounded-2xl shadow-md overflow-hidden border border-border transition-all ${isPremiumUser ? 'cursor-pointer hover:shadow-lg' : 'cursor-default opacity-75'}`} onClick={() => isPremiumUser && navigate(`/profile/${person.id}`)}>
                  {!isPremiumUser && (
                    <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                        <p className="text-xs font-medium text-muted-foreground">Premium Only</p>
                      </div>
                    </div>
                  )}
                  <div className={isPremiumUser ? '' : 'blur-sm'}>
                    <img src={person.image} alt={person.name} className="w-full h-32 object-cover" />
                    <div className="absolute top-3 right-3 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <div className={`p-3 ${isPremiumUser ? '' : 'blur-sm'}`}>
                    <h4 className="font-semibold text-foreground text-sm truncate">{person.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{person.age} • {person.location}</p>
                    {isPremiumUser && (
                      <button className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-medium hover:shadow-md transition-all">Say Hi! 👋</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
