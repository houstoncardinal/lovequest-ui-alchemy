import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Camera, Send, ArrowLeft, Crown, Mic, Smile, Video, Phone } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import EmojiPicker from "@/components/EmojiPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import VideoCallModal from "@/components/VideoCallModal";
import VoiceMessage from "@/components/VoiceMessage";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'voice';
  attachment_url?: string | null;
  created_at: string;
  is_read: boolean;
  is_deleted?: boolean;
  updated_at?: string;
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
  religion_level: string;
  prayer_frequency: string;
  hijab_status: string;
  match_score: number;
  matched_at: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchUserId: string) => {
    if (!user?.id) return;
    
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSelectedChat(null)}
                className="mr-4 p-2 rounded-full hover:bg-emerald-50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-emerald-600" />
              </button>
              
                <div className="relative mr-4">
                <img 
                  src={currentUser?.avatar_url || profile1} 
                  alt={currentUser?.display_name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg">{currentUser?.display_name}</h3>
                  <Crown className="w-4 h-4 text-amber-500 fill-current" />
                </div>
                <p className="text-sm text-gray-600">
                  {currentUser?.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleVideoCall}
                className="p-2 rounded-full hover:bg-emerald-50 transition-colors"
                title="Video Call"
              >
                <Video className="w-6 h-6 text-emerald-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-emerald-50 transition-colors">
                <MoreHorizontal className="w-6 h-6 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              {message.message_type === 'voice' && message.attachment_url ? (
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender_id === user?.id
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
                    : 'bg-white border border-emerald-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="text-sm">Voice message</p>
                  <audio controls className="mt-2 w-full">
                    <source src={message.attachment_url} type="audio/webm" />
                  </audio>
                  <p className={`text-xs mt-2 ${
                    message.sender_id === user?.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender_id === user?.id
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
                      : 'bg-white border border-emerald-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender_id === user?.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-emerald-100 px-4 py-4 relative">
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
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
              }`}
              title="Voice Message"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button 
              className="p-3 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors"
              title="Camera"
            >
              <Camera className="w-5 h-5 text-emerald-600" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 bg-emerald-50 rounded-2xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-colors"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-100 rounded-full transition-colors"
                title="Emojis"
              >
                <Smile className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
            
            <button 
              onClick={handleSendMessage}
              className={`p-3 rounded-full transition-all duration-200 ${
                newMessage.trim() 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200'
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Matches</h1>
          <button className="p-2 rounded-full hover:bg-emerald-50 transition-colors">
            <MoreHorizontal className="w-6 h-6 text-emerald-600" />
          </button>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.match_id}
              onClick={() => setSelectedChat(match.matched_user_id)}
              className="flex items-center py-4 cursor-pointer hover:bg-white hover:rounded-2xl hover:px-3 transition-all duration-300 mb-2"
            >
              <div className="relative mr-4">
                <img 
                  src={match.avatar_url || profile1} 
                  alt={match.display_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-100"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{match.display_name}</h3>
                    <Crown className="w-4 h-4 text-amber-500 fill-current" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(match.matched_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate flex-1 mr-3 leading-relaxed">
                    {match.bio || "Start a conversation..."}
                  </p>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-sm">
                    ✓
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default Chat;