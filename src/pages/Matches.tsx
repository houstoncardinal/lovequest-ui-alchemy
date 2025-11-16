import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Camera, Send, ArrowLeft, Crown, Mic, Smile, Video, Phone, Settings, Shield, HelpCircle } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import EmojiPicker from "@/components/EmojiPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import VideoCallModal from "@/components/VideoCallModal";
import VoiceMessage from "@/components/VoiceMessage";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { db, collection, query, where, onSnapshot, orderBy, Timestamp } from "@/integrations/firebase";
import { getUserMatches, areUsersMatched } from "@/lib/firestore/matches";
import { sendMessage, getMessages, subscribeToMessages } from "@/lib/firestore/messages";
import { storage, ref as storageRef, uploadBytes, getDownloadURL } from "@/integrations/firebase";
import { useAuth } from "@/contexts/AuthContext";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'voice';
  attachmentUrl?: string | null;
  createdAt: string;
  isRead: boolean;
  isDeleted?: boolean;
  updatedAt?: string;
}

interface MatchData {
  matchId: string;
  matchedUserId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  age: number;
  location: string;
  bio: string;
  avatarUrl: string;
  religionLevel: string;
  prayerFrequency: string;
  hijabStatus: string;
  matchScore: number;
  matchedAt: string;
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
  const { toast } = useToast();

