import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-500 bg-card/50 backdrop-blur-sm">
        {/* Post Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
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
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {displayName}
                  </h3>
                  {post.is_trending && (
                    <Badge variant="secondary" className="bg-gradient-primary/10 text-primary border-primary/20 text-xs">
                      Trending
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
        <div className="px-5 pb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="px-5 pb-4">
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <img 
                src={post.image_url} 
                alt="Post image" 
                className="w-full h-auto max-h-80 object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="px-5 py-4 border-t border-border/50 bg-gradient-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
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
              
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium text-sm">{post.comments_count}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
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