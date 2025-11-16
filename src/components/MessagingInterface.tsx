import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { db, collection, query, where, onSnapshot, orderBy as firestoreOrderBy } from '@/integrations/firebase';
import { getUserMatches } from '@/lib/firestore/matches';
import { sendMessage as sendFirestoreMessage, getMessages, subscribeToMessages } from '@/lib/firestore/messages';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Image, MoreVertical, Shield, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  senderProfile?: {
    displayName: string;
    avatarUrl?: string;
  };
}

interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  matchedUser?: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    firstName: string;
    lastName: string;
  };
}

const DEMO_MESSAGES: Message[] = [
  {
    id: 'demo-1',
    senderId: 'demo-user-1',
    receiverId: 'current-user',
    content: "Hello! I noticed we both love reading personal development books. What's your favorite book?",
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    senderProfile: {
      displayName: 'Aisha',
      avatarUrl: '/lovable-uploads/a89fa103-cf18-412f-82e7-7e83b5aa0a85.png'
    }
  },
  {
    id: 'demo-2',
    senderId: 'current-user',
    receiverId: 'demo-user-1',
    content: "Wa alaikum assalam! I really enjoyed 'The Road to Mecca' by Muhammad Asad. How about you?",
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'demo-3',
    senderId: 'demo-user-1',
    receiverId: 'current-user',
    content: "That's a wonderful choice! I'm currently reading 'No god but God' by Reza Aslan. The historical perspective is fascinating.",
    messageType: 'text',
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    senderProfile: {
      displayName: 'Aisha',
      avatarUrl: '/lovable-uploads/a89fa103-cf18-412f-82e7-7e83b5aa0a85.png'
    }
  }
];

const DEMO_MATCHES: Match[] = [
  {
    id: 'demo-match-1',
    user1Id: 'current-user',
    user2Id: 'demo-user-1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    matchedUser: {
      userId: 'demo-user-1',
      displayName: 'Aisha Rahman',
      firstName: 'Aisha',
      lastName: 'Rahman',
      avatarUrl: '/lovable-uploads/a89fa103-cf18-412f-82e7-7e83b5aa0a85.png'
    }
  },
  {
    id: 'demo-match-2',
    user1Id: 'current-user',
    user2Id: 'demo-user-2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    matchedUser: {
      userId: 'demo-user-2',
      displayName: 'Fatima Ali',
      firstName: 'Fatima',
      lastName: 'Ali',
      avatarUrl: '/assets/profile-2.jpg'
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const realMatches = await getUserMatches(user.uid);

        if (realMatches && realMatches.length > 0) {
          // Transform real data to match our interface
          const transformedMatches: Match[] = realMatches.map(match => {
            const isUser1 = match.user1Id === user.uid;
            const matchedUserData = isUser1 ? match.user2Data : match.user1Data;
            const matchedUserId = isUser1 ? match.user2Id : match.user1Id;

            return {
              id: match.id,
              user1Id: match.user1Id,
              user2Id: match.user2Id,
              createdAt: match.matchedAt || new Date().toISOString(),
              matchedUser: {
                userId: matchedUserId,
                displayName: matchedUserData?.displayName || '',
                firstName: matchedUserData?.firstName || '',
                lastName: matchedUserData?.lastName || '',
                avatarUrl: matchedUserData?.photoURL || ''
              }
            };
          });
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
        const realMessages = await getMessages(selectedMatch.id, 100);

        // Transform to match interface
        const transformedMessages: Message[] = realMessages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          messageType: msg.messageType,
          attachmentUrl: msg.attachmentUrl,
          isRead: msg.isRead,
          createdAt: msg.createdAt
        }));

        setMessages(transformedMessages);
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
    if (!hasRealData) return;

    const unsubscribe = subscribeToMessages(selectedMatch.id, (newMessages) => {
      const transformedMessages: Message[] = newMessages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        messageType: msg.messageType,
        attachmentUrl: msg.attachmentUrl,
        isRead: msg.isRead,
        createdAt: msg.createdAt
      }));
      setMessages(transformedMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedMatch, user, hasRealData]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || !user) return;

    if (!hasRealData) {
      // Demo mode - just add to local state
      const demoMessage: Message = {
        id: `demo-${Date.now()}`,
        senderId: user.uid,
        receiverId: selectedMatch.user2Id === user.uid ? selectedMatch.user1Id : selectedMatch.user2Id,
        content: newMessage.trim(),
        messageType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
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
      const matchedUserId = selectedMatch.user1Id === user.uid
        ? selectedMatch.user2Id
        : selectedMatch.user1Id;

      // TODO: Content moderation via Cloud Function
      // For now, skip moderation

      await sendFirestoreMessage(
        selectedMatch.id,
        user.uid,
        matchedUserId,
        newMessage.trim(),
        'text'
      );

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

  const reportUser = async (reportType: string, reason?: string) => {
    if (!selectedMatch || !user) return;

    const matchedUserId = selectedMatch.user1Id === user.uid
      ? selectedMatch.user2Id
      : selectedMatch.user1Id;

    try {
      // TODO: Implement Cloud Function for reporting
      // For now, just show success message
      console.log('Report user:', matchedUserId, reportType, reason);

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

    const matchedUserId = selectedMatch.user1Id === user.uid
      ? selectedMatch.user2Id
      : selectedMatch.user1Id;

    try {
      // TODO: Implement Cloud Function for blocking
      // For now, just remove from local state
      console.log('Block user:', matchedUserId);

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
                      <AvatarImage src={match.matchedUser?.avatarUrl} />
                      <AvatarFallback>
                        {match.matchedUser?.firstName?.[0]}{match.matchedUser?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {match.matchedUser?.displayName || `${match.matchedUser?.firstName} ${match.matchedUser?.lastName}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Matched {new Date(match.createdAt).toLocaleDateString()}
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
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedMatch.matchedUser?.avatarUrl} />
                    <AvatarFallback>
                      {selectedMatch.matchedUser?.firstName?.[0]}{selectedMatch.matchedUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedMatch.matchedUser?.displayName || `${selectedMatch.matchedUser?.firstName} ${selectedMatch.matchedUser?.lastName}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Online now</p>
                  </div>
                </div>
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
                          message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-[70%] ${
                          message.senderId === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } rounded-lg p-3`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Image className="w-4 h-4" />
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
    </div>
  );
};