  // Fetch matches and set up real-time subscriptions
  useEffect(() => {
    if (!user?.uid) return;

    fetchMatches();

    // Set up real-time subscription for new matches
    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          handleNewMatch();
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat && user?.uid) {
      fetchMessages(selectedChat);

      // Find the match document to get matchId
      const currentMatch = matches.find(m => m.matchedUserId === selectedChat);
      if (!currentMatch) return;

      // Set up real-time subscription for messages using our helper
      const unsubscribe = subscribeToMessages(currentMatch.matchId, (newMessages) => {
        setMessages(newMessages);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [selectedChat, user?.uid, matches]);

  const fetchMatches = async () => {
    if (!user?.uid) return;

    try {
      // Get user's matches from Firestore
      const userMatches = await getUserMatches(user.uid);

      // Transform to MatchData format
      const matchData: MatchData[] = userMatches.map(match => {
        // Determine which user is the matched user (not current user)
        const isUser1 = match.user1Id === user.uid;
        const matchedUserId = isUser1 ? match.user2Id : match.user1Id;
        const matchedUserData = isUser1 ? match.user2Data : match.user1Data;

        return {
          matchId: match.id,
          matchedUserId: matchedUserId,
          firstName: matchedUserData?.firstName || '',
          lastName: matchedUserData?.lastName || '',
          displayName: matchedUserData?.displayName || '',
          age: matchedUserData?.age || 0,
          location: matchedUserData?.location || '',
          bio: matchedUserData?.bio || '',
          avatarUrl: (matchedUserData?.photos && matchedUserData.photos[0]) || '',
          religionLevel: matchedUserData?.religionLevel || '',
          prayerFrequency: matchedUserData?.prayerFrequency || '',
          hijabStatus: matchedUserData?.hijabStatus || '',
          matchScore: match.matchScore || 0,
          matchedAt: match.matchedAt || new Date().toISOString(),
        };
      });

      setMatches(matchData);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchUserId: string) => {
    if (!user?.uid) return;

    try {
      // Find the match document to get matchId
      const currentMatch = matches.find(m => m.matchedUserId === matchUserId);
      if (!currentMatch) {
        console.error('Match not found for user:', matchUserId);
        return;
      }

      // Get messages from Firestore
      const messagesData = await getMessages(currentMatch.matchId, 100);

      // Transform to Message format
      const transformedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        messageType: msg.messageType,
        attachmentUrl: msg.attachmentUrl,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
        isDeleted: msg.isDeleted,
        updatedAt: msg.updatedAt,
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMatch = () => {
    console.log('New match detected');
    fetchMatches(); // Refresh matches list
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.uid) return;

    try {
      // Find the match document to get matchId
      const currentMatch = matches.find(m => m.matchedUserId === selectedChat);
      if (!currentMatch) {
        toast({
          title: "Cannot send message",
          description: "Match not found.",
          variant: "destructive",
        });
        return;
      }

      // Check if users are matched before sending
      const matched = await areUsersMatched(user.uid, selectedChat);

      if (!matched) {
        toast({
          title: "Cannot send message",
          description: "You can only message users you've matched with.",
          variant: "destructive",
        });
        return;
      }

      // TODO: Content moderation - will be implemented via Cloud Function
      // For now, skip moderation

      // Send message via Firestore helper
      await sendMessage(
        currentMatch.matchId,
        user.uid,
        selectedChat,
        newMessage,
        'text'
      );

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
    if (!selectedChat || !user?.uid) return;

    try {
      // Find the match document to get matchId
      const currentMatch = matches.find(m => m.matchedUserId === selectedChat);
      if (!currentMatch) {
        toast({
          title: "Cannot send voice message",
          description: "Match not found.",
          variant: "destructive",
        });
        return;
      }

      // Upload voice message to Firebase Storage
      const fileExt = 'webm';
      const fileName = `${user.uid}_${Date.now()}.${fileExt}`;
      const filePath = `message-attachments/${currentMatch.matchId}/${fileName}`;

      const fileRef = storageRef(storage, filePath);
      await uploadBytes(fileRef, audioBlob);

      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);

      // Send message via Firestore helper
      await sendMessage(
        currentMatch.matchId,
        user.uid,
        selectedChat,
        `Voice message (${duration}s)`,
        'voice',
        downloadUrl
      );

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
    const currentMatch = matches.find(m => m.matchedUserId === selectedChat);
    const currentUser = currentMatch;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex flex-col h-screen max-h-screen relative">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-4 py-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSelectedChat(null)}
                className="mr-4 p-2 rounded-full hover:bg-emerald-50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-emerald-600" />
              </button>
              
                <div className="relative mr-3 sm:mr-4">
                <img
                  src={currentUser?.avatarUrl || profile1}
                  alt={currentUser?.displayName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg">{currentUser?.displayName}</h3>
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
        <div className="flex-1 px-4 pb-40 sm:pb-32 space-y-4 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              {message.messageType === 'voice' && message.attachmentUrl ? (
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.senderId === user?.uid
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
                    : 'bg-white border border-emerald-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="text-sm">Voice message</p>
                  <audio controls className="mt-2 w-full">
                    <source src={message.attachmentUrl} type="audio/webm" />
                  </audio>
                  <p className={`text-xs mt-2 ${
                    message.senderId === user?.uid ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.senderId === user?.uid
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
                      : 'bg-white border border-emerald-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.senderId === user?.uid ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div
          className="bg-white/90 backdrop-blur-sm border-t-2 border-emerald-200 px-4 py-4 fixed bottom-0 left-0 w-full z-50 shadow-lg"
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
          userName={currentUser?.displayName || ""}
          userImage={currentUser?.avatarUrl || ""}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-emerald-50 transition-colors">
                <MoreHorizontal className="w-6 h-6 text-emerald-600" />
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
      <div className="py-2 max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600">Start swiping to find your perfect match!</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.matchId}
              onClick={() => setSelectedChat(match.matchedUserId)}
              className="flex items-center w-full max-w-md mx-auto py-4 px-3 sm:px-6 cursor-pointer bg-white rounded-2xl shadow-md border border-emerald-100 mb-4 group animate-fade-in transition-all duration-300 hover:shadow-lg hover:border-emerald-200"
              style={{ boxSizing: 'border-box' }}
            >
              <div className="relative mr-4">
                <div className="relative overflow-hidden">
                  <img
                    src={match.avatarUrl || profile1}
                    alt={match.displayName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-emerald-100 shadow-md group-hover:ring-emerald-200 transition-all duration-300"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                  {/* Premium crown overlay */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg group-hover:text-emerald-600 transition-colors truncate">
                      {match.displayName}
                    </h3>
                    <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                      {match.matchScore}% match
                    </Badge>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                    {new Date(match.matchedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2 leading-relaxed">
                    {match.bio || "Start a conversation..."}
                  </p>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center font-medium shadow-sm flex-shrink-0">
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