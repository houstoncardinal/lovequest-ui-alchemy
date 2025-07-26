import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostMenu from "@/components/PostMenu";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    location?: string;
    hashtags?: string[];
    mood?: string;
    is_trending: boolean;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_id: string;
    profiles?: {
      display_name?: string;
      avatar_url?: string;
      first_name?: string;
      last_name?: string;
    } | null;
    user_liked?: boolean;
  };
  currentUserId?: string;
  onLike: (postId: string, isLiked: boolean) => void;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  formatTimeAgo: (dateString: string) => string;
}

const PostCard = ({ post, currentUserId, onLike, onEdit, onDelete, formatTimeAgo }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showHearts, setShowHearts] = useState(false);

  // Predefined moods with emojis (same as in CreatePostModal)
  const moods = [
    { id: "happy", emoji: "😊", label: "Happy" },
    { id: "grateful", emoji: "🙏", label: "Grateful" },
    { id: "blessed", emoji: "✨", label: "Blessed" },
    { id: "excited", emoji: "🎉", label: "Excited" },
    { id: "peaceful", emoji: "☮️", label: "Peaceful" },
    { id: "thoughtful", emoji: "🤔", label: "Thoughtful" },
    { id: "inspired", emoji: "💡", label: "Inspired" },
    { id: "hopeful", emoji: "🌟", label: "Hopeful" },
  ];

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    if (newLikedState) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1000);
    }
    
    onLike(post.id, isLiked);
  };

  const displayName = post.profiles?.display_name || 
    `${post.profiles?.first_name} ${post.profiles?.last_name}`.trim() || 
    'Unknown User';

  const initials = post.profiles?.first_name?.[0] + (post.profiles?.last_name?.[0] || '');

  const selectedMood = post.mood ? moods.find(mood => mood.id === post.mood) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-500 bg-card/80 backdrop-blur-sm border border-border/30">
        {/* Post Header */}
        <div className="p-5 pb-4 bg-gradient-glow/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/40">
                  <AvatarImage src={post.profiles?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {post.is_trending && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-background rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors">
                    {displayName}
                  </h3>
                  {selectedMood && (
                    <Badge variant="outline" className="bg-background/50 border-border/30 text-xs">
                      <span className="mr-1">{selectedMood.emoji}</span>
                      {selectedMood.label}
                    </Badge>
                  )}
                  {post.is_trending && (
                    <Badge variant="secondary" className="bg-gradient-primary/10 text-primary border-primary/20 text-xs shadow-sm">
                      ✨ Trending
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {post.location && (
                    <>
                      <span className="truncate max-w-24">{post.location}</span>
                      <span>•</span>
                    </>
                  )}
                  <time>{formatTimeAgo(post.created_at)}</time>
                </div>
              </div>
            </div>

            {currentUserId === post.user_id && (
              <PostMenu
                postId={post.id}
                onEdit={() => onEdit(post)}
                onDelete={() => onDelete(post.id)}
              />
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="px-5 pb-4 bg-gradient-to-b from-transparent to-card/20">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-3 hover:line-clamp-none transition-all duration-300 cursor-pointer">
            {post.content}
          </p>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.hashtags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors cursor-pointer text-xs"
                >
                  <Hash className="w-2.5 h-2.5 mr-0.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="px-5 pb-4">
            <div className="relative overflow-hidden rounded-2xl bg-muted shadow-inner">
              <img 
                src={post.image_url} 
                alt="Post image" 
                className="w-full h-auto max-h-96 object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="px-5 py-4 border-t border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Heart 
                    className={`w-5 h-5 transition-all duration-200 ${
                      isLiked ? 'fill-current scale-110' : ''
                    }`} 
                  />
                  <AnimatePresence>
                    {showHearts && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0, 1.2, 0],
                              x: Math.random() * 40 - 20,
                              y: -Math.random() * 30 - 10
                            }}
                            transition={{ 
                              duration: 0.8,
                              delay: i * 0.1,
                              ease: "easeOut"
                            }}
                            className="absolute"
                          >
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="font-medium text-sm">{likesCount}</span>
              </motion.button>
              
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium text-sm">{post.comments_count}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-accent/10 hover:text-accent transition-all duration-200 hover:scale-105">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PostCard;