import { useState } from "react";
import { Search, MoreHorizontal, Camera, Send, ArrowLeft, Crown } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import { Badge } from "@/components/ui/badge";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const conversations = [
    {
      id: "1",
      name: "Shafa Asadel",
      lastMessage: "That sounds amazing! I'd love to go 🎵",
      time: "2m",
      image: profile1,
      unread: 2,
      online: true,
      isPremium: true
    },
    {
      id: "2", 
      name: "Roseane Rose",
      lastMessage: "Thanks for sharing that playlist!",
      time: "1h",
      image: profile2,
      unread: 0,
      online: true,
      isPremium: false
    },
    {
      id: "3",
      name: "Aura Alexandra",
      lastMessage: "See you there! 😊",
      time: "3h",
      image: profile3,
      unread: 1,
      online: false,
      isPremium: true
    },
    {
      id: "4",
      name: "Emma Wilson",
      lastMessage: "Let's plan something for the weekend",
      time: "1d",
      image: profile1,
      unread: 0,
      online: false,
      isPremium: false
    }
  ];

  const messages = [
    {
      id: "1",
      sender: "them",
      text: "Hey! I saw you're into music too 🎵",
      time: "10:30 AM"
    },
    {
      id: "2",
      sender: "me", 
      text: "Yes! I love discovering new artists. What's your favorite genre?",
      time: "10:32 AM"
    },
    {
      id: "3",
      sender: "them",
      text: "I'm really into indie rock and some electronic music. There's this new band I found called Aurora Dreams - they're incredible!",
      time: "10:35 AM"
    },
    {
      id: "4",
      sender: "me",
      text: "That sounds amazing! I'd love to check them out. Do you want to go to a concert together sometime?",
      time: "10:37 AM"
    },
    {
      id: "5",
      sender: "them",
      text: "That sounds amazing! I'd love to go 🎵",
      time: "10:40 AM"
    }
  ];

  if (selectedChat) {
    const currentUser = conversations.find(c => c.id === selectedChat);
    
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
                  src={currentUser?.image} 
                  alt={currentUser?.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                />
                {currentUser?.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg">{currentUser?.name}</h3>
                  {currentUser?.isPremium && (
                    <Crown className="w-4 h-4 text-amber-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {currentUser?.online ? "Online" : "Last seen 2h ago"}
                </p>
              </div>
            </div>
            
            <button className="p-2 rounded-full hover:bg-emerald-50 transition-colors">
              <MoreHorizontal className="w-6 h-6 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === 'me'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
                    : 'bg-white border border-emerald-100 text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-emerald-100 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button className="p-3 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <Camera className="w-5 h-5 text-emerald-600" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-colors"
              />
            </div>
            
            <button 
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

        <InteractiveMenu />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
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

      {/* Conversations List */}
      <div className="px-4 py-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setSelectedChat(conversation.id)}
            className="flex items-center py-4 cursor-pointer hover:bg-white hover:rounded-2xl hover:px-3 transition-all duration-300 mb-2"
          >
            <div className="relative mr-4">
              <img 
                src={conversation.image} 
                alt={conversation.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-100"
              />
              {conversation.online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{conversation.name}</h3>
                  {conversation.isPremium && (
                    <Crown className="w-4 h-4 text-amber-500 fill-current" />
                  )}
                </div>
                <span className="text-xs text-gray-500">{conversation.time}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1 mr-3 leading-relaxed">
                  {conversation.lastMessage}
                </p>
                {conversation.unread > 0 && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-sm">
                    {conversation.unread}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default Chat;